import { Search, ScanLine, User, ShoppingBag } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface HeaderProps {
  activeTab: "feed" | "scan" | "closet";
  onTabChange: (tab: "feed" | "scan" | "closet") => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-14">
        {/* Logo */}
        <h1 className="font-display font-bold text-lg tracking-tight">
          LOOK<span className="text-accent">TRACKER</span>
        </h1>

        {/* Center tabs */}
        <nav className="flex items-center gap-1 bg-secondary rounded-full p-1">
          <button
            onClick={() => onTabChange("feed")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "feed"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => onTabChange("scan")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "scan"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            Scan
          </button>
          <button
            onClick={() => onTabChange("closet")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "closet"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Closet
          </button>
        </nav>

        {/* Right - user info */}
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                <span className="text-xs font-display font-bold text-accent">
                  {user.name.charAt(0)}
                </span>
              </div>
            </div>
          ) : (
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors">
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
