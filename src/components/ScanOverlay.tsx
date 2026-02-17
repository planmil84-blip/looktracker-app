import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, X } from "lucide-react";
import ScanResults from "./ScanResults";
import ScanDetailSheet from "./ScanDetailSheet";
import AIAnalysisOverlay from "./AIAnalysisOverlay";

const mockScanResults = [
  { brand: "JACQUEMUS", model: "La Maille Valensole Knit Top", price: 490, inStock: false, confidence: 96, top: 30, left: 45 },
  { brand: "Acne Studios", model: "Leather Jacket", price: 1800, inStock: false, confidence: 87, top: 65, left: 35 },
  { brand: "Bottega Veneta", model: "Puddle Boots", price: 950, inStock: true, confidence: 91, top: 85, left: 50 },
];

const ScanOverlay = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setScanComplete(false);
    setShowDetail(false);
    setShowAnalysis(false);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      // Show AI analysis overlay after scan
      setTimeout(() => setShowAnalysis(true), 500);
    }, 3500);
  }, []);

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
  };

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
                      Analyzing Look...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Results tags */}
            {scanComplete && (
              <>
                <ScanResults results={mockScanResults} />
                {/* Focus tag on the top item (Jennie's knit) */}
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
      <ScanDetailSheet open={showDetail} onClose={() => setShowDetail(false)} />
    </div>
  );
};

export default ScanOverlay;
