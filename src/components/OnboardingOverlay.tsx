import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { countries, useLocale, type Country } from "@/contexts/LocaleContext";

const OnboardingOverlay = () => {
  const { country, setCountry, lang, setLang, setOnboarded, onboarded } = useLocale();
  const [step, setStep] = useState<"welcome" | "country" | "language">("welcome");
  const [selectedCountry, setSelectedCountry] = useState<Country>(country);

  if (onboarded) return null;

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const handleFinish = () => {
    setCountry(selectedCountry);
    setOnboarded(true);
  };

  return (
    <AnimatePresence>
      {!onboarded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
            <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              {step === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center w-full"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="w-7 h-7 text-accent" />
                  </motion.div>

                  <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
                    LOOK<span className="text-accent">TRACKER</span>
                  </h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground leading-relaxed mt-4 max-w-[280px] mx-auto"
                  >
                    Discover Jennie's style at the best price, anywhere in the world.
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setStep("country")}
                    className="mt-10 w-full py-3.5 rounded-xl bg-foreground text-background font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {step === "country" && (
                <motion.div
                  key="country"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-accent" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                      Step 1 of 2
                    </p>
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight mb-1">
                    Where are you shopping from?
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    We'll calculate duties, taxes & shipping for your location.
                  </p>

                  {/* Auto-detected suggestion */}
                  <div className="mb-4 p-3 bg-gold/5 border border-gold/15 rounded-xl flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gold uppercase tracking-wider font-semibold">Auto-detected</p>
                      <p className="text-xs text-muted-foreground">Based on your IP address</p>
                    </div>
                    <span className="ml-auto text-lg">{countries[0].flag}</span>
                  </div>

                  <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                    {countries.map((c) => (
                      <motion.button
                        key={c.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedCountry(c)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selectedCountry.code === c.code
                            ? "bg-foreground/5 border-foreground/30"
                            : "bg-secondary/30 border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className="text-xl">{c.flag}</span>
                        <div className="text-left flex-1">
                          <p className="text-sm font-display font-semibold">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.currencySymbol} {c.currency} · ~{Math.round(c.dutyRate * 100)}% duty
                          </p>
                        </div>
                        {selectedCountry.code === c.code && (
                          <motion.div
                            layoutId="country-check"
                            className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-background" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep("language")}
                    className="mt-5 w-full py-3.5 rounded-xl bg-foreground text-background font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === "language" && (
                <motion.div
                  key="language"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-accent" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                      Step 2 of 2
                    </p>
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight mb-1">
                    Preferred language
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Choose your display language. You can change this later.
                  </p>

                  <div className="space-y-2">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          lang === l.code
                            ? "bg-foreground/5 border-foreground/30"
                            : "bg-secondary/30 border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className="text-xl">{l.flag}</span>
                        <p className="text-sm font-display font-semibold">{l.label}</p>
                        {lang === l.code && (
                          <motion.div
                            layoutId="lang-check"
                            className="ml-auto w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-background" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleFinish}
                    className="mt-6 w-full py-3.5 rounded-xl bg-checkout text-checkout-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-checkout-hover transition-colors"
                  >
                    Start Exploring
                    <Sparkles className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom branding */}
          <div className="relative z-10 pb-8 text-center">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em]">
              Powered by AI · Global Fashion Intelligence
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
