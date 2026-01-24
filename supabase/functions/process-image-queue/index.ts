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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get pending items (max 10 per run)
  const { data: queueItems, error: fetchError } = await supabase
    .from("image_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(10);

  if (fetchError) {
    return new Response(
      JSON.stringify({ success: false, error: fetchError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!queueItems || queueItems.length === 0) {
    return new Response(
      JSON.stringify({ success: true, processed: 0, message: "No items in queue" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let processed = 0;
  let failed = 0;

  for (const item of queueItems) {

    // Mark as processing
    await supabase
      .from("image_queue")
      .update({ status: "processing", attempts: (item.attempts || 0) + 1 })
      .eq("id", item.id);

    try {
      // Download image
      const response = await fetch(item.source_url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ImageBot/1.0)",
          "Accept": "image/*,*/*;q=0.8"
        },
        // 20s timeout
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";

      if (!contentType.includes("image")) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const buffer = await response.arrayBuffer();

      // Allow small images
      // if (buffer.byteLength < 10000) {
      //   throw new Error(`Image too small: ${buffer.byteLength} bytes`);
      // }

      const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
      const timestamp = Date.now();

      const path = item.product_id
        ? `products/${item.product_id}/${timestamp}.${ext}`
        : `queue/${item.id}/${timestamp}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, buffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      // Update product images
      if (item.product_id) {
        const { data: product } = await supabase
          .from("products")
          .select("images")
          .eq("id", item.product_id)
          .single();

        const currentImages = product?.images || [];
        const newImages = [...currentImages, publicUrl].slice(0, 3);

        await supabase
          .from("products")
          .update({
            images: newImages,
          })
          .eq("id", item.product_id);
      }

      // Mark queue item completed
      await supabase
        .from("image_queue")
        .update({
          status: "completed",
          processed_url: publicUrl,
          processed_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", item.id);

      processed++;

    } catch (error: any) {
      const attempts = (item.attempts || 0) + 1;
      const newStatus = attempts >= 3 ? "failed" : "pending";

      await supabase
        .from("image_queue")
        .update({
          status: newStatus,
          error: error.message,
          attempts,
        })
        .eq("id", item.id);

      failed++;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed,
      failed,
      total: queueItems.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
