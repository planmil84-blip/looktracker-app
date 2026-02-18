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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a world-class fashion identification expert specializing in luxury and K-fashion brands. Given an image, meticulously analyze every visible clothing item, accessory, bag, and shoe worn by each person.

For EACH item, return:
- brand: The exact brand name (e.g. "Jacquemus", "Miu Miu", "Nike"). If uncertain, provide your best guess with reasoning.
- model: The specific product/model name (e.g. "La Maille Valensole Knit Top", "Air Force 1 '07"). Be as precise as possible.
- category: One of "Tops", "Outerwear", "Bottoms", "Dresses", "Shoes", "Bags", "Accessories", "Jewelry", "Eyewear", "Headwear"
- color: The exact color name (e.g. "Sage Green", "Ivory", "Black")
- material: Primary material composition (e.g. "70% Viscose, 30% Polyamide", "100% Leather")
- hsCode: The 6-digit HS tariff code for customs classification (e.g. "6110.30" for knitted tops, "6402.99" for rubber footwear)
- hsDescription: A short description of the HS classification (e.g. "Knitted garments of man-made fibres")
- estimatedPrice: Estimated retail price in USD (integer)
- confidence: Your confidence percentage 0-100

Be thorough — identify ALL visible items, not just the most prominent one. If a brand logo or label is visible, use it. If not, use design cues, silhouette, and styling context.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify all fashion items in this image. Analyze the brand, model, color, material, and customs classification for each item. Return JSON array.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 3000,
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
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
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
