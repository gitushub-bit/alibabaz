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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { productId } = await req.json();
    if (!productId) {
      return new Response(JSON.stringify({ success: false, error: "Missing productId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Fetch product
    const { data: product } = await supabase
      .from("products")
      .select("id, title, slug, category, images")
      .eq("id", productId)
      .single();

    if (!product) {
      return new Response(JSON.stringify({ success: false, error: "Product not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Your intelligent scraping logic goes here
    // For now: just mark it as low confidence + needs image
    await supabase.from("products").update({
      images: [],
      image_confidence: "low",
      image_approved: false,
      image_review_notes: "Re-scrape requested",
    }).eq("id", productId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Re-scrape triggered. Product will be processed on next cron run.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
