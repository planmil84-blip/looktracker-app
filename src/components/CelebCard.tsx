import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { CelebLook } from "@/data/mockData";

interface CelebCardProps {
  look: CelebLook;
  index: number;
  onClick: (look: CelebLook) => void;
}

const CelebCard = ({ look, index, onClick }: CelebCardProps) => {
  const hasOOS = look.items.some((item) => !item.inStock);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group cursor-pointer overflow-hidden rounded-lg bg-card relative"
      onClick={() => onClick(look)}
    >
      <div className="relative overflow-hidden">
        <img
          src={look.image}
          alt={`${look.celeb} at ${look.event}`}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badge */}
        {hasOOS && (
          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm">
            Rare
          </span>
        )}

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-muted-foreground mb-1">{look.event}</p>
          <p className="text-sm font-display font-semibold">{look.celeb}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {look.items.length} items identified
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3" />
              {look.likes > 1000
                ? `${(look.likes / 1000).toFixed(1)}k`
                : look.likes}
            </div>
          </div>
        </div>
      </div>

      {/* Below-image info (always visible) */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-display font-semibold tracking-tight">
            {look.celeb}
          </p>
          <span className="text-[10px] text-muted-foreground">{look.date}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {look.items.map((i) => i.brand).join(" · ")}
        </p>
      </div>
    </motion.div>
  );
};

export default CelebCard;
