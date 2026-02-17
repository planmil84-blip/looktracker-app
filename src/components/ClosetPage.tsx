import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, TrendingDown, Trash2, ShoppingBag } from "lucide-react";

interface ClosetItem {
  id: string;
  brand: string;
  model: string;
  price: number;
  savedPrice: number;
  image: string;
  inStock: boolean;
  tracking: boolean;
  priceChange?: number;
}

const initialCloset: ClosetItem[] = [
  {
    id: "c1",
    brand: "JACQUEMUS",
    model: "La Maille Valensole Knit Top",
    price: 490,
    savedPrice: 490,
    image: "",
    inStock: false,
    tracking: true,
    priceChange: 0,
  },
  {
    id: "c2",
    brand: "Balenciaga",
    model: "Oversized Trench Coat",
    price: 3050,
    savedPrice: 3200,
    image: "",
    inStock: true,
    tracking: true,
    priceChange: -150,
  },
  {
    id: "c3",
    brand: "Bottega Veneta",
    model: "Puddle Boots",
    price: 950,
    savedPrice: 950,
    image: "",
    inStock: true,
    tracking: false,
    priceChange: 0,
  },
];

const ClosetPage = () => {
  const [items, setItems] = useState<ClosetItem[]>(initialCloset);

  const toggleTracking = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, tracking: !item.tracking } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold tracking-tight">My Closet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} saved items · {items.filter((i) => i.tracking).length} tracked
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-display font-semibold">Your closet is empty</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Scan or browse looks and save items here to track prices
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      {item.priceChange !== 0 && item.priceChange && (
                        <span
                          className={`text-[10px] font-bold flex items-center gap-0.5 ${
                            item.priceChange < 0 ? "text-checkout" : "text-accent"
                          }`}
                        >
                          <TrendingDown className={`w-3 h-3 ${item.priceChange > 0 ? "rotate-180" : ""}`} />
                          ${Math.abs(item.priceChange)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-display font-bold">{item.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.model}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-display font-bold">
                        ${item.price.toLocaleString()}
                      </span>
                      {item.price !== item.savedPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${item.savedPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => toggleTracking(item.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        item.tracking
                          ? "bg-gold/15 text-gold"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      title={item.tracking ? "Tracking enabled" : "Enable tracking"}
                    >
                      {item.tracking ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tracker alert description */}
                {item.tracking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-border"
                  >
                    <p className="text-[10px] text-gold uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Bell className="w-3 h-3" />
                      Tracker Alert Active
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      You'll be notified on price drops, restocks, and new pre-owned listings.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ClosetPage;
