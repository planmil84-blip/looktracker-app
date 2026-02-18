import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, ShoppingBag, AlertTriangle, ArrowRight, Star, Sparkles, Bookmark, BookmarkCheck, Globe, ChevronDown, Shield, ArrowDownRight, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutSheet from "./CheckoutSheet";
import { useLocale, countries, type Country } from "@/contexts/LocaleContext";
import type { AnalyzedItem } from "./ScanOverlay";

interface ScanDetailSheetProps {
  open: boolean;
  onClose: () => void;
  analyzedItems?: AnalyzedItem[];
}

const retailers = [
  { name: "Official Store", label: "Official", price: null, status: "Sold Out", landed: null },
  { name: "Farfetch", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
  { name: "SSENSE", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
  { name: "Mytheresa", label: "Edit Shop", price: null, status: "Sold Out", landed: null },
];

type Condition = "All" | "Brand New" | "Mint" | "Very Good" | "Fair";

const preOwned = [
  {
    platform: "eBay",
    price: 280,
    condition: "Mint" as Condition,
    location: "United States",
    url: "https://www.ebay.com/sch/",
    baseShipping: 25,
  },
  {
    platform: "Vestiaire Collective",
    price: 310,
    condition: "Very Good" as Condition,
    location: "France",
    url: "https://www.vestiairecollective.com/search/",
    baseShipping: 35,
  },
  {
    platform: "StockX",
    price: 350,
    condition: "Brand New" as Condition,
    location: "Global",
    url: "https://stockx.com/search",
    baseShipping: 20,
  },
  {
    platform: "Grailed",
    price: 245,
    condition: "Very Good" as Condition,
    location: "Japan",
    url: "https://www.grailed.com/shop",
    baseShipping: 30,
  },
  {
    platform: "Mercari",
    price: 220,
    condition: "Fair" as Condition,
    location: "Japan",
    url: "https://www.mercari.com/search/",
    baseShipping: 28,
  },
];

const conditionFilters: Condition[] = ["All", "Brand New", "Mint", "Very Good", "Fair"];

/** Skeleton placeholder for product images */
const ProductImageSkeleton = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 animate-pulse">
    <div className="w-16 h-16 rounded-full bg-muted/50 mb-3 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full"
      />
    </div>
    <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
      Searching product image...
    </p>
  </div>
);

/** Fallback when no image found */
const ProductImageFallback = ({ brand, model }: { brand: string; model: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20">
    <ImageOff className="w-10 h-10 text-muted-foreground/40 mb-2" />
    <p className="text-[10px] text-muted-foreground text-center px-4">
      {brand} {model}
    </p>
  </div>
);

/** Dynamic product image component */
const ProductImage = ({ item, className = "" }: { item: AnalyzedItem; className?: string }) => {
  const [imgError, setImgError] = useState(false);

  if (item.imageLoading) {
    return <ProductImageSkeleton />;
  }

  if (!item.imageUrl || imgError) {
    return <ProductImageFallback brand={item.brand} model={item.model} />;
  }

  return (
    <img
      src={item.imageUrl}
      alt={`${item.brand} ${item.model}`}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  );
};

const ScanDetailSheet = ({ open, onClose, analyzedItems = [] }: ScanDetailSheetProps) => {
  const { country, setCountry, t, formatPrice, calcDuty, calcShipping } = useLocale();
  const [bridgeTarget, setBridgeTarget] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{ brand: string; model: string; price: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<Condition>("All");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [marketSwitchDone, setMarketSwitchDone] = useState(false);
  const [showMarketSwitch, setShowMarketSwitch] = useState(false);

  // Trigger market switch animation when sheet opens
  useEffect(() => {
    if (open && !marketSwitchDone) {
      const timer = setTimeout(() => {
        setShowMarketSwitch(true);
        setTimeout(() => {
          setShowMarketSwitch(false);
          setMarketSwitchDone(true);
        }, 2500);
      }, 800);
      return () => clearTimeout(timer);
    }
    if (!open) {
      setMarketSwitchDone(false);
      setShowMarketSwitch(false);
    }
  }, [open]);

  const handlePreOwnedClick = (url: string, platform: string) => {
    setBridgeTarget(platform);
    setTimeout(() => {
      window.open(url, "_blank");
      setBridgeTarget(null);
    }, 1200);
  };

  const handleQuickBuy = (item: AnalyzedItem) => {
    setCheckoutItem({ brand: item.brand, model: item.model, price: item.estimatedPrice });
    setShowCheckout(true);
  };

  const handleCountryChange = (c: Country) => {
    setIsRecalculating(true);
    setShowCountryPicker(false);
    setTimeout(() => {
      setCountry(c);
      setIsRecalculating(false);
    }, 600);
  };

  const filteredPreOwned = conditionFilter === "All"
    ? preOwned
    : preOwned.filter((item) => item.condition === conditionFilter);

  const primaryItem = analyzedItems.length > 0 ? analyzedItems[0] : null;

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
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            />

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

              {/* Close & Save */}
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    saved ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hero - Dynamic Image */}
              <div className="px-5 pb-4">
                <div className="rounded-xl overflow-hidden bg-background aspect-[4/3] flex items-center justify-center">
                  {primaryItem ? (
                    <ProductImage item={primaryItem} />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Identification */}
              <div className="px-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
                     AI Identified · {primaryItem ? `${primaryItem.confidence}%` : "—"} Match
                    </p>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                       {primaryItem ? primaryItem.brand.toUpperCase() : "Analyzing..."}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {primaryItem ? primaryItem.model : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Color: {primaryItem ? primaryItem.color || "N/A" : "—"}
                    </p>
                    {primaryItem && primaryItem.material && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Material: {primaryItem.material}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-accent/30">
                      {t("rare")}
                    </span>
                    <span className="bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-accent/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t("outOfStock")}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                   <span className="text-lg font-display font-bold">
                    {primaryItem ? formatPrice(primaryItem.estimatedPrice) : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">{t("retailPrice")}</span>
                </div>

                {/* HS Code classification */}
                <div className="mt-2 px-2.5 py-1.5 bg-secondary/60 rounded-lg border border-border inline-flex items-center gap-2">
                   <span className="text-[9px] font-mono text-muted-foreground">
                    HS Code: {primaryItem ? primaryItem.hsCode : "—"} · {primaryItem ? primaryItem.hsDescription : "—"} · {country.flag} Duty {Math.round(country.dutyRate * 100)}%
                  </span>
                </div>

                {/* Additional analyzed items */}
                {analyzedItems.length > 1 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                      Other Items Detected
                    </p>
                    {analyzedItems.slice(1).map((item, i) => (
                      <div key={i} className="p-2.5 bg-secondary/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          {/* Item thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex-shrink-0">
                            <ProductImage item={item} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-display font-bold">{item.brand}</p>
                                <p className="text-[11px] text-muted-foreground">{item.model}</p>
                                {item.color && (
                                  <p className="text-[10px] text-muted-foreground">Color: {item.color}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-display font-bold">{formatPrice(item.estimatedPrice)}</p>
                                <p className="text-[9px] text-muted-foreground">{item.confidence}% match</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 px-2 py-1 bg-secondary/60 rounded border border-border inline-flex">
                          <span className="text-[8px] font-mono text-muted-foreground">
                            HS {item.hsCode} · {item.hsDescription}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Country selector */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-base">{country.flag}</span>
                    <span className="text-sm font-display font-semibold">{country.name}</span>
                    <span className="text-[10px] text-muted-foreground">· {country.currency}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCountryPicker ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCountryPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1 max-h-[200px] overflow-y-auto"
                    >
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleCountryChange(c)}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                            country.code === c.code ? "bg-foreground/5 border border-foreground/20" : "hover:bg-secondary/50"
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="text-xs font-display font-semibold flex-1">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">{c.currencySymbol} {c.currency}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recalculating overlay */}
              <AnimatePresence>
                {isRecalculating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 pb-4"
                  >
                    <div className="p-4 bg-gold/5 border border-gold/15 rounded-xl flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full"
                      />
                      <p className="text-xs font-display font-semibold text-gold">{t("changingCountry")}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save to closet banner */}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mx-5 mb-4 p-3 bg-gold/10 border border-gold/20 rounded-xl"
                >
                  <p className="text-[11px] text-gold font-display font-semibold flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Saved to My Closet · Tracker Alert is ON
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    You'll be notified on price drops and new pre-owned listings.
                  </p>
                </motion.div>
              )}

              {/* Global Price Comparison */}
              <div className="px-5 pb-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-3">
                  {t("globalPrice")}
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
                      </div>
                      <span className="text-xs font-bold text-accent uppercase">{t("soldOut")}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Market-Switch Bridge Animation */}
              <AnimatePresence>
                {showMarketSwitch && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-5 mb-4 p-4 bg-accent/5 border border-accent/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full flex-shrink-0"
                      />
                      <div>
                        <p className="text-[11px] font-display font-bold text-accent">
                          New item is out of stock.
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Switching to Secondary Market (Pre-owned)...
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="mt-3 h-1 bg-accent/40 rounded-full origin-left"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pre-owned with Landed Cost */}
              <div className="px-5 pb-5">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    <p className="text-xs font-display font-bold uppercase tracking-[0.15em] text-accent">
                      {t("findPreOwned")}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {t("preOwnedDesc")}
                  </p>

                  {/* Condition filter */}
                  <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                    {conditionFilters.map((c) => (
                      <button
                        key={c}
                        onClick={() => setConditionFilter(c)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-display font-semibold uppercase tracking-wider whitespace-nowrap border transition-colors ${
                          conditionFilter === c
                            ? "bg-foreground text-background border-foreground"
                            : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        {c === "All" ? t("allConditions") : c}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredPreOwned.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No listings match this filter.</p>
                    ) : (
                      filteredPreOwned.map((item, i) => {
                        const duty = calcDuty(item.price);
                        const shipping = calcShipping(item.baseShipping);
                        const total = item.price + duty + shipping;

                        return (
                          <motion.button
                            key={item.platform}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            onClick={() => handlePreOwnedClick(item.url, item.platform)}
                            className="w-full text-left p-4 bg-secondary/80 rounded-xl border border-border hover:border-accent/40 transition-all group relative overflow-hidden"
                          >
                            {/* Bridge animation */}
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

                            <div className="relative z-10 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-display font-bold">{item.platform}</p>
                                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {item.condition}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {item.location}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-display font-bold">{formatPrice(item.price)}</span>
                                {bridgeTarget === item.platform ? (
                                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                                    <ArrowRight className="w-4 h-4 text-accent" />
                                  </motion.div>
                                ) : (
                                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                )}
                              </div>
                            </div>

                            {/* All-in Price Calculator */}
                            <motion.div
                              key={country.code}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="relative z-10 mt-3 pt-3 border-t border-border/50"
                            >
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                {t("estimatedTotal")} ({country.flag} {country.name})
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-[10px] text-muted-foreground">{t("price")}</p>
                                  <p className="text-xs font-display font-semibold">{formatPrice(item.price)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">{t("duties")}</p>
                                  <p className="text-xs font-display font-semibold">+{formatPrice(duty)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">{t("shipping")}</p>
                                  <p className="text-xs font-display font-semibold">+{formatPrice(shipping)}</p>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("landedTotal")}</span>
                                <span className="text-sm font-display font-bold text-foreground">
                                  {formatPrice(total)}
                                </span>
                              </div>
                            </motion.div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* AI-Matched Similar Items (dynamically from analyzed items) */}
              {analyzedItems.length > 0 && (
                <div className="px-5 pb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                      {t("aiAlternatives")} · {primaryItem?.brand || ""}
                    </p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                    {analyzedItems.map((item, i) => (
                      <motion.div
                        key={`${item.brand}-${item.model}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="min-w-[160px] flex-shrink-0 bg-secondary/30 rounded-xl overflow-hidden border border-border hover:border-muted-foreground/30 transition-colors"
                      >
                        <div className="aspect-square overflow-hidden bg-background relative">
                          <ProductImage item={item} />
                          <span className="absolute top-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-[8px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                            {item.confidence}%
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-display font-semibold truncate">{item.brand}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.model}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs font-display font-bold">{formatPrice(item.estimatedPrice)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patent Pending Badge */}
              <div className="px-5 pb-8">
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary/30 rounded-xl border border-border">
                  <Shield className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[9px] font-display font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Patent Pending: AI-Driven Market Bridging System
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout */}
      <CheckoutSheet open={showCheckout} onClose={() => setShowCheckout(false)} item={checkoutItem} />
    </>
  );
};

export default ScanDetailSheet;
