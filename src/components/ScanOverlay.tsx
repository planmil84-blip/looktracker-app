import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, X } from "lucide-react";
import ScanResults from "./ScanResults";
import ScanDetailSheet from "./ScanDetailSheet";
import AIAnalysisOverlay from "./AIAnalysisOverlay";
import { useToast } from "@/hooks/use-toast";

export interface SellerInfo {
  name: string;
  price: number;
  currency: string;
  link: string;
  thumbnail: string;
}

export interface AnalyzedItem {
  brand: string;
  product_name: string;
  search_keywords?: string;
  blog_search_queries?: string[];
  collection: string;
  category: string;
  color: string;
  material: string;
  hsCode: string;
  hsDescription: string;
  original_price: number;
  official_status: string;
  resale_market: string;
  confidence: number;
  is_vintage?: boolean;
  match_label?: string;
  celebrity_name?: string;
  /** @deprecated kept for backward compat */
  model?: string;
  estimatedPrice?: number;
  imageUrl?: string;
  imageLoading?: boolean;
  sellers?: SellerInfo[];
}

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;

async function analyzeImage(file: File, context: string): Promise<AnalyzedItem[]> {
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  });

  const resp = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ imageBase64: base64, context: context || undefined }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  const data = await resp.json();
  const celebrity_name = data.celebrity_name || "Unknown";
  return (data.items || []).map((item: any) => ({
    ...item,
    celebrity_name,
    // backward compat aliases
    model: item.product_name || item.model,
    estimatedPrice: item.original_price || item.estimatedPrice,
  }));
}

interface ScanOverlayProps {
  externalImageUrl?: string | null;
  externalContext?: string;
  onExternalConsumed?: () => void;
}

const ScanOverlay = ({ externalImageUrl, externalContext, onExternalConsumed }: ScanOverlayProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [contextHint, setContextHint] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<AnalyzedItem[]>([]);
  const { toast } = useToast();
  const externalTriggered = useRef(false);

  const fetchImagesForItems = useCallback(async (items: AnalyzedItem[], hint: string) => {
    const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-product-image`;

    // Fire ALL requests in parallel with Promise.allSettled
    const promises = items.map(async (item, idx) => {
      try {
        const resp = await fetch(SEARCH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            brand: item.brand,
            model: item.product_name || item.model || "",
            color: item.color || "",
            category: item.category || "",
            material: item.material || "",
            search_keywords: item.search_keywords || "",
            is_vintage: item.is_vintage || false,
            context_hint: hint || "",
            blog_search_queries: item.blog_search_queries || [],
            celebrity_name: item.celebrity_name || "",
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.imageUrl || data.sellers?.length) {
            setAnalyzedItems((prev) =>
              prev.map((it, i) => (i === idx ? {
                ...it,
                imageUrl: data.imageUrl || it.imageUrl,
                imageLoading: false,
                sellers: data.sellers || [],
                match_label: data.match_label || "Similar Style",
              } : it))
            );
            return;
          }
        }
      } catch (e) {
        console.warn(`Image fetch failed for ${item.brand}`, e);
      }
      setAnalyzedItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, imageLoading: false, match_label: "No Match" } : it))
      );
    });

    await Promise.allSettled(promises);
  }, []);

  // Auto-trigger scan when receiving an image from Trending feed
  useEffect(() => {
    if (externalImageUrl && !externalTriggered.current) {
      externalTriggered.current = true;
      if (externalContext) setContextHint(externalContext);
      setUploadedImage(externalImageUrl);
      setScanComplete(false);
      setShowDetail(false);
      setShowAnalysis(false);
      setAnalyzedItems([]);
      setIsScanning(true);
      onExternalConsumed?.();

      (async () => {
        try {
          const resp = await fetch(externalImageUrl);
          const blob = await resp.blob();
          const file = new File([blob], "celeb-look.jpg", { type: blob.type });
          const items = await analyzeImage(file, externalContext || "");
          const itemsWithLoading = items.map((it) => ({ ...it, imageLoading: true }));
          setAnalyzedItems(itemsWithLoading);
          setIsScanning(false);
          setScanComplete(true);
          setTimeout(() => setShowAnalysis(true), 500);
          fetchImagesForItems(itemsWithLoading, externalContext || "");
        } catch (err: any) {
          console.error("AI analysis failed:", err);
          setIsScanning(false);
          toast({
            title: "분석 실패",
            description: err.message || "AI 분석에 실패했습니다. 다시 시도해주세요.",
            variant: "destructive",
          });
        }
      })();
    }
    if (!externalImageUrl) {
      externalTriggered.current = false;
    }
  }, [externalImageUrl, externalContext, onExternalConsumed, toast, fetchImagesForItems]);
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setScanComplete(false);
    setShowDetail(false);
    setShowAnalysis(false);
    setAnalyzedItems([]);
    setIsScanning(true);

    try {
      const items = await analyzeImage(file, contextHint);
      // Mark items as loading images
      const itemsWithLoading = items.map((it) => ({ ...it, imageLoading: true }));
      setAnalyzedItems(itemsWithLoading);
      setIsScanning(false);
      setScanComplete(true);
      setTimeout(() => setShowAnalysis(true), 500);
      // Fire off image searches in parallel
      fetchImagesForItems(itemsWithLoading, contextHint);
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      setIsScanning(false);
      toast({
        title: "분석 실패",
        description: err.message || "AI 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  }, [toast, contextHint, fetchImagesForItems]);

  const handleAnalysisComplete = useCallback(() => {
    setShowAnalysis(false);
    setTimeout(() => setShowDetail(true), 300);
  }, []);

  const handleReset = () => {
    setUploadedImage(null);
    setIsScanning(false);
    setScanComplete(false);
    setShowAnalysis(false);
    setShowDetail(false);
    setAnalyzedItems([]);
  };

  const scanResults = analyzedItems.slice(0, 3).map((item, i) => {
    // Derive stock from sellers data: in stock if any seller has price > 0
    const hasStock = item.sellers && item.sellers.length > 0
      ? item.sellers.some((s) => s.price > 0 && s.link)
      : item.official_status !== "Sold Out";
    return {
      brand: item.brand,
      model: item.product_name || item.model || "",
      price: item.original_price || item.estimatedPrice || 0,
      inStock: hasStock,
      confidence: item.confidence,
      top: 25 + i * 25,
      left: 35 + (i % 2) * 20,
    };
  });

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md space-y-3"
          >
            {/* Context hint input */}
            <div className="relative">
              <input
                type="text"
                value={contextHint}
                onChange={(e) => setContextHint(e.target.value)}
                placeholder="예: 제니가 브이로그에서 입은 조끼, 24FW 공항패션 등"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card/80 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                Hint
              </span>
            </div>

            {/* Upload area */}
            <label className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors cursor-pointer bg-card/50">
              <Upload className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-display font-semibold mb-1">Upload a Look</p>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                Drop an image or tap to scan celebrity outfits with AI
              </p>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full max-w-md rounded-xl overflow-hidden"
          >
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <img src={uploadedImage} alt="Uploaded look" className="w-full object-cover rounded-xl" />

            {isScanning && (
              <div className="absolute inset-0 rounded-xl">
                <div className="absolute inset-0 bg-background/40 animate-scan-pulse" />
                <div className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_15px_hsl(var(--accent)),0_0_30px_hsl(var(--accent))] animate-scan-line z-10" />
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent animate-scan-corner" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent animate-scan-corner" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent animate-scan-corner" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent animate-scan-corner" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <ScanLine className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-xs font-display font-semibold text-accent tracking-widest uppercase">
                      Real-time AI Analysis in Progress...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {scanComplete && (
              <>
                <ScanResults results={scanResults} />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute z-30"
                  style={{ top: "28%", left: "40%" }}
                >
                  <button
                    onClick={() => { if (!showAnalysis) setShowAnalysis(true); }}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)),0_0_24px_hsl(var(--accent))]" />
                    <div className="w-5 h-5 rounded-full bg-accent/40 absolute inset-0 animate-ping" />
                  </button>
                </motion.div>
                <AIAnalysisOverlay active={showAnalysis} onComplete={handleAnalysisComplete} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScanDetailSheet
        open={showDetail}
        onClose={() => setShowDetail(false)}
        analyzedItems={analyzedItems}
      />
    </div>
  );
};

export default ScanOverlay;
