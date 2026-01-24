import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Country mappings for Global Industry Hub
const countryMappings: Record<string, { flag: string; specialty: string }> = {
  china: { flag: "🇨🇳", specialty: "Electronics & Manufacturing" },
  india: { flag: "🇮🇳", specialty: "Textiles & IT Services" },
  usa: { flag: "🇺🇸", specialty: "Technology & Innovation" },
  germany: { flag: "🇩🇪", specialty: "Engineering & Automotive" },
  japan: { flag: "🇯🇵", specialty: "Electronics & Robotics" },
  brazil: { flag: "🇧🇷", specialty: "Agriculture & Mining" },
  uk: { flag: "🇬🇧", specialty: "Finance & Pharmaceuticals" },
  france: { flag: "🇫🇷", specialty: "Luxury & Aerospace" },
  italy: { flag: "🇮🇹", specialty: "Fashion & Machinery" },
  canada: { flag: "🇨🇦", specialty: "Natural Resources" },
  mexico: { flag: "🇲🇽", specialty: "Automotive & Electronics" },
  korea: { flag: "🇰🇷", specialty: "Electronics & Shipbuilding" },
  vietnam: { flag: "🇻🇳", specialty: "Textiles & Electronics" },
  thailand: { flag: "🇹🇭", specialty: "Agriculture & Tourism" },
  indonesia: { flag: "🇮🇩", specialty: "Palm Oil & Mining" },
  turkey: { flag: "🇹🇷", specialty: "Textiles & Agriculture" },
  uae: { flag: "🇦🇪", specialty: "Trade & Logistics" },
  kenya: { flag: "🇰🇪", specialty: "Agriculture & Technology" },
  nigeria: { flag: "🇳🇬", specialty: "Oil & Agriculture" },
  southafrica: { flag: "🇿🇦", specialty: "Mining & Finance" },
};

// Simple keyword-based category matching
const categoryKeywords: Record<string, string[]> = {
  electronics: ["phone", "laptop", "computer", "tablet", "headphone", "earphone", "speaker", "cable", "charger", "battery", "power bank", "led", "usb", "bluetooth", "wireless", "smart", "watch", "camera", "drone", "gaming", "keyboard", "mouse", "monitor", "tv", "television", "audio", "video", "electronic"],
  clothing: ["shirt", "pants", "dress", "jacket", "coat", "sweater", "hoodie", "jeans", "skirt", "blouse", "suit", "tie", "shoes", "boots", "sneakers", "sandals", "socks", "underwear", "bra", "hat", "cap", "scarf", "gloves", "belt", "bag", "handbag", "purse", "wallet", "fashion", "apparel", "garment", "textile", "fabric", "cotton", "wool", "silk", "leather"],
  home: ["furniture", "chair", "table", "desk", "sofa", "bed", "mattress", "pillow", "blanket", "curtain", "carpet", "rug", "lamp", "light", "decor", "vase", "mirror", "clock", "frame", "shelf", "cabinet", "drawer", "kitchen", "cookware", "utensil", "plate", "bowl", "cup", "glass", "pot", "pan", "knife", "fork", "spoon", "appliance", "refrigerator", "microwave", "oven", "blender", "mixer", "toaster", "coffee", "vacuum", "iron", "fan", "heater", "air", "conditioner"],
  beauty: ["makeup", "cosmetic", "lipstick", "mascara", "foundation", "powder", "eyeshadow", "blush", "brush", "skincare", "cream", "lotion", "serum", "moisturizer", "cleanser", "toner", "mask", "sunscreen", "perfume", "fragrance", "cologne", "nail", "polish", "hair", "shampoo", "conditioner", "styling", "dryer", "straightener", "curler", "razor", "trimmer", "beauty", "salon", "spa"],
  sports: ["fitness", "gym", "exercise", "workout", "yoga", "mat", "dumbbell", "weight", "barbell", "treadmill", "bike", "bicycle", "cycle", "running", "jogging", "hiking", "camping", "tent", "sleeping", "backpack", "ball", "football", "basketball", "soccer", "tennis", "golf", "swimming", "swim", "surf", "ski", "snowboard", "skateboard", "sport", "athletic", "outdoor", "adventure"],
  toys: ["toy", "game", "puzzle", "doll", "action figure", "lego", "building", "block", "board game", "card", "plush", "stuffed", "remote control", "rc", "educational", "learning", "baby", "infant", "toddler", "kid", "child", "children"],
  automotive: ["car", "auto", "vehicle", "motorcycle", "bike", "truck", "tire", "wheel", "engine", "oil", "filter", "brake", "light", "headlight", "taillight", "mirror", "seat", "cover", "mat", "gps", "dash", "cam", "charger", "adapter", "tool", "repair", "part", "accessory", "automotive"],
  industrial: ["machine", "machinery", "equipment", "tool", "power tool", "drill", "saw", "hammer", "wrench", "screwdriver", "plier", "measure", "tape", "level", "safety", "glove", "helmet", "goggles", "vest", "boot", "industrial", "manufacturing", "factory", "warehouse", "construction", "building", "material", "steel", "metal", "plastic", "rubber", "pipe", "valve", "pump", "motor", "generator", "compressor", "welding", "cutting"],
  food: ["food", "beverage", "drink", "snack", "candy", "chocolate", "cookie", "biscuit", "chip", "nut", "dried", "fruit", "vegetable", "meat", "fish", "seafood", "dairy", "milk", "cheese", "butter", "egg", "bread", "rice", "pasta", "noodle", "sauce", "spice", "seasoning", "oil", "vinegar", "tea", "coffee", "juice", "water", "soda", "wine", "beer", "alcohol", "organic", "natural", "health", "supplement", "vitamin", "protein"],
  office: ["office", "stationery", "pen", "pencil", "marker", "highlighter", "eraser", "ruler", "scissors", "tape", "glue", "stapler", "clip", "binder", "folder", "file", "notebook", "paper", "envelope", "stamp", "ink", "printer", "cartridge", "toner", "desk", "chair", "cabinet", "shelf", "organizer", "calendar", "planner", "whiteboard", "bulletin", "label", "badge", "lanyard"],
};

// Generate a URL-friendly slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting auto-allocation job...");

    // Step 1: Fetch all categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id");

    if (catError) throw catError;

    // Build a map of category name/slug to ID
    const categoryMap = new Map<string, { id: string; name: string }>();
    for (const cat of categories || []) {
      categoryMap.set(cat.name.toLowerCase(), { id: cat.id, name: cat.name });
      categoryMap.set(cat.slug.toLowerCase(), { id: cat.id, name: cat.name });
    }

    // Step 2: Fetch all verified sellers (users with seller role)
    const { data: sellerRoles, error: sellerError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "seller");

    if (sellerError) throw sellerError;

    const sellerIds = (sellerRoles || []).map((r) => r.user_id);

    // Step 3: Fetch products that need allocation (missing category_id or have placeholder seller_id)
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, title, description, tags, seller_id, category_id")
      .or("category_id.is.null,seller_id.is.null");

    if (prodError) throw prodError;

    console.log(`Found ${products?.length || 0} products needing allocation`);

    let updatedCount = 0;
    let categoriesCreated = 0;
    let sellerIndex = 0;

    for (const product of products || []) {
      const updates: Record<string, any> = {};

      // --- Category Allocation ---
      if (!product.category_id) {
        const searchText = `${product.title || ""} ${product.description || ""} ${(product.tags || []).join(" ")}`.toLowerCase();

        let matchedCategoryId: string | null = null;
        let bestMatchKey: string | null = null;
        let maxScore = 0;

        // Score each category based on keyword matches
        for (const [categoryKey, keywords] of Object.entries(categoryKeywords)) {
          let score = 0;
          for (const keyword of keywords) {
            if (searchText.includes(keyword)) {
              score += 1;
            }
          }
          if (score > maxScore) {
            maxScore = score;
            bestMatchKey = categoryKey;
            // Try to find matching category in database
            for (const [catName, catInfo] of categoryMap) {
              if (catName.includes(categoryKey) || categoryKey.includes(catName)) {
                matchedCategoryId = catInfo.id;
                break;
              }
            }
          }
        }

        // If we found a category match
        if (matchedCategoryId) {
          updates.category_id = matchedCategoryId;
        } else if (bestMatchKey && maxScore > 0) {
          // Create a new subcategory based on the best match
          const parentCategory = categories?.find(c => 
            c.slug.toLowerCase().includes(bestMatchKey!) || 
            bestMatchKey!.includes(c.slug.toLowerCase())
          );

          // Extract potential subcategory name from product title
          const words = product.title.split(' ').slice(0, 2).join(' ');
          const subcategoryName = words.length > 3 ? words : `${bestMatchKey} - General`;
          const subcategorySlug = generateSlug(subcategoryName);

          // Check if this subcategory already exists
          const existingSubcat = categoryMap.get(subcategorySlug);
          if (existingSubcat) {
            updates.category_id = existingSubcat.id;
          } else {
            // Create new subcategory
            const { data: newCategory, error: createError } = await supabase
              .from("categories")
              .insert({
                name: subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1),
                slug: subcategorySlug,
                parent_id: parentCategory?.id || null,
              })
              .select()
              .single();

            if (!createError && newCategory) {
              updates.category_id = newCategory.id;
              categoryMap.set(subcategorySlug, { id: newCategory.id, name: newCategory.name });
              categoriesCreated++;
              console.log(`Created new subcategory: ${newCategory.name}`);
            }
          }
        } else if (categories && categories.length > 0) {
          // Fallback: assign to first category (General)
          updates.category_id = categories[0].id;
        }
      }

      // --- Seller Allocation ---
      if (!product.seller_id && sellerIds.length > 0) {
        // Round-robin distribution among sellers
        updates.seller_id = sellerIds[sellerIndex % sellerIds.length];
        sellerIndex++;
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("products")
          .update(updates)
          .eq("id", product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError.message);
        } else {
          updatedCount++;
          console.log(`Updated product ${product.id}:`, updates);
        }
      }
    }

    // Step 4: Populate Global Industry Hub with random products if empty or few items
    const { data: hubProducts } = await supabase
      .from("industry_hub_products")
      .select("id")
      .limit(10);

    if (!hubProducts || hubProducts.length < 10) {
      console.log("Populating Global Industry Hub with random products...");

      // Get random published products
      const { data: randomProducts } = await supabase
        .from("products")
        .select("id, title, images, price_min")
        .eq("published", true)
        .limit(50);

      if (randomProducts && randomProducts.length > 0) {
        const countries = Object.keys(countryMappings);
        const shuffledProducts = randomProducts.sort(() => Math.random() - 0.5);
        
        let hubInserts = [];
        let countryIndex = 0;

        for (let i = 0; i < Math.min(shuffledProducts.length, 20); i++) {
          const product = shuffledProducts[i];
          const countryKey = countries[countryIndex % countries.length];
          const countryInfo = countryMappings[countryKey];

          hubInserts.push({
            product_id: product.id,
            title: product.title,
            image: product.images?.[0] || null,
            price: product.price_min ? `$${product.price_min}` : "$0",
            country: countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
            country_flag: countryInfo.flag,
            specialty: countryInfo.specialty,
            is_active: true,
            sort_order: i,
          });

          countryIndex++;
        }

        if (hubInserts.length > 0) {
          const { error: hubError } = await supabase
            .from("industry_hub_products")
            .insert(hubInserts);

          if (hubError) {
            console.error("Failed to populate industry hub:", hubError.message);
          } else {
            console.log(`Added ${hubInserts.length} products to Global Industry Hub`);
          }
        }
      }
    }

    console.log(`Auto-allocation complete. Updated ${updatedCount} products, created ${categoriesCreated} subcategories.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-allocation complete. Updated ${updatedCount} products, created ${categoriesCreated} subcategories.`,
        productsProcessed: products?.length || 0,
        productsUpdated: updatedCount,
        subcategoriesCreated: categoriesCreated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Auto-allocation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});