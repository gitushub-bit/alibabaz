import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = roleData?.map(r => r.role) || [];
    const isAdmin = roles.includes("admin") || roles.includes("super_admin");
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productId, mode = "overwrite" } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI content using tool calling for structured output
    const systemPrompt = `You are an expert product content writer for an e-commerce B2B marketplace. 
Generate compelling, SEO-optimized content for products. 
Be professional, highlight key benefits, and make content suitable for business buyers.
Always provide accurate, helpful content that would appeal to wholesale buyers.`;

    const userPrompt = `Generate comprehensive content for this product:

Product Title: ${product.title}
Current Description: ${product.description || "No description provided"}
Price Range: ${product.price_min ? `$${product.price_min}` : "N/A"} - ${product.price_max ? `$${product.price_max}` : "N/A"}
Minimum Order: ${product.moq || 1} ${product.unit || "piece"}(s)
Specifications: ${product.specifications ? JSON.stringify(product.specifications) : "None"}
Tags: ${product.tags?.join(", ") || "None"}

Generate:
1. A compelling product description (2-3 paragraphs)
2. 5-7 key features as bullet points
3. Technical specifications (if applicable based on product type)
4. SEO title (under 60 characters)
5. Meta description (under 160 characters)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_content",
              description: "Generate structured product content for e-commerce",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "Compelling product description in 2-3 paragraphs",
                  },
                  features: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-7 key product features as bullet points",
                  },
                  specifications: {
                    type: "object",
                    description: "Technical specifications as key-value pairs",
                    additionalProperties: { type: "string" },
                  },
                  seo_title: {
                    type: "string",
                    description: "SEO-optimized title under 60 characters",
                  },
                  meta_description: {
                    type: "string",
                    description: "Meta description under 160 characters",
                  },
                },
                required: ["description", "features", "seo_title", "meta_description"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_product_content" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI generation failed");
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "generate_product_content") {
      throw new Error("Invalid AI response format");
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);

    // Prepare update data based on mode
    const currentVersion = product.ai_generation_version || 0;
    
    let updateData: Record<string, unknown>;
    
    if (mode === "append" && product.ai_description) {
      updateData = {
        ai_description: `${product.ai_description}\n\n---\n\n${generatedContent.description}`,
        ai_features: [...(product.ai_features || []), ...generatedContent.features],
        ai_specifications: { ...(product.ai_specifications || {}), ...generatedContent.specifications },
        seo_title: generatedContent.seo_title,
        meta_description: generatedContent.meta_description,
        ai_generated_at: new Date().toISOString(),
        ai_generation_version: currentVersion + 1,
      };
    } else {
      updateData = {
        ai_description: generatedContent.description,
        ai_features: generatedContent.features,
        ai_specifications: generatedContent.specifications || {},
        seo_title: generatedContent.seo_title,
        meta_description: generatedContent.meta_description,
        ai_generated_at: new Date().toISOString(),
        ai_generation_version: currentVersion + 1,
      };
    }

    // Update product with generated content
    const { error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to save generated content");
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        version: currentVersion + 1,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
