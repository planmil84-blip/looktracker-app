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
            content: `You are a fashion identification AI. Output ONLY valid JSON, no explanations.

Detect the celebrity (or "Unknown") and every visible fashion item.

Return this exact JSON shape:
{"celebrity_name":"...","items":[...]}

Each item object:
{"brand":"","product_name":"","search_keywords":"brand + product + visual details for Google Shopping","blog_search_queries":["query1","query2"],"collection":"24FW or N/A","category":"Tops|Outerwear|Bottoms|Dresses|Shoes|Bags|Accessories|Jewelry|Eyewear|Headwear","color":"","material":"","hsCode":"6-digit","hsDescription":"","original_price":0,"official_status":"In Stock|Sold Out|Limited Edition|Discontinued","resale_market":"","confidence":0,"is_vintage":false}

Rules:
- search_keywords must include neckline, closure, pattern, distinguishing features
- blog_search_queries: 2-3 queries mixing celebrity name + brand + Korean/English
- Identify ALL visible items
- Use brand logos/labels when visible, design cues otherwise
- JSON only. No markdown, no code fences, no explanation.`,
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
        response_format: { type: "json_object" },
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

    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { celebrity_name: "Unknown", items: [] };
    }

    // Support both new format { celebrity_name, items } and legacy array format
    const celebrity_name = parsed.celebrity_name || "Unknown";
    const items = Array.isArray(parsed) ? parsed : (parsed.items || []);

    console.log(`Celebrity: ${celebrity_name}, Items found: ${items.length}`);

    return new Response(
      JSON.stringify({ celebrity_name, items }),
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
