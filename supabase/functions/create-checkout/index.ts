import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const {
      brand,
      productName,
      totalPrice, // all-in price in USD cents
      currency = "usd",
      imageUrl,
      seller,
      priceBreakdown, // { base, duty, shipping }
    } = await req.json();

    if (!brand || !totalPrice) {
      throw new Error("Missing required fields: brand, totalPrice");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const itemName = `${brand}${productName ? ` - ${productName}` : ""}`;
    const description = seller
      ? `via ${seller} | Base: $${(priceBreakdown?.base / 100 || 0).toFixed(2)} + Duty: $${(priceBreakdown?.duty / 100 || 0).toFixed(2)} + Shipping: $${(priceBreakdown?.shipping / 100 || 0).toFixed(2)}`
      : undefined;

    const lineItem: any = {
      price_data: {
        currency,
        product_data: {
          name: itemName,
          ...(description ? { description } : {}),
          ...(imageUrl ? { images: [imageUrl] } : {}),
        },
        unit_amount: totalPrice, // already in cents
      },
      quantity: 1,
    };

    const session = await stripe.checkout.sessions.create({
      line_items: [lineItem],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        brand,
        product_name: productName || "",
        seller: seller || "",
      },
    });

    console.log("[CREATE-CHECKOUT] Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
