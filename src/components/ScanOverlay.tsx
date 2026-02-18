import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, X } from "lucide-react";
import ScanResults from "./ScanResults";
import ScanDetailSheet from "./ScanDetailSheet";
import AIAnalysisOverlay from "./AIAnalysisOverlay";
import { useToast } from "@/hooks/use-toast";

export interface AnalyzedItem {
  brand: string;
  model: string;
  category: string;
  color: string;
  material: string;
  hsCode: string;
  hsDescription: string;
  estimatedPrice: number;
  confidence: number;
}

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;

async function analyzeImage(file: File): Promise<AnalyzedItem[]> {
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:...;base64,
    };
    reader.readAsDataURL(file);
  });

  const resp = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ imageBase64: base64 }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  const data = await resp.json();
  return data.items || [];
}


const ScanOverlay = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<AnalyzedItem[]>([]);
  const { toast } = useToast();

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
      const items = await analyzeImage(file);
      setAnalyzedItems(items);
      setIsScanning(false);
      setScanComplete(true);
      setTimeout(() => setShowAnalysis(true), 500);
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      setIsScanning(false);
      toast({
        title: "분석 실패",
        description: err.message || "AI 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  }, [toast]);

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

  // Build scan result dots from AI results only (no fallback)
  const scanResults = analyzedItems.slice(0, 3).map((item, i) => ({
    brand: item.brand,
    model: item.model,
    price: item.estimatedPrice,
    inStock: true,
    confidence: item.confidence,
    top: 25 + i * 25,
    left: 35 + (i % 2) * 20,
  }));

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center w-full max-w-md aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors cursor-pointer bg-card/50"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-display font-semibold mb-1">
              Upload a Look
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Drop an image or tap to scan celebrity outfits with AI
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </motion.label>
        ) : (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full max-w-md rounded-xl overflow-hidden"
          >
            {/* Reset button */}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <img
              src={uploadedImage}
              alt="Uploaded look"
              className="w-full object-cover rounded-xl"
            />

            {/* Scanning overlay */}
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

            {/* Results tags */}
            {scanComplete && (
              <>
                <ScanResults results={scanResults} />
                {/* Focus tag on the top item */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute z-30"
                  style={{ top: "28%", left: "40%" }}
                >
                  <button
                    onClick={() => {
                      if (!showAnalysis) setShowAnalysis(true);
                    }}
                    className="relative"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)),0_0_24px_hsl(var(--accent))]" />
                    <div className="w-5 h-5 rounded-full bg-accent/40 absolute inset-0 animate-ping" />
                  </button>
                </motion.div>

                {/* AI Analysis Overlay */}
                <AIAnalysisOverlay active={showAnalysis} onComplete={handleAnalysisComplete} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Bottom Sheet */}
      <ScanDetailSheet
        open={showDetail}
        onClose={() => setShowDetail(false)}
        analyzedItems={analyzedItems}
      />
    </div>
  );
};

export default ScanOverlay;
