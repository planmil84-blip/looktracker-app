import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, ShoppingBag, AlertTriangle, ArrowRight, Star } from "lucide-react";
import jacquemusKnit from "@/assets/jacquemus-knit.jpg";
import dupe1 from "@/assets/dupe-1.jpg";
import dupe2 from "@/assets/dupe-2.jpg";
import dupe3 from "@/assets/dupe-3.jpg";

interface ScanDetailSheetProps {
  open: boolean;
  onClose: () => void;
}

const retailers = [
  { name: "Jacquemus.com", label: "Official", price: null, status: "Sold Out", landed: null },
  { name: "Farfetch", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
  { name: "SSENSE", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
  { name: "Mytheresa", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
];

const preOwned = [
  {
    platform: "eBay",
    price: 280,
    condition: "Mint Condition",
    location: "United States",
    url: "https://www.ebay.com/sch/i.html?_nkw=jacquemus+la+maille+valensole",
  },
  {
    platform: "Vestiaire Collective",
    price: 310,
    condition: "Gently Used",
    location: "France",
    url: "https://www.vestiairecollective.com/search/?q=jacquemus%20valensole",
  },
];

const dupes = [
  { image: dupe1, brand: "Jacquemus", model: "La Maille Neve Ribbed Knit", price: 420, inStock: true },
  { image: dupe2, brand: "Jacquemus", model: "Le Haut Pralu Crop Top", price: 350, inStock: true },
  { image: dupe3, brand: "Jacquemus", model: "La Maille Rosa Knit", price: 390, inStock: false },
];

const ScanDetailSheet = ({ open, onClose }: ScanDetailSheetProps) => {
  const [bridgeTarget, setBridgeTarget] = useState<string | null>(null);

  const handlePreOwnedClick = (url: string, platform: string) => {
    setBridgeTarget(platform);
    setTimeout(() => {
      window.open(url, "_blank");
      setBridgeTarget(null);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-card z-10">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 z-20 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero product image */}
            <div className="px-5 pb-4">
              <div className="rounded-xl overflow-hidden bg-background aspect-[4/3] flex items-center justify-center">
                <img
                  src={jacquemusKnit}
                  alt="Jacquemus La Maille Valensole"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Item Identification */}
            <div className="px-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
                    AI Identified · 96% Match
                  </p>
                  <h2 className="font-display text-xl font-bold tracking-tight">JACQUEMUS</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    La Maille Valensole Knit Top
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Color: Sage Green</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-accent/30">
                    Rare
                  </span>
                  <span className="bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-accent/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Out of Stock
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-display font-bold">$490</span>
                <span className="text-xs text-muted-foreground">Retail Price</span>
              </div>
            </div>

            {/* Global Price Comparison */}
            <div className="px-5 pb-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-3">
                Global Price Comparison
              </p>
              <div className="space-y-2">
                {retailers.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-display font-semibold">{r.name}</p>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">
                          {r.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        * Landed cost (duties/shipping) not included
                      </p>
                    </div>
                    <span className="text-xs font-bold text-accent uppercase">Sold Out</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pre-owned Section — Highlighted */}
            <div className="px-5 pb-5">
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                  <p className="text-xs font-display font-bold uppercase tracking-[0.15em] text-accent">
                    Find Pre-Owned
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">
                  This item is no longer available new. Browse verified pre-owned listings below.
                </p>

                <div className="space-y-3">
                  {preOwned.map((item, i) => (
                    <motion.button
                      key={item.platform}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      onClick={() => handlePreOwnedClick(item.url, item.platform)}
                      className="w-full flex items-center justify-between p-4 bg-secondary/80 rounded-xl border border-border hover:border-accent/40 transition-all group relative overflow-hidden"
                    >
                      {/* Bridge animation overlay */}
                      <AnimatePresence>
                        {bridgeTarget === item.platform && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 bg-accent/10 origin-left z-0"
                          />
                        )}
                      </AnimatePresence>

                      <div className="relative z-10">
                        <p className="text-sm font-display font-bold text-left">{item.platform}</p>
                        <p className="text-xs text-muted-foreground text-left">
                          {item.condition} · {item.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 relative z-10">
                        <span className="text-base font-display font-bold">
                          ${item.price}
                        </span>
                        {bridgeTarget === item.platform ? (
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                          >
                            <ArrowRight className="w-4 h-4 text-accent" />
                          </motion.div>
                        ) : (
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Similar Styles / Dupes */}
            <div className="px-5 pb-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-3">
                Similar Styles · Jacquemus SS25
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {dupes.map((dupe, i) => (
                  <motion.div
                    key={dupe.model}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="min-w-[140px] flex-shrink-0"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-background mb-2 relative">
                      <img
                        src={dupe.image}
                        alt={dupe.model}
                        className="w-full h-full object-cover"
                      />
                      {!dupe.inStock && (
                        <span className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-display font-semibold truncate">{dupe.brand}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{dupe.model}</p>
                    <p className="text-xs font-display font-bold mt-0.5">${dupe.price}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScanDetailSheet;
