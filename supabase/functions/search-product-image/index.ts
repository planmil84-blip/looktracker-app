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
    const { brand, model, color, category, material } = await req.json();

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

    // Build precise search query for real product images
    const colorPart = color ? ` ${color}` : "";
    const searchQuery = `${brand} ${model}${colorPart} official product`;
    console.log("SerpApi Google Shopping search:", searchQuery);

    // Step 1: Try Google Shopping for real product data
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
        // Pick the best result (first one is usually most relevant)
        const best = results[0];
        const imageUrl = best.thumbnail || null;
        const sellers = results.slice(0, 5).map((r: any) => ({
          name: r.source || r.seller || "Unknown",
          price: r.extracted_price || 0,
          currency: r.currency || "USD",
          link: r.link || r.product_link || "",
          thumbnail: r.thumbnail || "",
        }));

        console.log("Found real product via Google Shopping:", best.title);
        return new Response(
          JSON.stringify({
            imageUrl,
            source: "google_shopping",
            productTitle: best.title || `${brand} ${model}`,
            sellers,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Step 2: Fallback to Google Images search
    console.log("No shopping results, trying Google Images...");
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
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // No results at all
    console.log("No images found for:", searchQuery);
    return new Response(
      JSON.stringify({ imageUrl: null, source: "none", sellers: [] }),
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
