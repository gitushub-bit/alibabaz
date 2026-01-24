import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------- HELPERS ----------
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);

const hashBuffer = async (buffer: ArrayBuffer): Promise<string> => {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// ---------- PLACEHOLDERS ----------
const categoryPlaceholders: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35d6?w=800",
  fashion: "https://images.unsplash.com/photo-1521334884684-d80222895322?w=800",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
  home: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
};

// ---------- SCRAPERS ----------
const scrapeUnsplash = async (query: string): Promise<string | null> => {
  const res = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0 ProductBot" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const matches = [...html.matchAll(/src="(https:\/\/images\.unsplash\.com[^"]+)"/g)];
  return matches.find((m) => m[1].includes("w=800"))?.[1] || null;
};

const scrapePexels = async (query: string): Promise<string | null> => {
  const res = await fetch(`https://www.pexels.com/search/${encodeURIComponent(query)}/`, {
    headers: { "User-Agent": "Mozilla/5.0 ProductBot" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/https:\/\/images\.pexels\.com[^"]+/);
  return match?.[0] || null;
};

// ---------- MAIN ----------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, images, category")
    .eq("published", true);

  let assigned = 0;
  let flagged = 0;

  for (const product of products || []) {
    if (product.images?.length) continue;

    let imageUrl: string | null = null;
    let confidence = "high";

    const category = product.category?.toLowerCase() || "default";
    const query = `${product.title} ${category} product isolated`;

    imageUrl = await scrapeUnsplash(query);
    if (!imageUrl) imageUrl = await scrapePexels(query);
    if (!imageUrl) {
      imageUrl = categoryPlaceholders[category] || categoryPlaceholders.default;
      confidence = "low";
    }

    try {
      const res = await fetch(imageUrl);
      const buffer = await res.arrayBuffer();

      if (buffer.byteLength < 40_000) confidence = "low";

      const hash = await hashBuffer(buffer);

      const { data: exists } = await supabase
        .from("product_image_hashes")
        .select("id")
        .eq("hash", hash)
        .maybeSingle();

      if (exists) continue; // deduplicated

      const slug = product.slug || generateSlug(product.title);
      const path = `products/${slug}/${Date.now()}.jpg`;

      await supabase.storage
        .from("products")
        .upload(path, buffer, { contentType: "image/jpeg" });

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(path);

      await supabase.from("products").update({
        images: [data.publicUrl],
        image_confidence: confidence,
        updated_at: new Date().toISOString(),
      }).eq("id", product.id);

      await supabase.from("product_image_hashes").insert({
        product_id: product.id,
        hash,
      });

      assigned++;
      if (confidence === "low") flagged++;
    } catch {
      continue;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      imagesAssigned: assigned,
      lowConfidenceFlagged: flagged,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
