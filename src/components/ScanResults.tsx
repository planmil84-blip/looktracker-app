import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface ScanResult {
  brand: string;
  model: string;
  price: number;
  inStock: boolean;
  confidence: number;
  top: number;
  left: number;
}

interface ScanResultsProps {
  results: ScanResult[];
}

const ScanResults = ({ results }: ScanResultsProps) => {
  return (
    <>
      {results.map((result, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.3, duration: 0.4 }}
          className="absolute z-20"
          style={{ top: `${result.top}%`, left: `${result.left}%` }}
        >
          {/* Dot indicator */}
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
            <div className="w-3 h-3 rounded-full bg-accent/50 absolute inset-0 animate-ping" />
          </div>

          {/* Tag card */}
          <div className="absolute top-4 left-2 bg-background/90 backdrop-blur-md border border-border rounded-lg p-3 min-w-[180px] shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {result.confidence}% match
              </span>
              {result.inStock ? (
                <span className="text-[10px] font-semibold text-badge-in-stock uppercase">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-accent uppercase">
                  Sold Out
                </span>
              )}
            </div>
            <p className="text-xs font-display font-bold">{result.brand}</p>
            <p className="text-[11px] text-muted-foreground">{result.model}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-display font-bold">
                ${result.price.toLocaleString()}
              </span>
              <button className="flex items-center gap-1 text-[10px] text-accent hover:underline">
                {result.inStock ? "Shop" : "Find Used"}
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default ScanResults;
