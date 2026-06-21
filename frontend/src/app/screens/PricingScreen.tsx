import { motion } from "motion/react";
import { Crown, Check, X, ArrowLeft, Star } from "lucide-react";
import { useApp } from "../store";
import { useNavigate } from "react-router";
import { useIsPremium } from "../hooks/useIsPremium";

const BASIC_FEATURES = [
  { text: "5 tim năng lượng mỗi ngày", included: true },
  { text: "Truy cập Chương 1 & 2", included: true },
  { text: "Bảng xếp hạng tuần", included: true },
  { text: "3 nhiệm vụ hàng ngày", included: true },
  { text: "Tim không giới hạn", included: false },
  { text: "AI Chat không giới hạn", included: false },
  { text: "Mở khóa tất cả chương", included: false },
  { text: "Không quảng cáo", included: false },
];

const PRO_FEATURES = [
  { text: "Tim không giới hạn" },
  { text: "AI Chat không giới hạn" },
  { text: "Báo cáo học tập chi tiết" },
  { text: "Avatar & Huy hiệu Premium" },
  { text: "Không quảng cáo" },
  { text: "Mở khóa tất cả chương" },
  { text: "XP Bonus +50% mỗi bài" },
];

import { useEffect, useState } from "react";
import { API_URL } from "../store";

export default function PricingScreen() {
  const { startTrial, upgradeToPremium, user } = useApp();
  const nav = useNavigate();
  const isPremium = useIsPremium();
  const [isLoading, setIsLoading] = useState(false);
  const hasUsedTrial = user.trialEndDate !== null;

  useEffect(() => {
    // Kiem tra neu tu PayOS tra ve
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("payment_status");
    const orderCode = urlParams.get("order_code");
    
    if (status === "success" && orderCode) {
      setIsLoading(true);
      fetch(`${API_URL}/payments/verify/${orderCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            upgradeToPremium();
            nav("/home", { replace: true });
          } else {
            alert("Lỗi xác nhận thanh toán: " + data.message);
          }
        })
        .catch(err => {
          console.error(err);
          alert("Lỗi kết nối khi xác nhận thanh toán.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [nav, upgradeToPremium]);

  const handleTrial = () => {
    startTrial();
    nav("/home");
  };

  const handlePremium = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ha_token");
      const res = await fetch(`${API_URL}/payments/create-payment-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 59000 })
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // Chuyển hướng sang trang thanh toán PayOS
      } else {
        alert("Không thể tạo link thanh toán: " + (data.detail || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ khi tạo giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-y-auto pb-12"
      style={{ background: "linear-gradient(175deg, #fefce8 0%, #fdfbf7 100%)" }}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,180,41,0.15) 0%, transparent 60%)" }} className="absolute inset-0" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 pt-5 pb-2 flex items-center gap-3 max-w-5xl mx-auto">
        <button
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
          style={{ color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Hero */}
      <div className="relative z-10 text-center px-6 pt-2 pb-10 max-w-3xl mx-auto">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            border: "2px solid rgba(240,180,41,0.5)",
            boxShadow: "0 8px 32px rgba(240,180,41,0.3)",
          }}
        >
          <Crown className="w-10 h-10" style={{ color: "#d97706" }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: '"Rubik", "Inter", system-ui, sans-serif', color: "#92400e", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 800, letterSpacing: "0.02em" }}
        >
          History Alive Pro
        </motion.h1>
        <p style={{ color: "#78716c", fontSize: 16, marginTop: 12, fontFamily: '"Inter", sans-serif', maxWidth: 400 }} className="mx-auto">
          Mở khóa toàn bộ tiềm năng, cày top không giới hạn và học lịch sử thông minh hơn với trợ lý AI.
        </p>

        {isPremium && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Check className="w-4 h-4" style={{ color: "#059669" }} />
            <span style={{ color: "#059669", fontSize: 14, fontWeight: 700 }}>Bạn đang dùng gói Pro!</span>
          </div>
        )}
      </div>

      <div className="relative z-10 px-4 max-w-4xl mx-auto">
        
        {/* SaaS Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Cột 0đ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl p-6 bg-white flex flex-col"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <p style={{ color: "#78716c", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cơ bản</p>
            <div className="flex items-baseline gap-1 mt-2 mb-6">
              <span style={{ fontSize: 42, fontWeight: 800, color: "#444" }}>0đ</span>
            </div>
            
            <button 
              disabled
              className="w-full py-3.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm"
            >
              Gói hiện tại
            </button>

            <div className="mt-8 space-y-4 flex-1">
              {BASIC_FEATURES.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 ${!f.included ? 'opacity-40' : ''}`}>
                  {f.included ? <Check className="w-5 h-5 text-emerald-500 shrink-0" /> : <X className="w-5 h-5 text-gray-400 shrink-0" />}
                  <span className={`text-[15px] font-medium leading-tight ${f.included ? "text-gray-700" : "text-gray-500 line-through decoration-gray-400"}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cột Pro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl p-6 flex flex-col relative"
            style={{
              background: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)",
              border: "2px solid #fbbf24",
              boxShadow: "0 12px 40px rgba(245,158,11,0.2), 0 0 0 4px rgba(251,191,36,0.1)",
            }}
          >
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 rounded-full text-white text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Phổ biến nhất
            </div>

            <p style={{ color: "#b45309", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", display: 'flex', alignItems: 'center', gap: 6 }}>
              <Crown className="w-4 h-4" /> Gói Pro
            </p>
            <div className="flex items-baseline gap-1 mt-2 mb-6">
              <span style={{ fontSize: 42, fontWeight: 800, color: "#92400e" }}>59.000đ</span>
              <span style={{ color: "#b45309", fontSize: 15, fontWeight: 600 }}>/tháng</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(217,119,6,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePremium}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] shadow-lg flex justify-center items-center gap-2"
              style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", opacity: isLoading ? 0.7 : 1 }}
            >
              <Crown className="w-4 h-4" /> 
              {isLoading ? "Đang kết nối PayOS..." : "Nâng Cấp Pro (59.000đ)"}
            </motion.button>
            
            {!hasUsedTrial && (
              <button 
                onClick={handleTrial}
                className="w-full mt-3 py-2 text-[13px] font-semibold hover:underline transition-all"
                style={{ color: "#b45309" }}
              >
                Dùng thử 3 ngày miễn phí
              </button>
            )}

            <div className="mt-8 space-y-4 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-amber-900 font-bold text-[15px] leading-tight">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Edu Plan Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div>
            <p style={{ color: "#444", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Edu Plan (Tổ chức & Trường học)</p>
            <p style={{ color: "#78716c", fontSize: 13 }}>Gói quản lý dành riêng cho giáo viên với công cụ theo dõi tiến độ lớp học.</p>
          </div>
          <button
            className="shrink-0 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black/5 transition-colors"
            style={{ border: "1.5px solid #d6d3d1", color: "#57534e" }}
          >
            Liên hệ tư vấn
          </button>
        </motion.div>

        {/* Trust signals */}
        <p className="text-center pt-8 pb-4" style={{ color: "#a8a29e", fontSize: 12, fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
          🔒 Có thể hủy bất cứ lúc nào · Hỗ trợ thanh toán qua MoMo, ZaloPay, QR Code
        </p>
      </div>
    </div>
  );
}
