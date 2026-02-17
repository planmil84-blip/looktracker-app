import { useState } from "react";
import Header from "@/components/Header";
import CelebCard from "@/components/CelebCard";
import ScanOverlay from "@/components/ScanOverlay";
import LookDetailSheet from "@/components/LookDetailSheet";
import { mockLooks, type CelebLook } from "@/data/mockData";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"feed" | "scan">("feed");
  const [selectedLook, setSelectedLook] = useState<CelebLook | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container py-4">
        {activeTab === "feed" ? (
          <>
            {/* Section title */}
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Today's most-tracked celebrity looks
              </p>
            </div>

            {/* Masonry grid */}
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
        ) : (
          <>
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                AI Look Scanner
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload any photo to identify brands & find the best prices
              </p>
            </div>
            <ScanOverlay />
          </>
        )}
      </main>

      {/* Bottom sheet */}
      <LookDetailSheet
        look={selectedLook}
        onClose={() => setSelectedLook(null)}
      />
    </div>
  );
};

export default Index;
