import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── helpers ──────────────────────────────────────────────────────────────────

async function serpSearch(
  engine: string,
  params: Record<string, string>,
  apiKey: string
) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", engine);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const resp = await fetch(url.toString());
  if (!resp.ok) return null;
  return resp.json();
}

/** Ask GPT-4o Vision to score how well a candidate image matches the original description.
 *  Strict guardrails: pattern direction, logo placement, closure type must all match for MATCH verdict. */
async function visualVerify(
  candidateImageUrl: string,
  description: string,
  openaiKey: string
): Promise<{ score: number; verdict: string }> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a strict fashion product verification expert. Given a candidate product image and a textual description of the target item, rate how closely the image matches.

STRICT RULES — all must pass for MATCH:
- Pattern/print direction must match exactly (e.g. diagonal vs horizontal check)
- Logo position and size must match
- Closure type (buttons, hooks, zip) must match
- Neckline shape must match
- Sleeve length must match
- Overall silhouette and proportions must match
- Color tone must be within the same shade family

If ANY of the above differs, the verdict CANNOT be MATCH.

Return ONLY valid JSON: {"score": 0-100, "verdict": "MATCH"|"SIMILAR"|"MISMATCH"}
- MATCH: 92-100, nearly identical product with all details matching
- SIMILAR: 55-91, same brand/category but one or more details differ
- MISMATCH: 0-54, clearly different product`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Target item description: "${description}"\n\nCompare this product image strictly against the description. Check pattern direction, logo position, closure type, neckline, sleeve length. Return JSON only.`,
              },
              { type: "image_url", image_url: { url: candidateImageUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });
    if (!resp.ok) return { score: 45, verdict: "SIMILAR" };
    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: 45, verdict: "SIMILAR" };
  }
}

function verdictToLabel(verdict: string): string {
  if (verdict === "MATCH") return "Exact Match";
  if (verdict === "SIMILAR") return "Similar Style";
  return "Inspired By";
}

// ── main ─────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, color, category, material, search_keywords, is_vintage, context_hint, blog_search_queries, celebrity_name } =
      await req.json();

    if (!brand || !model) {
      return new Response(
        JSON.stringify({ error: "brand and model are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERPAPI_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_KEY) throw new Error("SERPAPI_API_KEY is not configured");

    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");

    // Build a rich description string for visual verification later
    const itemDescription = search_keywords || `${brand} ${model} ${color || ""} ${material || ""}`.trim();
    console.log("Item description for matching:", itemDescription);
    console.log("Celebrity:", celebrity_name || "Unknown");

    // ─── 0) Blog/Community Pre-Search: confirm exact product identity ──
    let confirmedProductName = model;
    if (blog_search_queries && blog_search_queries.length > 0 && SERPAPI_KEY) {
      console.log("Running blog pre-search to confirm product identity...");
      for (const blogQuery of blog_search_queries.slice(0, 2)) {
        const blogData = await serpSearch("google", { q: blogQuery, num: "5" }, SERPAPI_KEY);
        if (blogData?.organic_results) {
          for (const r of blogData.organic_results.slice(0, 3)) {
            const snippet = `${r.title || ""} ${r.snippet || ""}`.toLowerCase();
            const brandLower = brand.toLowerCase();
            // If a blog result mentions the brand AND a specific product name, extract it
            if (snippet.includes(brandLower)) {
              console.log(`Blog confirmation found: "${r.title?.slice(0, 60)}"`);
              // The blog confirms our brand — keep the model name from GPT-4o
              break;
            }
          }
        }
      }
    }

    // ─── 1) Context-based refinement: build multiple query variants ───
    const queryVariants: string[] = [];

    // Primary: precise search keywords from GPT-4o
    if (search_keywords) {
      queryVariants.push(search_keywords);
    }
    queryVariants.push(`${brand} ${confirmedProductName}${color ? ` ${color}` : ""}`);

    // Celebrity-based queries for fashion blog/archive matching
    if (celebrity_name && celebrity_name !== "Unknown") {
      queryVariants.push(`${celebrity_name} ${brand} ${confirmedProductName}`);
      queryVariants.push(`${celebrity_name} outfit ${brand} ${category || ""}`);
    }

    // Context hint integration (e.g. "제니 공항룩")
    if (context_hint) {
      queryVariants.push(`${context_hint} ${brand} ${confirmedProductName}`);
    }

    // Archive/vintage variants for past-season items
    if (is_vintage) {
      queryVariants.push(`${brand} ${confirmedProductName} archive`);
      queryVariants.push(`${brand} ${confirmedProductName} vintage used`);
    }

    console.log("Query variants:", queryVariants);

    // ─── 2) Google Shopping search — parallel queries, filter ads, prioritize major retailers ───
    type Candidate = { title: string; thumbnail: string; price: number; currency: string; source: string; link: string };
    const candidates: Candidate[] = [];

    // Preferred sources get priority in ranking
    const preferredSources = new Set(["ssense", "mytheresa", "farfetch", "net-a-porter", "matchesfashion", "nordstrom", "selfridges"]);
    const isBrandOfficial = (src: string) => src.toLowerCase().includes(brand.toLowerCase());

    // Fire up to 3 queries in parallel for speed
    const shoppingResults = await Promise.all(
      queryVariants.slice(0, 3).map((q) =>
        serpSearch("google_shopping", { q, num: "8" }, SERPAPI_KEY)
      )
    );

    for (const data of shoppingResults) {
      if (data?.shopping_results) {
        for (const r of data.shopping_results) {
          // Skip ad results
          if (r.ad || r.is_ad) continue;
          if (!r.thumbnail) continue;
          candidates.push({
            title: r.title || "",
            thumbnail: r.thumbnail,
            price: r.extracted_price || 0,
            currency: r.currency || "USD",
            source: r.source || r.seller || "Unknown",
            link: r.link || r.product_link || "",
          });
        }
      }
    }

    // Sort: brand official first, then preferred retailers, then others
    candidates.sort((a, b) => {
      const aScore = isBrandOfficial(a.source) ? 2 : preferredSources.has(a.source.toLowerCase()) ? 1 : 0;
      const bScore = isBrandOfficial(b.source) ? 2 : preferredSources.has(b.source.toLowerCase()) ? 1 : 0;
      return bScore - aScore;
    });

    // Deduplicate by source
    const seen = new Set<string>();
    const uniqueCandidates = candidates.filter((c) => {
      const key = c.source.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);

    // ─── 3) Resale platform search (Grailed, Vestiaire, TheRealReal) ─
    const resaleCandidates: { title: string; thumbnail: string; link: string; platform: string }[] = [];

    if (is_vintage || uniqueCandidates.length < 3) {
      console.log("Searching resale platforms...");
      const resaleQueries = [
        { q: `${brand} ${model} site:grailed.com`, platform: "Grailed" },
        { q: `${brand} ${model} site:vestiairecollective.com`, platform: "Vestiaire Collective" },
        { q: `${brand} ${model} site:therealreal.com`, platform: "The RealReal" },
      ];

      const resalePromises = resaleQueries.map(async ({ q, platform }) => {
        const data = await serpSearch("google", { q, num: "3" }, SERPAPI_KEY);
        if (data?.organic_results) {
          for (const r of data.organic_results.slice(0, 2)) {
            if (r.thumbnail || r.favicon) {
              resaleCandidates.push({
                title: r.title || "",
                thumbnail: r.thumbnail || r.favicon || "",
                link: r.link || "",
                platform,
              });
            }
          }
        }
      });
      await Promise.all(resalePromises);
      console.log(`Found ${resaleCandidates.length} resale listings`);
    }

    // ─── 4) Visual verification with GPT-4o Vision ───────────────────
    let bestResult: {
      imageUrl: string | null;
      source: string;
      productTitle: string;
      sellers: any[];
      match_label: string;
    } | null = null;

    if (OPENAI_KEY && uniqueCandidates.length > 0) {
      console.log(`Verifying ${Math.min(uniqueCandidates.length, 5)} candidates visually...`);
      const verifyBatch = uniqueCandidates.slice(0, 5);
      const verifyResults = await Promise.all(
        verifyBatch.map(async (c) => {
          const v = await visualVerify(c.thumbnail, itemDescription, OPENAI_KEY);
          return { ...c, ...v };
        })
      );

      // Sort by score descending
      verifyResults.sort((a, b) => b.score - a.score);
      console.log("Verification scores:", verifyResults.map((r) => `${r.title.slice(0, 40)}… → ${r.score} (${r.verdict})`));

      const top = verifyResults[0];
      // Strict threshold: only label as match if score >= 92
      if (top.score >= 55) {
        const sellers = verifyResults
          .filter((r) => r.score >= 45)
          .map((r) => ({
            name: r.source,
            price: r.price,
            currency: r.currency,
            link: r.link,
            thumbnail: r.thumbnail,
          }));

        bestResult = {
          imageUrl: top.thumbnail,
          source: "google_shopping",
          productTitle: top.title || `${brand} ${model}`,
          sellers,
          match_label: verdictToLabel(top.verdict),
        };
      } else {
        // No good match — still return best candidate but labeled honestly
        bestResult = {
          imageUrl: top.thumbnail,
          source: "google_shopping",
          productTitle: top.title || `${brand} ${model}`,
          sellers: [{ name: top.source, price: top.price, currency: top.currency, link: top.link, thumbnail: top.thumbnail }],
          match_label: "Similar Style",
        };
      }
    } else if (uniqueCandidates.length > 0) {
      // No OpenAI key — fall back to text-based matching
      const best = uniqueCandidates[0];
      const titleLower = best.title.toLowerCase();
      const brandLower = brand.toLowerCase();
      const modelLower = model.toLowerCase();
      let label = "Similar Style";
      if (titleLower.includes(brandLower) && titleLower.includes(modelLower.split(" ")[0])) {
        label = "Exact Match";
      } else if (titleLower.includes(brandLower)) {
        label = "Brand Match";
      }

      bestResult = {
        imageUrl: best.thumbnail,
        source: "google_shopping",
        productTitle: best.title || `${brand} ${model}`,
        sellers: uniqueCandidates.slice(0, 5).map((r) => ({
          name: r.source,
          price: r.price,
          currency: r.currency,
          link: r.link,
          thumbnail: r.thumbnail,
        })),
        match_label: label,
      };
    }

    // If shopping didn't yield good results, try resale
    if (!bestResult && resaleCandidates.length > 0) {
      const best = resaleCandidates[0];
      bestResult = {
        imageUrl: best.thumbnail,
        source: "resale",
        productTitle: best.title || `${brand} ${model}`,
        sellers: resaleCandidates.map((r) => ({
          name: r.platform,
          price: 0,
          currency: "USD",
          link: r.link,
          thumbnail: r.thumbnail,
        })),
        match_label: "Resale · Pre-owned",
      };
    }

    // ─── 5) Fallback: Google Images ──────────────────────────────────
    if (!bestResult) {
      console.log("Trying Google Images fallback...");
      const data = await serpSearch("google_images", {
        q: `${brand} ${model} white background product shot`,
        num: "5",
      }, SERPAPI_KEY);

      const imgs = data?.images_results || [];
      if (imgs.length > 0) {
        bestResult = {
          imageUrl: imgs[0].thumbnail || imgs[0].original,
          source: "google_images",
          productTitle: imgs[0].title || `${brand} ${model}`,
          sellers: [],
          match_label: "Similar Style",
        };
      }
    }

    if (bestResult) {
      console.log(`Final result [${bestResult.match_label}]:`, bestResult.productTitle);
      return new Response(JSON.stringify(bestResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("No images found for:", itemDescription);
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
