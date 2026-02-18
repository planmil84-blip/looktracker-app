import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Truck } from "lucide-react";
import { useUser, type ShippingAddress } from "@/contexts/UserContext";

interface ShippingAddressSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (address: ShippingAddress) => void;
}

const ShippingAddressSheet = ({ open, onClose, onConfirm }: ShippingAddressSheetProps) => {
  const { shippingAddress, user } = useUser();

  const [form, setForm] = useState<ShippingAddress>(
    shippingAddress || {
      recipientName: user?.name || "",
      phone: "",
      postalCode: "",
      address: "",
      addressDetail: "",
    }
  );

  const update = (key: keyof ShippingAddress, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.recipientName && form.phone && form.postalCode && form.address;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/70 backdrop-blur-md z-[65]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[65] bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-4 z-20 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-5 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-accent" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
                  배송지 정보
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                    수령인 이름
                  </label>
                  <input
                    value={form.recipientName}
                    onChange={(e) => update("recipientName", e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                    연락처
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="010-1234-5678"
                    type="tel"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                    우편번호
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.postalCode}
                      onChange={(e) => update("postalCode", e.target.value)}
                      placeholder="06000"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                    />
                    <button className="px-4 py-2.5 rounded-xl bg-foreground/10 border border-border text-xs font-semibold hover:bg-foreground/15 transition-colors flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      검색
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                    도로명 주소
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="서울특별시 강남구 테헤란로 123"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                    상세 주소
                  </label>
                  <input
                    value={form.addressDetail}
                    onChange={(e) => update("addressDetail", e.target.value)}
                    placeholder="101동 1234호"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => isValid && onConfirm(form)}
                disabled={!isValid}
                className="mt-5 w-full py-3.5 rounded-xl bg-checkout text-checkout-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-checkout-hover transition-colors disabled:opacity-40"
              >
                배송지 확인 후 결제하기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShippingAddressSheet;
