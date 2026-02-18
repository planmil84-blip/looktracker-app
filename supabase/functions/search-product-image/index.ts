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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Step 1: Try Firecrawl search for real official product images
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (FIRECRAWL_API_KEY) {
      try {
        const searchQuery = `${brand} ${model} official product shot white background`;
        console.log("Firecrawl search:", searchQuery);

        const fcResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5,
            scrapeOptions: { formats: ["links"] },
          }),
        });

        if (fcResponse.ok) {
          const fcData = await fcResponse.json();
          const results = fcData.data || [];
          for (const result of results) {
            const links = result.links || [];
            for (const link of links) {
              if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(link)) {
                try {
                  const imgCheck = await fetch(link, { method: "HEAD" });
                  if (imgCheck.ok && (imgCheck.headers.get("content-type") || "").startsWith("image/")) {
                    console.log("Found product image via Firecrawl:", link);
                    return new Response(
                      JSON.stringify({ imageUrl: link, source: "firecrawl" }),
                      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                    );
                  }
                } catch { /* skip */ }
              }
            }
          }
        }
        console.log("Firecrawl: no usable images, falling back to DALL-E");
      } catch (err) {
        console.error("Firecrawl failed:", err);
      }
    }

    // Step 2: Generate with DALL-E 3
    console.log("Generating product image with DALL-E 3:", brand, model);

    const colorDesc = color ? `, in ${color} color` : "";
    const materialDesc = material ? `, made of ${material}` : "";
    const categoryDesc = category || "fashion item";

    const prompt = `Professional e-commerce product photo of ${brand} ${model} (${categoryDesc})${colorDesc}${materialDesc}. Clean white background, studio lighting, high-resolution product shot. No text, no watermark, no human model. Photorealistic, editorial quality.`;

    const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!dalleResponse.ok) {
      const errorText = await dalleResponse.text();
      console.error("DALL-E error:", dalleResponse.status, errorText.slice(0, 500));
      throw new Error(`DALL-E generation failed: ${dalleResponse.status}`);
    }

    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("DALL-E returned no image URL");
    }

    console.log("Generated product image with DALL-E 3");
    return new Response(
      JSON.stringify({ imageUrl, source: "dalle" }),
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
