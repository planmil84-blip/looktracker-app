import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [showConfetti, setShowConfetti] = useState(true);

  // Force onboarded state so onboarding never appears after payment redirect
  useEffect(() => {
    sessionStorage.setItem("looktracker_onboarded", "true");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="mx-auto w-20 h-20 rounded-full bg-checkout/15 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-checkout" />
        </motion.div>

        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">
            Order Confirmed!
          </h1>
          <p className="text-sm text-muted-foreground">
            결제가 성공적으로 완료되었습니다. 주문 내역은 My Closet에서 확인하실 수 있습니다.
          </p>
        </div>

        {/* Order tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-checkout/10 border border-checkout/20">
          <ShoppingBag className="w-4 h-4 text-checkout" />
          <span className="text-xs font-display font-bold text-checkout uppercase tracking-wider">
            Purchased
          </span>
        </div>

        {sessionId && (
          <p className="text-[10px] text-muted-foreground/50 font-mono break-all">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full py-3.5 rounded-xl bg-foreground text-background font-display font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
