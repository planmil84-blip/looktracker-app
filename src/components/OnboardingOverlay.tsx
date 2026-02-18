import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { countries, useLocale, type Country } from "@/contexts/LocaleContext";
import { useUser } from "@/contexts/UserContext";

const OnboardingOverlay = () => {
  const { country, setCountry, lang, setLang, setOnboarded, onboarded } = useLocale();
  const { setUser } = useUser();
  const location = useLocation();
  const [step, setStep] = useState<"welcome" | "login" | "country" | "language">("welcome");
  const [selectedCountry, setSelectedCountry] = useState<Country>(country);

  // Skip onboarding entirely on payment-success route
  if (onboarded || location.pathname === "/payment-success") return null;

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const handleMockLogin = (provider: "google" | "apple") => {
    const mockUsers = {
      google: { name: "지민", email: "jimin@gmail.com", provider: "google" as const },
      apple: { name: "지민", email: "jimin@icloud.com", provider: "apple" as const },
    };
    setUser(mockUsers[provider]);
    setStep("country");
  };

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
                    onClick={() => setStep("login")}
                    className="mt-10 w-full py-3.5 rounded-xl bg-foreground text-background font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {step === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
                >
                  <h2 className="font-display text-xl font-bold tracking-tight mb-1 text-center">
                    Sign in to continue
                  </h2>
                  <p className="text-xs text-muted-foreground mb-8 text-center">
                    Your scans, orders & preferences will be saved.
                  </p>

                  <div className="space-y-3">
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => handleMockLogin("google")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border hover:border-foreground/20 transition-all"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-sm font-display font-semibold">Continue with Google</span>
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => handleMockLogin("apple")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border hover:border-foreground/20 transition-all"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span className="text-sm font-display font-semibold">Continue with Apple</span>
                    </motion.button>
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => { setStep("country"); }}
                    className="mt-6 w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Skip for now
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
