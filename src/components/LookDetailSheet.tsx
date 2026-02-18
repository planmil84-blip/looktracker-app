import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ScanLine, Heart } from "lucide-react";
import type { CelebLook } from "@/data/mockData";

interface LookDetailSheetProps {
  look: CelebLook | null;
  onClose: () => void;
  onScanLook?: (look: CelebLook) => void;
}

const LookDetailSheet = ({ look, onClose, onScanLook }: LookDetailSheetProps) => {
  const [liked, setLiked] = useState(false);

  if (!look) return null;

  return (
    <AnimatePresence>
      {look && (
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div>
                <h2 className="font-display font-bold text-lg">{look.celeb}</h2>
                <p className="text-xs text-muted-foreground">{look.event}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    liked ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="px-5 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                Identified Items ({look.items.length})
              </p>
              {look.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.inStock ? (
                        <span className="text-[10px] font-bold text-badge-in-stock">● In Stock</span>
                      ) : (
                        <span className="text-[10px] font-bold text-accent">● Sold Out</span>
                      )}
                    </div>
                    <p className="text-sm font-display font-bold">{item.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.model}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-display font-bold">
                        ${item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${item.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">via {item.retailer}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Full-width Scan Analysis CTA */}
            <div className="px-5 pb-8">
              <button
                onClick={() => {
                  onClose();
                  onScanLook?.(look);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-foreground text-background text-sm font-display font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                <ScanLine className="w-4 h-4" />
                Scan & Analyze Full Look
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LookDetailSheet;
