import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setErr("Vui lòng nhập email của bạn");
    
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.detail || "Không thể gửi yêu cầu");
      } else {
        setSuccess(data.message || "Đã gửi email khôi phục. Vui lòng kiểm tra hộp thư của bạn.");
      }
    } catch (error) {
      setErr("Lỗi kết nối đến máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8" style={{ background: "linear-gradient(145deg, #faf5e8 0%, #f5eedc 50%, #f0e8ce 100%)" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(217,119,6,0.04) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#fdfaf2] rounded-3xl p-8 shadow-2xl relative z-10"
        style={{ border: "1px solid rgba(240,180,41,0.25)" }}
      >
        <Link to="/login" className="inline-flex items-center gap-2 mb-6" style={{ color: "#d97706", fontSize: 14, fontWeight: 700, fontFamily: '"Nunito", sans-serif' }}>
          <ArrowLeft className="w-4 h-4" />
          Quay lại Đăng nhập
        </Link>
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: "radial-gradient(circle, rgba(217,119,6,0.12), rgba(255,251,235,0.9))", border: "2px solid rgba(217,119,6,0.3)" }}>
            🔑
          </div>
          <h1 style={{ color: "#1c1209", fontSize: 24, fontWeight: 900, fontFamily: '"Nunito", sans-serif', lineHeight: 1.2, marginBottom: 6 }}>
            Quên mật khẩu?
          </h1>
          <p style={{ color: "#9a8060", fontSize: 14, fontFamily: '"Nunito", sans-serif', fontWeight: 600 }}>
            Nhập email của bạn để nhận link khôi phục.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-2" style={{ color: "#78716c", fontSize: 13, fontWeight: 800, fontFamily: '"Nunito", sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErr(""); }}
              className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1.5px solid rgba(240,180,41,0.25)",
                fontSize: 15,
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 600,
                color: "#1c1209"
              }}
              placeholder="email@vidu.com"
            />
          </div>

          <AnimatePresence>
            {err && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 py-3 rounded-xl flex items-center gap-2.5" style={{ background: "#fff0f0", border: "1px solid rgba(220,38,38,0.2)" }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <p style={{ color: "#dc2626", fontSize: 12 }}>{err}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 py-3 rounded-xl flex items-center gap-2.5" style={{ background: "#ecfdf5", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <p style={{ color: "#047857", fontSize: 12 }}>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2, boxShadow: "0 6px 0 #b45309" }}
            whileTap={{ y: 4, boxShadow: "0 0px 0 #b45309" }}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
            style={{ fontSize: 16, fontFamily: '"Nunito", sans-serif', fontWeight: 900, background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 0 #b45309", color: "#fff", border: "none" }}
          >
            {loading ? "Đang xử lý..." : "Gửi Yêu Cầu"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
