import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CreditCard, Shield, Lock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import ShippingAddressSheet from "@/components/ShippingAddressSheet";
import type { ShippingAddress } from "@/contexts/UserContext";

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  item: {
    brand: string;
    model: string;
    price: number;
    imageUrl?: string;
    seller?: string;
    priceBreakdown?: { base: number; duty: number; shipping: number };
  } | null;
}

const CheckoutSheet = ({ open, onClose, item }: CheckoutSheetProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShipping, setShowShipping] = useState(false);
  const { shippingAddress, setShippingAddress } = useUser();

  const handleBuyClick = () => {
    setShowShipping(true);
  };

  const handleShippingConfirm = (addr: ShippingAddress) => {
    setShippingAddress(addr);
    setShowShipping(false);
    handleStripeCheckout(addr);
  };

  const handleStripeCheckout = async (addr?: ShippingAddress) => {
    if (!item) return;
    setProcessing(true);
    setError(null);

    const address = addr || shippingAddress;

    try {
      const totalCents = Math.round(item.price * 100);

      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: {
          brand: item.brand,
          productName: item.model,
          totalPrice: totalCents,
          currency: "usd",
          imageUrl: item.imageUrl,
          seller: item.seller,
          priceBreakdown: item.priceBreakdown
            ? {
                base: Math.round(item.priceBreakdown.base * 100),
                duty: Math.round(item.priceBreakdown.duty * 100),
                shipping: Math.round(item.priceBreakdown.shipping * 100),
              }
            : undefined,
          shippingAddress: address
            ? {
                name: address.recipientName,
                phone: address.phone,
                postalCode: address.postalCode,
                line1: address.address,
                line2: address.addressDetail,
                country: "KR",
              }
            : undefined,
        },
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "결제 세션 생성에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (!item) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/70 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 right-4 z-20 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-5 pb-8">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-3">
                  Quick Buy
                </p>

                {/* Order summary */}
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border mb-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`${item.brand} ${item.model}`}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold truncate">{item.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.model}</p>
                    {item.seller && (
                      <p className="text-[10px] text-muted-foreground/70 truncate">via {item.seller}</p>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                {item.priceBreakdown && (
                  <div className="space-y-1.5 mb-3 px-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Price</span>
                      <span>${item.priceBreakdown.base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Duties</span>
                      <span>${item.priceBreakdown.duty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Shipping</span>
                      <span>${item.priceBreakdown.shipping.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-border my-1" />
                  </div>
                )}

                {/* All-in price */}
                <div className="flex items-center justify-between mb-5 px-1">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
                    All-in Price
                  </span>
                  <span className="text-xl font-display font-bold text-accent">
                    ${item.price.toLocaleString()}
                  </span>
                </div>

                {/* Buy button → opens shipping first */}
                <button
                  onClick={handleBuyClick}
                  disabled={processing}
                  className="w-full py-3.5 rounded-xl bg-checkout text-checkout-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-checkout-hover transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-checkout-foreground/30 border-t-checkout-foreground rounded-full"
                    />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay ${item.price.toLocaleString()}
                      <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-muted-foreground text-center mt-2">
                  Stripe Test Mode · Use card 4242 4242 4242 4242
                </p>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] text-accent text-center mt-2"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span className="text-[10px]">Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px]">Buyer Protection</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShippingAddressSheet
        open={showShipping}
        onClose={() => setShowShipping(false)}
        onConfirm={handleShippingConfirm}
      />
    </>
  );
};

export default CheckoutSheet;
