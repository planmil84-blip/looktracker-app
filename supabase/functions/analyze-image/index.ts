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
    const { imageBase64, context } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const userText = context
      ? `Identify all fashion items in this image. The user provided this context: "${context}". Use this hint to improve accuracy. Return ONLY a valid JSON array.`
      : `Identify all fashion items in this image. Return ONLY a valid JSON array.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a world-class fashion archive specialist who tracks celebrity wardrobes globally in real-time. You combine the uploaded image with any user-provided text context to pinpoint the exact products.

For EACH visible clothing item, accessory, bag, and shoe, return a JSON object with these fields:
- brand: Exact brand name (e.g. "Jacquemus", "Miu Miu")
- product_name: The precise model/product name (e.g. "La Maille Valensole Knit Top")
- search_keywords: A highly specific Google Shopping search string combining brand + product name + distinguishing visual details (e.g. "Burberry Vintage Check Cropped Cardigan V-neck button-down beige wool"). Include neckline, closure type, pattern, distinguishing features. This is critical for accurate product matching.
- collection: Season and collection info (e.g. "24FW", "Resort 2025", "SS24"). Use "N/A" if unknown.
- category: One of "Tops", "Outerwear", "Bottoms", "Dresses", "Shoes", "Bags", "Accessories", "Jewelry", "Eyewear", "Headwear"
- color: Exact color name (e.g. "Sage Green")
- material: Primary material composition (e.g. "70% Viscose, 30% Polyamide")
- hsCode: 6-digit HS tariff code (e.g. "6110.30")
- hsDescription: Short HS classification description
- original_price: Estimated retail price in USD (integer)
- official_status: Availability status — one of "In Stock", "Sold Out", "Limited Edition", "Discontinued"
- resale_market: Brief resale market note (e.g. "Active listings on Vestiaire & Grailed, avg $280-350")
- confidence: Confidence percentage 0-100
- is_vintage: Boolean — true if the item appears to be from a past season (2+ seasons old) or is a classic/archival piece

Be thorough — identify ALL visible items. If a brand logo or label is visible, use it. If not, use design cues, silhouette, and styling context.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText.slice(0, 500));
      throw new Error(`AI gateway returned ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let items;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      items = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      items = [];
    }

    console.log(`Successfully analyzed image: ${Array.isArray(items) ? items.length : 0} items found`);

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
