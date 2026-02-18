import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, color, category, material, search_keywords, is_vintage } = await req.json();

    if (!brand || !model) {
      return new Response(
        JSON.stringify({ error: "brand and model are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERPAPI_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_KEY) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }

    // Use GPT-4o generated precise search keywords if available
    const searchQuery = search_keywords || `${brand} ${model}${color ? ` ${color}` : ""} official product`;
    console.log("Precise search query:", searchQuery);

    let match_label = "Exact Match";

    // Step 1: Google Shopping search
    const shoppingUrl = new URL("https://serpapi.com/search.json");
    shoppingUrl.searchParams.set("engine", "google_shopping");
    shoppingUrl.searchParams.set("q", searchQuery);
    shoppingUrl.searchParams.set("num", "5");
    shoppingUrl.searchParams.set("api_key", SERPAPI_KEY);

    const shoppingResp = await fetch(shoppingUrl.toString());

    if (shoppingResp.ok) {
      const shoppingData = await shoppingResp.json();
      const results = shoppingData.shopping_results || [];

      if (results.length > 0) {
        // Check title similarity to determine match quality
        const best = results[0];
        const titleLower = (best.title || "").toLowerCase();
        const brandLower = brand.toLowerCase();
        const modelLower = model.toLowerCase();

        if (titleLower.includes(brandLower) && titleLower.includes(modelLower.split(" ")[0])) {
          match_label = "Exact Match";
        } else if (titleLower.includes(brandLower)) {
          match_label = "Brand Match";
        } else {
          match_label = "Similar Style";
        }

        const imageUrl = best.thumbnail || null;
        const sellers = results.slice(0, 5).map((r: any) => ({
          name: r.source || r.seller || "Unknown",
          price: r.extracted_price || 0,
          currency: r.currency || "USD",
          link: r.link || r.product_link || "",
          thumbnail: r.thumbnail || "",
        }));

        console.log(`Found product [${match_label}]:`, best.title);
        return new Response(
          JSON.stringify({
            imageUrl,
            source: "google_shopping",
            productTitle: best.title || `${brand} ${model}`,
            sellers,
            match_label,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Step 2: If vintage/past-season, search resale platforms
    if (is_vintage) {
      console.log("Item is vintage — searching resale platforms...");
      const resaleQueries = [
        `${brand} ${model} site:vestiairecollective.com`,
        `${brand} ${model} site:therealreal.com`,
      ];

      for (const rq of resaleQueries) {
        const resaleUrl = new URL("https://serpapi.com/search.json");
        resaleUrl.searchParams.set("engine", "google");
        resaleUrl.searchParams.set("q", rq);
        resaleUrl.searchParams.set("num", "3");
        resaleUrl.searchParams.set("api_key", SERPAPI_KEY);

        const resaleResp = await fetch(resaleUrl.toString());
        if (resaleResp.ok) {
          const resaleData = await resaleResp.json();
          const organic = resaleData.organic_results || [];
          if (organic.length > 0) {
            const best = organic[0];
            // Try to extract thumbnail
            const thumb = best.thumbnail || best.favicon || null;
            const platform = rq.includes("vestiaire") ? "Vestiaire Collective" : "The RealReal";
            console.log(`Found resale listing on ${platform}:`, best.title);
            return new Response(
              JSON.stringify({
                imageUrl: thumb,
                source: "resale",
                productTitle: best.title || `${brand} ${model}`,
                sellers: [{
                  name: platform,
                  price: 0,
                  currency: "USD",
                  link: best.link || "",
                  thumbnail: thumb || "",
                }],
                match_label: "Resale · Pre-owned",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // Step 3: Fallback to Google Images
    console.log("Trying Google Images fallback...");
    const imagesUrl = new URL("https://serpapi.com/search.json");
    imagesUrl.searchParams.set("engine", "google_images");
    imagesUrl.searchParams.set("q", `${brand} ${model} white background product shot`);
    imagesUrl.searchParams.set("num", "5");
    imagesUrl.searchParams.set("api_key", SERPAPI_KEY);

    const imagesResp = await fetch(imagesUrl.toString());

    if (imagesResp.ok) {
      const imagesData = await imagesResp.json();
      const imageResults = imagesData.images_results || [];

      if (imageResults.length > 0) {
        const bestImage = imageResults[0];
        console.log("Found product image via Google Images");
        return new Response(
          JSON.stringify({
            imageUrl: bestImage.thumbnail || bestImage.original,
            source: "google_images",
            productTitle: bestImage.title || `${brand} ${model}`,
            sellers: [],
            match_label: "Similar Style",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // No results
    console.log("No images found for:", searchQuery);
    return new Response(
      JSON.stringify({ imageUrl: null, source: "none", sellers: [], match_label: "No Match" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("search-product-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
