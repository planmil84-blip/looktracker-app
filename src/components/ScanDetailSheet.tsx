import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ExternalLink, ShoppingBag, ArrowRight, Sparkles,
  Bookmark, BookmarkCheck, Globe, ChevronDown, Shield, Tag,
  Store, Repeat, MapPin, CreditCard,
} from "lucide-react";
import CheckoutSheet from "./CheckoutSheet";
import { useLocale, countries, type Country } from "@/contexts/LocaleContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzedItem } from "./ScanOverlay";

interface ScanDetailSheetProps {
  open: boolean;
  onClose: () => void;
  analyzedItems?: AnalyzedItem[];
}

/* ── Market data ── */
const officialPartners = [
  { name: "Official Store", url: "https://www.google.com/search?q=", baseShipping: 0 },
  { name: "SSENSE", url: "https://www.ssense.com/en-us/search?q=", baseShipping: 15 },
  { name: "Farfetch", url: "https://www.farfetch.com/shopping/search?q=", baseShipping: 20 },
];

const resaleMarkets = [
  { name: "eBay", url: "https://www.ebay.com/sch/", condition: "Various", baseShipping: 25 },
  { name: "Vestiaire", url: "https://www.vestiairecollective.com/search/?q=", condition: "Mint", baseShipping: 35 },
  { name: "StockX", url: "https://stockx.com/search?s=", condition: "Brand New", baseShipping: 20 },
  { name: "Grailed", url: "https://www.grailed.com/shop?query=", condition: "Very Good", baseShipping: 30 },
];

const kBridgeShops = [
  { name: "Musinsa", url: "https://www.musinsa.com/search/musinsa/integration?q=", baseShipping: 8 },
  { name: "W Concept", url: "https://www.wconcept.co.kr/Search?keyword=", baseShipping: 10 },
  { name: "29CM", url: "https://search.29cm.co.kr/?keyword=", baseShipping: 8 },
];

type MarketTab = "official" | "resale" | "k-bridge";

/* ── Derive real stock status from sellers data ── */
function deriveInStock(item: AnalyzedItem): boolean {
  // If we have real seller data, check if any seller has a valid price (> 0)
  if (item.sellers && item.sellers.length > 0) {
    return item.sellers.some((s) => s.price > 0 && s.link);
  }
  // Fall back to the AI-analyzed official_status
  return item.official_status !== "Sold Out";
}

/* ── Item thumbnail card ── */
const ItemCard = ({
  item,
  index,
  isSelected,
  onClick,
  formatPrice,
}: {
  item: AnalyzedItem;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  formatPrice: (usd: number) => string;
}) => {
  const price = item.original_price || item.estimatedPrice || 0;
  const isSoldOut = !deriveInStock(item);

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={`flex-1 min-w-0 flex flex-col items-center p-3 rounded-xl border transition-all ${
        isSelected
          ? "bg-accent/10 border-accent/50 shadow-[0_0_15px_hsl(var(--accent)/0.15)]"
          : "bg-secondary/40 border-border hover:border-muted-foreground/40"
      }`}
    >
      {/* Image / skeleton */}
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted mb-2 relative">
        {item.imageLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
            <Tag className="w-8 h-8 text-muted-foreground/30" />
            <span className="text-[8px] text-muted-foreground/50 font-display">이미지를 불러오는 중...</span>
          </div>
        ) : item.imageUrl ? (
          <img src={item.imageUrl} alt={item.product_name || item.brand} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Tag className="w-8 h-8 text-muted-foreground/30" />
            <span className="text-[8px] text-muted-foreground/50 font-display">이미지 없음</span>
          </div>
        )}
        <span
          className={`absolute top-1.5 right-1.5 text-[8px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
            isSoldOut ? "bg-accent/90 text-accent-foreground" : "bg-badge-in-stock text-foreground"
          }`}
        >
          {isSoldOut ? "Sold Out" : "In Stock"}
        </span>
        {/* Match quality label */}
        {item.match_label && item.match_label !== "Exact Match" && (
          <span
            className={`absolute bottom-1.5 left-1.5 text-[7px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
              item.match_label === "Brand Match"
                ? "bg-gold/80 text-foreground"
                : item.match_label === "Resale · Pre-owned"
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-muted-foreground/70"
            }`}
          >
            {item.match_label}
          </span>
        )}
        {item.match_label === "Exact Match" && (
          <span className="absolute bottom-1.5 left-1.5 text-[7px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/90 text-accent-foreground">
            ✓ Exact Match
          </span>
        )}
      </div>

      {/* Verified Celeb Choice label */}
      {item.celebrity_name && item.celebrity_name !== "Unknown" && item.match_label === "Exact Match" && (
        <div className="w-full px-1 mb-1">
          <span className="text-[7px] font-display font-bold text-accent leading-tight block text-center truncate">
            ✦ Verified: {item.celebrity_name} wore this
          </span>
        </div>
      )}

      {/* Info */}
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate w-full text-center">
        {item.category || "Item"}
      </p>
      <p className="text-xs font-display font-bold truncate w-full text-center mt-0.5">
        {item.brand}
      </p>
      <p className="text-sm font-display font-bold text-foreground mt-1">
        {formatPrice(price)}
      </p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{item.confidence}% match</p>
    </motion.button>
  );
};

/* ── Market listing row ── */
const MarketRow = ({
  name,
  url,
  searchQuery,
  basePrice,
  baseShipping,
  condition,
  formatPrice,
  calcDuty,
  calcShipping,
  onBuy,
  onBridge,
  bridgeTarget,
  isSoldOut = false,
}: {
  name: string;
  url: string;
  searchQuery: string;
  basePrice: number;
  baseShipping: number;
  condition?: string;
  formatPrice: (usd: number) => string;
  calcDuty: (usd: number) => number;
  calcShipping: (base: number) => number;
  onBuy: (seller: string, basePrice: number, duty: number, shipping: number) => void;
  onBridge: (url: string, platform: string) => void;
  bridgeTarget: string | null;
  isSoldOut?: boolean;
}) => {
  const duty = calcDuty(basePrice);
  const shipping = calcShipping(baseShipping);
  const total = basePrice + duty + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-secondary/50 rounded-xl border border-border hover:border-muted-foreground/30 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-display font-semibold">{name}</p>
          {condition && (
            <span className="text-[8px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider text-muted-foreground">
              {condition}
            </span>
          )}
        </div>
        <button
          onClick={() => onBridge(`${url}${searchQuery}`, name)}
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          {bridgeTarget === name ? (
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
              <ArrowRight className="w-4 h-4 text-accent" />
            </motion.div>
          ) : (
            <ExternalLink className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Price breakdown */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span>{formatPrice(basePrice)}</span>
        <span>+ duty {formatPrice(duty)}</span>
        <span>+ ship {formatPrice(shipping)}</span>
      </div>

      {/* All-in price + Buy */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
        <span className="text-sm font-display font-bold text-accent">
          {formatPrice(total)}
        </span>
        {isSoldOut ? (
          <span className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1 cursor-not-allowed opacity-60">
            <CreditCard className="w-3 h-3" />
            Sold Out
          </span>
        ) : (
          <button
            onClick={() => onBuy(name, basePrice, duty, shipping)}
            className="px-3 py-1.5 rounded-lg bg-checkout text-checkout-foreground text-[10px] font-display font-bold uppercase tracking-wider hover:bg-checkout-hover transition-colors flex items-center gap-1"
          >
            <CreditCard className="w-3 h-3" />
            Buy Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main Sheet ── */
const ScanDetailSheet = ({ open, onClose, analyzedItems = [] }: ScanDetailSheetProps) => {
  const { country, setCountry, t, formatPrice, calcDuty, calcShipping } = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [marketTab, setMarketTab] = useState<MarketTab>("official");
  const [bridgeTarget, setBridgeTarget] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{
    brand: string;
    model: string;
    price: number;
    imageUrl?: string;
    seller?: string;
    priceBreakdown?: { base: number; duty: number; shipping: number };
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      setMarketTab("official");
    }
  }, [open]);

  const handleBridge = (url: string, platform: string) => {
    setBridgeTarget(platform);
    setTimeout(() => {
      window.open(url, "_blank");
      setBridgeTarget(null);
    }, 1200);
  };

  const handleBuy = (seller: string, basePrice: number, duty: number, shipping: number) => {
    const total = basePrice + duty + shipping;
    setCheckoutItem({
      brand: selectedItem?.brand || "Unknown",
      model: selectedItem?.product_name || selectedItem?.model || "",
      price: total,
      imageUrl: selectedItem?.imageUrl,
      seller,
      priceBreakdown: { base: basePrice, duty, shipping },
    });
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

  const selectedItem = analyzedItems[selectedIndex] || null;
  const searchQuery = selectedItem
    ? encodeURIComponent(`${selectedItem.brand} ${selectedItem.product_name || selectedItem.model || ""}`)
    : "";
  const basePrice = selectedItem ? (selectedItem.original_price || selectedItem.estimatedPrice || 0) : 0;

  const marketTabs: { key: MarketTab; label: string; icon: typeof Store }[] = [
    { key: "official", label: "Official", icon: Store },
    { key: "resale", label: "Resale", icon: Repeat },
    { key: "k-bridge", label: "K-Bridge", icon: MapPin },
  ];

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
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-card z-10">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    saved ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-accent">
                    Scan Results
                  </span>
                </div>

                {/* ═══ 3-Column Item Grid ═══ */}
                {analyzedItems.length === 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-xl border border-border bg-secondary/40">
                        <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {analyzedItems.slice(0, 3).map((item, i) => (
                        <ItemCard
                          key={`${item.brand}-${i}`}
                          item={item}
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => setSelectedIndex(i)}
                          formatPrice={formatPrice}
                        />
                      ))}
                    </div>
                    {analyzedItems.some((it) => it.imageLoading) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/30 bg-accent/5"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full flex-shrink-0"
                        />
                        <span className="text-[10px] font-display font-bold text-accent">
                          브랜드 공식 파트너사에서 실제 상품 정보를 가져오는 중...
                        </span>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Save banner */}
                {saved && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-gold/10 border border-gold/20 rounded-xl">
                    <p className="text-[11px] text-gold font-display font-semibold flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5" /> Saved · Tracker ON
                    </p>
                  </motion.div>
                )}

                {/* Country selector */}
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="w-full flex items-center gap-3 p-2.5 bg-secondary/50 rounded-xl border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-base">{country.flag}</span>
                    <span className="text-xs font-display font-semibold">{country.name}</span>
                    <span className="text-[10px] text-muted-foreground">· {country.currency}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCountryPicker ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCountryPicker && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 max-h-[180px] overflow-y-auto">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleCountryChange(c)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                            country.code === c.code ? "bg-foreground/5 border border-foreground/20" : "hover:bg-secondary/50"
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span className="text-xs font-display font-semibold flex-1">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">{c.currencySymbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recalculating */}
                <AnimatePresence>
                  {isRecalculating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-gold/5 border border-gold/15 rounded-xl flex items-center gap-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full" />
                      <p className="text-xs font-display font-semibold text-gold">{t("changingCountry")}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ═══ 3-Way Market Tabs ═══ */}
                {selectedItem && (
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Verified Celeb Choice banner */}
                    {selectedItem.celebrity_name && selectedItem.celebrity_name !== "Unknown" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/30 bg-accent/5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-[10px] font-display font-bold text-accent">
                          {selectedItem.match_label === "Exact Match"
                            ? `Verified Celeb Choice: ${selectedItem.celebrity_name} wore this [${selectedItem.brand}]`
                            : `${selectedItem.celebrity_name}'s Style · ${selectedItem.match_label || "Similar Style"}`}
                        </span>
                      </motion.div>
                    )}

                    {/* Selected item summary */}
                    <div className="flex items-center gap-2 px-1">
                      <p className="text-xs font-display font-bold flex-1 truncate">
                        {selectedItem.brand} · {selectedItem.product_name || selectedItem.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedItem.collection || ""}
                      </p>
                    </div>

                    {/* Market tabs */}
                    <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
                      {marketTabs.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setMarketTab(key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider transition-all ${
                            marketTab === key
                              ? "bg-foreground text-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Market listings */}
                    <div className="space-y-2">
                      <AnimatePresence mode="wait">
                        {marketTab === "official" && (
                          <motion.div key="official" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            {/* Real sellers from Google Shopping */}
                            {selectedItem?.sellers && selectedItem.sellers.length > 0 ? (
                              selectedItem.sellers.map((seller) => {
                                const sellerInStock = seller.price > 0 && !!seller.link;
                                return (
                                  <MarketRow
                                    key={seller.name}
                                    name={seller.name}
                                    url={seller.link ? seller.link.split("?")[0] + "?q=" : "https://www.google.com/search?q="}
                                    searchQuery={seller.link ? "" : searchQuery}
                                    basePrice={seller.price || basePrice}
                                    baseShipping={15}
                                    formatPrice={formatPrice}
                                    calcDuty={calcDuty}
                                    calcShipping={calcShipping}
                                    onBuy={handleBuy}
                                    onBridge={(url) => handleBridge(seller.link || url, seller.name)}
                                    bridgeTarget={bridgeTarget}
                                    isSoldOut={!sellerInStock}
                                  />
                                );
                              })
                            ) : (
                              officialPartners.map((m) => (
                                <MarketRow
                                  key={m.name}
                                  name={m.name}
                                  url={m.url}
                                  searchQuery={searchQuery}
                                  basePrice={basePrice}
                                  baseShipping={m.baseShipping}
                                  formatPrice={formatPrice}
                                  calcDuty={calcDuty}
                                  calcShipping={calcShipping}
                                  onBuy={handleBuy}
                                  onBridge={handleBridge}
                                  bridgeTarget={bridgeTarget}
                                  isSoldOut={!deriveInStock(selectedItem)}
                                />
                              ))
                            )}

                            {/* Resale nudge when official is sold out */}
                            {selectedItem && !deriveInStock(selectedItem) && (
                              <motion.button
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setMarketTab("resale")}
                                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors"
                              >
                                <Repeat className="w-3.5 h-3.5 text-accent" />
                                <span className="text-[10px] font-display font-bold text-accent">
                                  공식몰은 품절이지만 리셀 마켓에 매물이 있습니다 →
                                </span>
                              </motion.button>
                            )}
                          </motion.div>
                        )}
                        {marketTab === "resale" && (
                          <motion.div key="resale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            {resaleMarkets.map((m) => (
                              <MarketRow
                                key={m.name}
                                name={m.name}
                                url={m.url}
                                searchQuery={searchQuery}
                                basePrice={Math.round(basePrice * 0.7)}
                                baseShipping={m.baseShipping}
                                condition={m.condition}
                                formatPrice={formatPrice}
                                calcDuty={calcDuty}
                                calcShipping={calcShipping}
                                onBuy={handleBuy}
                                onBridge={handleBridge}
                                bridgeTarget={bridgeTarget}
                              />
                            ))}
                          </motion.div>
                        )}
                        {marketTab === "k-bridge" && (
                          <motion.div key="k-bridge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            {kBridgeShops.map((m) => (
                              <MarketRow
                                key={m.name}
                                name={m.name}
                                url={m.url}
                                searchQuery={searchQuery}
                                basePrice={Math.round(basePrice * 0.4)}
                                baseShipping={m.baseShipping}
                                formatPrice={formatPrice}
                                calcDuty={calcDuty}
                                calcShipping={calcShipping}
                                onBuy={handleBuy}
                                onBridge={handleBridge}
                                bridgeTarget={bridgeTarget}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* Patent badge */}
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

      <CheckoutSheet open={showCheckout} onClose={() => setShowCheckout(false)} item={checkoutItem} />
    </>
  );
};

export default ScanDetailSheet;
