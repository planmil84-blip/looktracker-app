import { useState } from "react";
import Header from "@/components/Header";
import CelebCard from "@/components/CelebCard";
import ScanOverlay from "@/components/ScanOverlay";
import LookDetailSheet from "@/components/LookDetailSheet";
import ClosetPage from "@/components/ClosetPage";
import { mockLooks, type CelebLook } from "@/data/mockData";
import { useLocale } from "@/contexts/LocaleContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"feed" | "scan" | "closet">("feed");
  const [selectedLook, setSelectedLook] = useState<CelebLook | null>(null);
  const { t, onboarded } = useLocale();

  if (!onboarded) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container py-4">
        {activeTab === "feed" ? (
          <>
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {t("trending")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("trendingSub")}
              </p>
            </div>
            <div className="masonry-grid">
              {mockLooks.map((look, i) => (
                <CelebCard
                  key={look.id}
                  look={look}
                  index={i}
                  onClick={setSelectedLook}
                />
              ))}
            </div>
          </>
        ) : activeTab === "scan" ? (
          <>
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {t("scan")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("scanSub")}
              </p>
            </div>
            <ScanOverlay />
          </>
        ) : (
          <ClosetPage />
        )}
      </main>

      <LookDetailSheet
        look={selectedLook}
        onClose={() => setSelectedLook(null)}
      />
    </div>
  );
};

export default Index;
