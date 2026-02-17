import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  dutyRate: number; // percentage
  shippingBase: number; // USD base shipping cost
}

export const countries: Country[] = [
  { code: "KR", name: "South Korea", currency: "KRW", currencySymbol: "₩", flag: "🇰🇷", dutyRate: 0.13, shippingBase: 25 },
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$", flag: "🇺🇸", dutyRate: 0.05, shippingBase: 0 },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£", flag: "🇬🇧", dutyRate: 0.20, shippingBase: 20 },
  { code: "JP", name: "Japan", currency: "JPY", currencySymbol: "¥", flag: "🇯🇵", dutyRate: 0.10, shippingBase: 22 },
  { code: "FR", name: "France", currency: "EUR", currencySymbol: "€", flag: "🇫🇷", dutyRate: 0.20, shippingBase: 18 },
  { code: "DE", name: "Germany", currency: "EUR", currencySymbol: "€", flag: "🇩🇪", dutyRate: 0.19, shippingBase: 18 },
  { code: "CN", name: "China", currency: "CNY", currencySymbol: "¥", flag: "🇨🇳", dutyRate: 0.25, shippingBase: 20 },
  { code: "AU", name: "Australia", currency: "AUD", currencySymbol: "A$", flag: "🇦🇺", dutyRate: 0.10, shippingBase: 30 },
  { code: "SG", name: "Singapore", currency: "SGD", currencySymbol: "S$", flag: "🇸🇬", dutyRate: 0.07, shippingBase: 18 },
  { code: "CA", name: "Canada", currency: "CAD", currencySymbol: "C$", flag: "🇨🇦", dutyRate: 0.12, shippingBase: 15 },
];

// Mock exchange rates (vs USD)
export const exchangeRates: Record<string, number> = {
  USD: 1,
  KRW: 1320,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  CNY: 7.24,
  AUD: 1.53,
  SGD: 1.34,
  CAD: 1.36,
};

// i18n text structure
export const i18n: Record<string, Record<string, string>> = {
  en: {
    trending: "K-Star's Wardrobe",
    trendingSub: "Today's most-tracked K-celeb looks worldwide",
    scan: "AI Look Scanner",
    scanSub: "Upload any photo to identify brands & find the best prices",
    closet: "My Closet",
    soldOut: "Sold Out",
    inStock: "In Stock",
    rare: "Rare",
    outOfStock: "Out of Stock",
    globalPrice: "Global Price Comparison",
    findPreOwned: "Find Pre-Owned",
    preOwnedDesc: "This item is no longer available new. Browse verified pre-owned listings below.",
    estimatedTotal: "Estimated Total",
    price: "Price",
    duties: "Duties",
    shipping: "Shipping",
    landedTotal: "All-in Price",
    quickBuy: "Quick Buy",
    aiAlternatives: "AI-Curated Alternatives",
    allConditions: "All",
    brandNew: "Brand New",
    mint: "Mint",
    veryGood: "Very Good",
    fair: "Fair",
    changingCountry: "Recalculating...",
    retailPrice: "Retail Price",
  },
  ko: {
    trending: "K-스타 워드로브",
    trendingSub: "오늘 가장 많이 추적된 K-셀럽 룩",
    scan: "AI 룩 스캐너",
    scanSub: "사진을 업로드하면 AI가 브랜드를 식별하고 최저가를 찾아드립니다",
    closet: "마이 클로젯",
    soldOut: "품절",
    inStock: "재고 있음",
    rare: "희소",
    outOfStock: "품절",
    globalPrice: "글로벌 가격 비교",
    findPreOwned: "중고 찾기",
    preOwnedDesc: "새 제품은 더 이상 구매할 수 없습니다. 아래에서 검증된 중고 매물을 확인하세요.",
    estimatedTotal: "예상 합계",
    price: "가격",
    duties: "관세",
    shipping: "배송비",
    landedTotal: "총 예상가",
    quickBuy: "바로 구매",
    aiAlternatives: "AI 추천 대안",
    allConditions: "전체",
    brandNew: "새 상품",
    mint: "미개봉급",
    veryGood: "상태 좋음",
    fair: "양호",
    changingCountry: "재계산 중...",
    retailPrice: "정가",
  },
  ja: {
    trending: "K-スターのワードローブ",
    trendingSub: "今日最も注目されたK-セレブルック",
    scan: "AI ルックスキャナー",
    scanSub: "写真をアップロードしてブランドを特定し、最安値を見つけましょう",
    closet: "マイクローゼット",
    soldOut: "完売",
    inStock: "在庫あり",
    rare: "レア",
    outOfStock: "在庫切れ",
    globalPrice: "グローバル価格比較",
    findPreOwned: "中古を探す",
    preOwnedDesc: "新品は入手できません。以下の認証済み中古品をご確認ください。",
    estimatedTotal: "合計見積もり",
    price: "価格",
    duties: "関税",
    shipping: "送料",
    landedTotal: "総額",
    quickBuy: "即購入",
    aiAlternatives: "AI厳選の代替品",
    allConditions: "すべて",
    brandNew: "新品",
    mint: "未使用",
    veryGood: "美品",
    fair: "良好",
    changingCountry: "再計算中...",
    retailPrice: "定価",
  },
};

interface LocaleContextType {
  country: Country;
  setCountry: (country: Country) => void;
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
  calcDuty: (usdAmount: number) => number;
  calcShipping: (baseShipping: number) => number;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountry] = useState<Country>(countries[0]); // default KR
  const [lang, setLang] = useState("en");
  const [onboarded, setOnboarded] = useState(false);

  const t = useCallback(
    (key: string) => i18n[lang]?.[key] || i18n.en[key] || key,
    [lang]
  );

  const convertPrice = useCallback(
    (usdAmount: number) => {
      const rate = exchangeRates[country.currency] || 1;
      return Math.round(usdAmount * rate);
    },
    [country]
  );

  const formatPrice = useCallback(
    (usdAmount: number) => {
      const converted = convertPrice(usdAmount);
      if (country.currency === "USD") return `$${converted.toLocaleString()}`;
      if (country.currency === "KRW") return `₩${converted.toLocaleString()}`;
      if (country.currency === "JPY") return `¥${converted.toLocaleString()}`;
      return `${country.currencySymbol}${converted.toLocaleString()}`;
    },
    [country, convertPrice]
  );

  const calcDuty = useCallback(
    (usdAmount: number) => Math.round(usdAmount * country.dutyRate),
    [country]
  );

  const calcShipping = useCallback(
    (baseShipping: number) => country.code === "US" ? 0 : baseShipping + country.shippingBase,
    [country]
  );

  return (
    <LocaleContext.Provider
      value={{
        country,
        setCountry,
        lang,
        setLang,
        t,
        formatPrice,
        convertPrice,
        calcDuty,
        calcShipping,
        onboarded,
        setOnboarded,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};
