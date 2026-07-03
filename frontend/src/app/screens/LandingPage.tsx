import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";
import { motion, useTransform, AnimatePresence, useInView, useMotionValue, useMotionTemplate } from "motion/react";
import { useNavigate } from "react-router";
import Lenis from "lenis";
import { MASCOTS } from "../store";
import { Menu, X, ChevronRight, Play, Star, Map, Shield, BookOpen, Crown, ArrowRight, ArrowLeft, Facebook, Instagram, Twitter, MessageCircle, Send, Moon, Sun, ChevronDown, Landmark, Castle, ScrollText, Flame, GraduationCap, Sparkles, ArrowUpRight, Compass, Users, Target, Pickaxe, Trophy, Factory } from "lucide-react";

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
const ENABLE_LENIS = false;
const ENABLE_HEAVY_MOTION = false;

const CTA_PARTICLES = [
  { width: 3, height: 3, left: '12%', top: '64%', duration: 8, delay: 0 },
  { width: 5, height: 5, left: '24%', top: '36%', duration: 10, delay: 1.2 },
  { width: 4, height: 4, left: '38%', top: '72%', duration: 9, delay: 2.4 },
  { width: 6, height: 6, left: '52%', top: '28%', duration: 11, delay: 0.8 },
  { width: 3, height: 3, left: '68%', top: '62%', duration: 8.5, delay: 3.1 },
  { width: 5, height: 5, left: '82%', top: '42%', duration: 10.5, delay: 1.7 },
  { width: 4, height: 4, left: '90%', top: '74%', duration: 9.5, delay: 2.8 },
  { width: 3, height: 3, left: '46%', top: '50%', duration: 12, delay: 4 },
];

function useSmoothLandingScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!ENABLE_LENIS || media.matches) {
      document.documentElement.classList.remove('lenis', 'ha-smooth-scroll');
      return;
    }

    const lenis = new Lenis({
      duration: 0.58,
      easing: (t: number) => 1 - Math.pow(1 - t, 2.2),
      smoothWheel: true,
      wheelMultiplier: 1.04,
      touchMultiplier: 1,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    const stopForReducedMotion = () => {
      if (!media.matches) return;
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'ha-smooth-scroll');
    };

    document.documentElement.classList.add('lenis', 'ha-smooth-scroll');
    media.addEventListener('change', stopForReducedMotion);
    frame = requestAnimationFrame(raf);

    return () => {
      media.removeEventListener('change', stopForReducedMotion);
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'ha-smooth-scroll');
    };
  }, []);
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

function RevealSection({ children, className = '', delay = 0, y = 22, once = true }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.32, delay, ease: EASE_OUT_QUINT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({ children, className = '', delay = 0, y = 18 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.28, delay, ease: EASE_OUT_QUINT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LandingChapterHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <section className="relative z-20 bg-[#fdf8ef] dark:bg-[#090806] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-14 md:pt-16 pb-7 md:pb-8">
        <RevealSection y={16} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7e6] dark:bg-[#1a1208] border border-[#d97706]/20 text-[#92400e] dark:text-[#d4a844] text-[11px] font-black tracking-[0.24em] uppercase mb-4 shadow-[0_8px_30px_rgba(180,120,30,0.08)]">
            <Sparkles className="w-3.5 h-3.5" /> {eyebrow}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d1400] dark:text-[#fdf8ef] leading-tight mb-4" style={{ fontFamily: '"Nunito", sans-serif' }}>
            {title}
          </h2>
          <p className="text-base md:text-lg text-[#6f4a1f] dark:text-[#d8c7a2] leading-relaxed font-semibold" style={{ fontFamily: '"Nunito", sans-serif' }}>
            {desc}
          </p>
        </RevealSection>
      </div>
    </section>
  );
}

function StickyJourneyCTA() {
  const nav = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const updateVisibility = () => {
      const showAfter = window.innerHeight * 2.6;
      const hideNearEnd = document.documentElement.scrollHeight - window.innerHeight * 0.9;
      setVisible(window.scrollY > showAfter && window.scrollY < hideNearEnd);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => nav('/register')}
      className={`fixed bottom-5 right-5 z-50 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#2d1400] text-white border border-[#f6d365]/30 shadow-[0_16px_48px_rgba(45,20,0,0.32)] hover:bg-[#451a03] hover:-translate-y-1 transition-all duration-300 font-black tracking-widest uppercase text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d365] focus-visible:ring-offset-2 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      Bắt đầu hành trình
      <ArrowUpRight className="w-4 h-4" />
    </button>
  );
}

// S1: Navbar (Scroll-aware & Overlay Mobile Menu)
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ha_dark_mode');
    if (saved === 'true') {
      document.documentElement.classList.add('dark');
      return true;
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('ha_dark_mode', String(next));
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const navLinks = [
    { 
      label: "Tính năng", 
      id: "features",
      subItems: [
        { label: "Học qua cốt truyện", id: "explore" },
        { label: "Hệ thống nhiệm vụ", id: "features" },
        { label: "Thống kê & Phần thưởng", id: "rewards" }
      ]
    },
    { label: "Khám phá", id: "explore" },
    { label: "Lộ trình", id: "journey" },
    { label: "Đội ngũ", id: "team" },
    { label: "Liên hệ", id: "contact" }
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        aria-label="Điều hướng chính"
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#fdf8ef]/96 dark:bg-[#0a0a0a]/96 shadow-lg border-b border-[#b4781e]/10 dark:border-white/10" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          
          {/* Left: Text Logo + Image Logo */}
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer z-50 relative group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/assets/logo.png" 
              alt="History Alive Logo" 
              className="h-10 w-10 md:h-12 md:w-12 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
            />
            <span className="text-xl md:text-2xl font-black tracking-wider uppercase text-[#2d1400] dark:text-white drop-shadow-sm group-hover:text-[#d97706] transition-colors duration-300" style={{ fontFamily: '"Cinzel", serif' }}>
              History Alive
            </span>
          </div>

          {/* Center: Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((item) => (
              <div key={item.id} className="relative group/nav">
                <a 
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 text-[15px] font-bold tracking-widest uppercase text-[#2d1400]/80 dark:text-white/80 hover:text-[#d97706] dark:hover:text-[#fde68a] transition-colors py-2"
                  style={{ fontFamily: '"Nunito", sans-serif' }}
                >
                  {item.label}
                  {item.subItems && <ChevronDown className="w-4 h-4 opacity-60 group-hover/nav:rotate-180 transition-transform duration-300" />}
                </a>

                {/* Dropdown Menu */}
                {item.subItems && (
                  <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-1 w-[280px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 pointer-events-none group-hover/nav:pointer-events-auto transform group-hover/nav:-translate-y-0 translate-y-2
                    bg-[#fdfaf2] dark:bg-[#150e00] backdrop-blur-xl border border-[#d97706]/20 dark:border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden py-3"
                  >
                    {item.subItems.map((sub) => (
                      <a 
                        key={sub.id} 
                        href={`#${sub.id}`} 
                        className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-bold text-[#451a03] dark:text-white/80 hover:bg-[#fde68a]/30 dark:hover:bg-white/5 hover:text-[#d97706] dark:hover:text-[#fde68a] transition-colors"
                        style={{ fontFamily: '"Nunito", sans-serif' }}
                      >
                        {sub.icon}
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 md:gap-5 z-50 relative">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDark}
              aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#2d1400]/20 dark:border-white/20 text-[#2d1400] dark:text-white hover:bg-[#d97706]/10 dark:hover:bg-white/10 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8ef] dark:focus-visible:ring-offset-[#0a0a0a]"
            >
              {isDark ? <Sun className="w-4 h-4 group-hover:text-[#fde68a] transition-colors" /> : <Moon className="w-4 h-4 group-hover:text-[#d97706] transition-colors" />}
            </button>
            
            {/* Get In Touch (Desktop) */}
            <button 
              onClick={() => nav("/register")}
              className="hidden lg:flex items-center gap-2 border border-[#d97706]/30 dark:border-[#d97706]/50 bg-[#d97706]/5 hover:bg-[#d97706] text-[#92400e] dark:text-[#fde68a] hover:text-white px-7 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-1"
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              BẮT ĐẦU NGAY <ArrowUpRight className="w-4 h-4" />
            </button>

            {/* Hamburger (Mobile) */}
            <button 
              className="lg:hidden flex flex-col items-end justify-center w-10 h-10 space-y-1.5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8ef] dark:focus-visible:ring-offset-[#0a0a0a]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu điều hướng"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <div className={`h-0.5 bg-[#2d1400] dark:bg-white transition-all duration-300 ${menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
              <div className={`h-0.5 bg-[#2d1400] dark:bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : 'w-6'}`} />
              <div className={`h-0.5 bg-[#2d1400] dark:bg-white transition-all duration-300 ${menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <div 
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-[#fdfaf2]/98 dark:bg-[#0a0600]/98 backdrop-blur-md transition-all duration-500 lg:hidden flex flex-col justify-center items-center ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center gap-6 w-full px-6 overflow-y-auto max-h-screen py-20">
          {navLinks.map((item, i) => (
            <div key={item.id} className="flex flex-col items-center w-full">
              <a
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="text-3xl sm:text-4xl font-black uppercase text-[#2d1400] dark:text-white transition-all duration-500 hover:text-[#d97706] mb-2"
                style={{
                  fontFamily: '"Nunito", sans-serif',
                  transitionDelay: `${i * 80 + 100}ms`,
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                {item.label}
              </a>
              {/* Mobile SubItems */}
              {item.subItems && (
                <div 
                  className="flex flex-col items-center gap-3 mt-2 mb-4 w-full"
                  style={{
                    transitionDelay: `${i * 80 + 150}ms`,
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? 'translateY(0)' : 'translateY(10px)'
                  }}
                >
                  {item.subItems.map((sub) => (
                    <a 
                      key={sub.id} 
                      href={`#${sub.id}`} 
                      onClick={() => setMenuOpen(false)}
                      className="text-lg font-bold text-[#92400e] dark:text-[#d4a844] hover:text-[#d97706] opacity-80"
                      style={{ fontFamily: '"Nunito", sans-serif' }}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button 
            onClick={() => { setMenuOpen(false); nav("/register"); }}
            className="mt-6 bg-[#d97706] text-white rounded-full px-10 py-4 text-sm font-black tracking-widest uppercase shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            style={{
              transitionDelay: `${navLinks.length * 80 + 200}ms`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            BẮT ĐẦU NGAY
          </button>
        </div>
      </div>
    </>
  );
}


// S2: Hero Section (VANGUARD-inspired Fullscreen)
function Hero() {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const nav = useNavigate();

  return (
    <>
      {/* ── S2: Hero Section (VANGUARD-inspired Fullscreen) ── */}
      <section className="relative h-screen min-h-[700px] w-full flex flex-col justify-center overflow-hidden bg-[#0a0a0a]">
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/assets/bg_u1.png" alt="Bản đồ chiến trường lịch sử Việt Nam thời kỳ phong kiến" fetchPriority="high" className="w-full h-full object-cover opacity-60 dark:opacity-40 animate-scale-in" style={{ animationDuration: '4s', animationTimingFunction: 'ease-out' }} />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdf8ef]/95 via-[#fdf8ef]/70 to-transparent dark:from-[#0a0a0a]/95 dark:via-[#0a0a0a]/80 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdf8ef]/40 via-transparent to-[#fdf8ef] dark:from-[#0a0a0a]/40 dark:via-transparent dark:to-[#090806]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20">
          <div className="max-w-3xl">
            
            {/* Tagline */}
            <div className="flex items-center gap-2 mb-6 lg:mb-8 animate-fade-up">
              <Crown className="w-4 h-4 text-[#d97706]" />
              <span className="text-[#92400e] dark:text-[#d4a844] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Nền Tảng Học Lịch Sử Thế Hệ Mới
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="flex flex-col text-[#2d1400] dark:text-white uppercase leading-[0.92] tracking-tight animate-fade-up-delay-1" style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900 }}>
              <span className="text-[clamp(2.8rem,8vw,7rem)] drop-shadow-sm">Khám Phá.</span>
              <span className="text-[clamp(2.8rem,8vw,7rem)] drop-shadow-sm text-[#d97706]">Nhập Vai.</span>
              <span className="text-[clamp(2.8rem,8vw,7rem)] drop-shadow-sm">Sống Lại.</span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 lg:mt-8 text-sm sm:text-base text-[#6f4a1f] dark:text-white/70 font-semibold leading-relaxed max-w-md animate-fade-up-delay-2" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Mỗi bài học mở ra như một cảnh phim: có bối cảnh, nhân vật đồng hành, lựa chọn và thử thách.<br />
              <span className="text-[#2d1400] dark:text-white font-bold">Bạn không ghi nhớ lịch sử — bạn bước vào lịch sử.</span>
            </p>

            {/* CTA Row */}
            <div className="mt-8 lg:mt-12 flex flex-wrap items-center gap-4 sm:gap-6 animate-fade-up-delay-3">
              <button 
                onClick={() => nav("/register")}
                className="group flex items-center gap-3 bg-[#2d1400] dark:bg-white hover:bg-[#451a03] dark:hover:bg-neutral-200 text-white dark:text-black px-8 py-5 sm:px-10 sm:py-5 rounded-2xl text-sm sm:text-base font-black tracking-widest uppercase transition-all shadow-[0_8px_30px_rgba(45,20,0,0.4)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8ef] dark:focus-visible:ring-offset-[#0a0a0a]"
                style={{ fontFamily: '"Nunito", sans-serif' }}
              >
                BẮT ĐẦU NGAY 
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-[#6f4a1f] dark:text-white/55">Miễn phí • Học thử ngay • Không cần thẻ</span>
            </div>

            {/* Stats Row */}
            <div className="mt-8 sm:mt-10 lg:mt-14 flex flex-wrap gap-6 sm:gap-12 lg:gap-16 animate-fade-up-delay-4">
              <div>
                <div className="text-[#2d1400] dark:text-white text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>10,000+</div>
                <div className="text-[#92400e] dark:text-[#d4a844] text-[9px] sm:text-xs font-bold tracking-widest uppercase mt-1">Nhà Thám Hiểm</div>
              </div>
              <div>
                <div className="text-[#2d1400] dark:text-white text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>5+</div>
                <div className="text-[#92400e] dark:text-[#d4a844] text-[9px] sm:text-xs font-bold tracking-widest uppercase mt-1">Thời Kỳ Lịch Sử</div>
              </div>
              <div>
                <div className="text-[#2d1400] dark:text-white text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>100+</div>
                <div className="text-[#92400e] dark:text-[#d4a844] text-[9px] sm:text-xs font-bold tracking-widest uppercase mt-1">Nhiệm Vụ</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── S2.5: Web Theater Mockup (Moved from Hero) ── */}
      <section id="explore" className="relative py-24 bg-[#fdf8ef] dark:bg-[#090806]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          
          <div className="text-center mb-16 max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-[#2d1400] dark:text-[#fdf8ef] py-2 leading-relaxed" style={{ fontFamily: '"Cinzel", serif' }}>
              Trải Nghiệm{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#c0392b] dark:from-[#f6d365] dark:to-[#fca5a5]">
                Điện Ảnh
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#6f4a1f] dark:text-[#d8c7a2] font-medium leading-relaxed" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Một bài học không còn là trang chữ tĩnh. Nó trở thành một cảnh phim tương tác, nơi người học nghe nhân vật kể chuyện, chọn hướng đi và mở khóa tri thức qua từng nhiệm vụ.
            </p>
          </div>

          <div className="relative w-full max-w-[800px] flex justify-center" style={{ perspective: 1200 }}>
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#d97706]/14 to-[#c0392b]/10 blur-[56px] rounded-full scale-90" aria-hidden="true" />

            {/* Browser frame */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.55, ease: EASE_OUT_QUINT }}
              className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border border-black/10 dark:border-white/10"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Browser chrome */}
              <div className="bg-[#1c1208] border-b border-white/8 px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-white/20" />
                  <span className="text-white/30 text-xs font-mono">historyalive.vn/lesson/7/vương-triều</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#d97706] text-white px-3 py-1.5 rounded-lg text-xs font-black">
                  <Star className="w-3.5 h-3.5" /> 120 XP
                </div>
              </div>

              {/* Screen content */}
              <div className="relative bg-[#1a1208] overflow-hidden" style={{ height: 480 }}>
                <img src="/assets/bg_unit_1.png" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

                {/* Top bar */}
                <div className="absolute top-0 inset-x-0 px-6 pt-5 flex justify-between items-center z-10">
                  <div className="bg-black/65 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d97706] animate-pulse" />
                    <span className="text-white text-xs font-bold tracking-wide">Lớp 7 · Chương 3</span>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="bg-[#dc2626] text-white px-3 py-1.5 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-lg">🔥 14</div>
                    <div className="bg-[#d97706] text-white px-3 py-1.5 rounded-xl text-sm font-black shadow-lg">💎 80</div>
                  </div>
                </div>

                {/* Mascot */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-[130px] left-1/2 -translate-x-1/2 w-40 h-48 z-10"
                >
                  <img src={MASCOTS.find(m => m.id === 'hung')?.img} alt="Nhân vật Hùng — người dẫn chuyện lịch sử" loading="lazy" className="w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)]" />
                </motion.div>

                {/* Dialogue panel */}
                <div className="absolute bottom-5 inset-x-5 z-20">
                  <div className="bg-black/80 border border-white/10 rounded-2xl p-5 mb-4 shadow-2xl">
                    <p className="text-xs font-black text-[#d97706] mb-2 tracking-widest">GẤU TRÚC HỌC GIẢ</p>
                    <p className="text-white/95 text-base leading-relaxed font-medium" style={{ fontFamily: '"Nunito", sans-serif' }}>
                      "Thế trận lòng dân mới là bức tường thành vững chắc nhất. Ngươi có hiểu không?"
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[#d97706] hover:bg-[#f59e0b] text-[#2d1400] text-center py-3 rounded-xl text-sm font-black shadow-lg cursor-pointer transition-colors">Tiếp tục →</div>
                    <div className="px-5 py-3 rounded-xl text-sm font-black border border-white/20 text-white/70 hover:bg-white/10 cursor-pointer transition-colors">Bỏ qua</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Removed Floating XP and Streak widgets to declutter the cinematic experience */}
          </div>
        </div>
      </section>
      
      {/* Trailer Modal */}
      <AnimatePresence>
        {isTrailerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setIsTrailerOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white hover:text-[#d97706] transition-colors">
              <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/ka2ExSKBwC8" 
                title="Trailer" 
                frameBorder="0" 
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CountUpNumber({ target, suffix = "" }: { target: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();
      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeProgress * target));
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(update);
    }
  }, [inView, target]);

  return <span ref={nodeRef}>{count.toLocaleString()}{suffix}</span>;
}

// S3: Social Proof Bar
function SocialProofBar() {
  const stats = [
    { 
      label: "Học sinh tham gia", 
      value: <CountUpNumber target={10000} suffix="+" />, 
      icon: (
        <svg className="w-10 h-10 text-[#d97706] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) 
    },
    { label: "Đánh giá 5 sao", value: <CountUpNumber target={95} suffix="%" />, icon: <Star className="w-10 h-10 text-[#f59e0b] drop-shadow-sm" fill="currentColor" /> },
    { label: "Chương lịch sử", value: <CountUpNumber target={4} suffix="+" />, icon: <ScrollText className="w-10 h-10 text-[#c0392b] drop-shadow-sm" /> },
    { 
      label: (
        <>
          <span className="block font-black" style={{ background: 'linear-gradient(90deg,#d97706,#c0392b,#3a6eaa,#c0387e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Mèo Mướp · Gấu Trúc
          </span>
          <span className="block font-black" style={{ background: 'linear-gradient(90deg,#3a6eaa,#c0387e,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Sói Lam · Thỏ Ngọc
          </span>
          <span className="block text-[10px] text-[#92400e] dark:text-[#d1d5db] tracking-wider normal-case">& 2 nhân vật khác</span>
        </>
      ), 
      value: <CountUpNumber target={6} />, 
      icon: (
        <svg className="w-10 h-10 text-[#92400e] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <section className="py-12 bg-[#f2e8d5] dark:bg-[#0a0a0a] relative z-20 border-b border-[#b4781e]/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <RevealItem
              key={i}
              delay={i * 0.06}
              y={16}
              className="flex flex-col items-center text-center group min-w-0"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</span>
              <h4 className="text-3xl md:text-4xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-1" style={{ fontFamily: '"Nunito", sans-serif' }}>
                {stat.value}
              </h4>
              <p className="text-sm font-bold text-[#92400e] dark:text-[#d1d5db] uppercase tracking-wider">{stat.label}</p>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}

// S4: How It Works
function HowItWorks() {
  const steps = [
    {
      icon: Compass,
      kicker: "Bước 01",
      title: "Chọn thời kỳ",
      desc: "Từ chương học thật, History Alive mở ra một bản đồ chiến dịch: người học biết mình đang bước vào giai đoạn nào, vì sao nó quan trọng và nhiệm vụ tiếp theo là gì.",
      tone: 'from-[#f6d365] to-[#d4a844]',
      glow: 'shadow-[0_0_24px_rgba(212,168,68,0.45)]',
      textTone: 'text-[#92400e] dark:text-[#fde68a]'
    },
    {
      icon: Users,
      kicker: "Bước 02",
      title: "Gặp người dẫn chuyện",
      desc: "Mascot và nhân vật lịch sử không chỉ trang trí. Họ đặt câu hỏi, gợi bối cảnh và biến sự kiện thành cuộc đối thoại có cảm xúc.",
      tone: 'from-[#38bdf8] to-[#0284c7]',
      glow: 'shadow-[0_0_24px_rgba(2,132,199,0.45)]',
      textTone: 'text-[#0c4a6e] dark:text-[#bae6fd]'
    },
    {
      icon: Target,
      kicker: "Bước 03",
      title: "Hành động để ghi nhớ",
      desc: "Quiz, lựa chọn, XP và phần thưởng xuất hiện đúng lúc để củng cố kiến thức. Người học nhớ vì đã tham gia, không phải vì học vẹt.",
      tone: 'from-[#f43f5e] to-[#9f1239]',
      glow: 'shadow-[0_0_24px_rgba(159,18,57,0.45)]',
      textTone: 'text-[#4c0519] dark:text-[#fecdd3]'
    }
  ];

  return (
    <section id="features" className="relative z-10 overflow-hidden bg-gradient-to-b from-[#fdf8ef] via-[#fbf1dd] to-[#f7f0e2] dark:from-[#121212] dark:via-[#120d08] dark:to-[#1a1208] py-18 md:py-22 scroll-mt-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-10 lg:gap-16 items-start">
          <RevealSection y={12} className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff7e6] dark:bg-[#1a1208] border border-[#d97706]/20 text-[#92400e] dark:text-[#f6d365] text-[11px] font-black tracking-[0.22em] uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Cách hoạt động
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#2d1400] dark:text-[#fdf8ef] leading-[0.98] mb-5" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Một bài học trở thành một nhiệm vụ sống động.
            </h2>
            <p className="text-lg md:text-xl text-[#6f4a1f] dark:text-[#d8c7a2] leading-relaxed font-semibold max-w-xl">
              Thay vì ném thêm hiệu ứng, History Alive dùng ba nhịp rõ ràng: định hướng, đồng hành và hành động.
            </p>
          </RevealSection>

          <div className="relative space-y-5 md:space-y-6">
            <div className="hidden md:block absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-[#d97706]/0 via-[#d97706]/35 to-[#d97706]/0" />
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
              <RevealItem key={step.title} delay={i * 0.045} y={14} className="relative">
                <article className="group grid md:grid-cols-[4.5rem_1fr] gap-5 rounded-[2rem] border border-[#e8d9b8] dark:border-[#d97706]/20 bg-[#fffaf0]/82 dark:bg-[#160f08]/78 p-5 md:p-6 shadow-[0_10px_30px_rgba(180,120,30,0.07)] transition-colors duration-300 hover:border-[#d97706]/45">
                  <div className="relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${step.tone} p-[1.5px] ${step.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full bg-[#fff7e6] dark:bg-[#120e0a] rounded-[15px] flex items-center justify-center">
                        <Icon className={`w-7 h-7 ${step.textTone}`} strokeWidth={1.5} />
                      </div>
                    </div>
                    <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-[#c0392b] text-white text-xs font-black grid place-items-center border-2 border-[#fffaf0] dark:border-[#160f08] shadow-sm z-20">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c0392b] dark:text-[#f59e0b] mb-2">{step.kicker}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>{step.title}</h3>
                    <p className="text-[#7a5425] dark:text-[#d8c7a2] leading-relaxed font-semibold">{step.desc}</p>
                  </div>
                </article>
              </RevealItem>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// S5: Feature Showcase (Product Proof)
function FeatureShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f0e2] via-[#f3e4c7] to-[#fdf8ef] dark:from-[#1a1208] dark:via-[#100b06] dark:to-[#090806] py-16 md:py-20 border-y border-[#b4781e]/10 dark:border-[#d97706]/10">
      <div className="absolute inset-0 opacity-[0.055]" style={{ backgroundImage: 'linear-gradient(90deg, #92400e 1px, transparent 1px), linear-gradient(#92400e 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-10 md:mb-12 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#c0392b] dark:text-[#f59e0b] mb-3">Bằng chứng sản phẩm</p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d1400] dark:text-[#fdf8ef] leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
            Không chỉ có game. Mỗi cơ chế đều kéo kiến thức về đúng ngữ cảnh.
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 md:gap-8 items-stretch">
          <RevealSection y={16} className="min-h-[520px] rounded-[2.25rem] bg-gradient-to-br from-[#1a1208] via-[#2d1400] to-[#4a160f] p-7 md:p-10 overflow-hidden relative border border-[#f6d365]/20 shadow-[0_24px_70px_rgba(45,20,0,0.22)]">
            <div className="absolute inset-0 opacity-20 bg-[url('/assets/bg_u1.png')] bg-cover bg-center" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#fde68a] text-xs font-black uppercase tracking-[0.18em] border border-white/10">Bản đồ chiến dịch</span>
                <h3 className="mt-5 text-4xl md:text-6xl font-black text-[#fff8ec] leading-[0.95]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  Học lịch sử như mở khóa một vùng đất.
                </h3>
                <p className="mt-5 text-lg md:text-xl text-[#ead3a4] max-w-2xl leading-relaxed font-semibold">
                  Địa danh, nhân vật, quiz và phần thưởng được đặt trên cùng một hành trình để người học thấy kiến thức liên kết thay vì rơi thành từng mảnh.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 md:gap-4 mt-10">
                {['Mốc sử rõ ràng', 'Nhiệm vụ ngắn', 'XP đúng lúc'].map((label) => (
                  <div key={label} className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-[#fff8ec] font-black text-sm backdrop-blur-sm">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          <div className="grid gap-6">
            <RevealItem y={12} className="rounded-[2rem] bg-[#fffaf0] dark:bg-[#160f08] border border-[#e8d9b8] dark:border-[#d97706]/20 p-7 shadow-[0_14px_34px_rgba(180,120,30,0.08)]" delay={0.04}>
              <div id="features-story" className="w-12 h-12 rounded-2xl bg-[#fff1d6] text-[#d97706] flex items-center justify-center mb-5 border border-[#f1c27b]"><ScrollText className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>Cốt truyện dẫn mạch</h3>
              <p className="text-[#7a5425] dark:text-[#d8c7a2] font-semibold leading-relaxed">Mỗi sự kiện được đưa vào một tình huống có người nói, có lựa chọn và có hậu quả.</p>
            </RevealItem>

            <RevealItem y={12} className="rounded-[2rem] bg-[#fffaf0] dark:bg-[#160f08] border border-[#e8d9b8] dark:border-[#d97706]/20 p-7 shadow-[0_14px_34px_rgba(180,120,30,0.08)]" delay={0.08}>
              <div id="features-missions" className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#c0392b] flex items-center justify-center mb-5 border border-[#fecaca]"><Shield className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>Thử thách có nhịp</h3>
              <p className="text-[#7a5425] dark:text-[#d8c7a2] font-semibold leading-relaxed">Quiz và nhiệm vụ xuất hiện sau ngữ cảnh, giúp kiểm tra hiểu biết chứ không cắt ngang câu chuyện.</p>
            </RevealItem>

            <RevealItem y={12} className="rounded-[2rem] bg-[#fffaf0] dark:bg-[#160f08] border border-[#e8d9b8] dark:border-[#d97706]/20 p-7 shadow-[0_14px_34px_rgba(180,120,30,0.08)]" delay={0.12}>
              <div id="features-rewards" className="w-12 h-12 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center mb-5 border border-[#fde68a]"><Crown className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>Phần thưởng củng cố</h3>
              <p className="text-[#7a5425] dark:text-[#d8c7a2] font-semibold leading-relaxed">XP, streak và bộ sưu tập là tín hiệu tiến bộ, không phải hiệu ứng trang trí.</p>
            </RevealItem>
          </div>
        </div>
      </div>
    </section>
  );
}

// S6: Problem Section
function ProblemSection() {
  const problems = [
    {
      icon: (
        <svg className="w-12 h-12 text-[#92400e] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Ghi Nhớ Máy Móc",
      desc: "Những con số và sự kiện khô khan che lấp đi bức tranh hào hùng của dân tộc, khiến lịch sử trở thành gánh nặng thay vì niềm tự hào."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#c0392b] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Đứt Gãy Cảm Xúc",
      desc: "Cách tiếp cận một chiều làm mất đi linh hồn của những trang sử thi, khiến thế hệ trẻ khó lòng đồng cảm với tiền nhân."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#d97706] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Thiếu Vắng Tương Tác",
      desc: "Người học bị đặt ở vị trí thụ động, thiếu đi không gian để tự mình khám phá và sống trong dòng chảy thời gian."
    }
  ];

  return (
    <section className="py-24 md:py-28 bg-[#f2e8d5] dark:bg-[#0a0a0a] relative z-10 overflow-hidden">
      {/* Dynamic background particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[34vw] h-[34vw] bg-[#c0392b]/10 blur-[56px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[28vw] h-[28vw] bg-[#d97706]/10 blur-[48px] rounded-full mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-[#c0392b] to-[#d97706] text-white font-black text-sm tracking-[0.25em] uppercase mb-8 shadow-[0_4px_20px_rgba(192,57,43,0.4)]"
          >
            Vấn Đề Cốt Lõi
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-[#2d1400] dark:text-[#fdf8ef] max-w-4xl mx-auto leading-[1.1]" 
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            Tại sao môn lịch sử lại <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0392b] to-[#d97706]">khô khan</span> đến thế?
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((prob, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.32, ease: EASE_OUT_QUINT }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="relative bg-white/82 dark:bg-[#1f160e]/90 rounded-[2rem] p-8 md:p-10 border border-[#e8d9b8] dark:border-[#d97706]/30 transition-all duration-300 shadow-[0_8px_30px_rgba(180,120,30,0.06)] hover:shadow-[0_20px_40px_rgba(217,119,6,0.12)] group overflow-hidden hover:border-[#d97706]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#c0392b]/5 to-[#d97706]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 text-6xl mb-8 transform group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all duration-300 origin-left">{prob.icon}</div>
              <h3 className="relative z-10 text-2xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-4" style={{ fontFamily: '"Nunito", sans-serif' }}>{prob.title}</h3>
              <p className="relative z-10 text-[#92400e] dark:text-[#d8c7a2] text-lg leading-relaxed font-medium">{prob.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3D Tilt Card Wrapper with Spotlight
function TiltCard({ children, className, delay = 0 }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  // Spotlight state
  const [hovering, setHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovering(false);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {/* Spotlight glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-20"
        animate={{ opacity: hovering ? 1 : 0 }}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

// S7: Curriculum Journey — Quest Map
function CurriculumJourney() {
  const curriculums = [
    {
      stage: 'THCS',
      grade: 'Lớp 6',
      title: 'Dấu chân đầu tiên của lịch sử',
      focus: 'Nguồn gốc loài người • Văn minh cổ đại • Việt Nam thời nguyên thủy',
      status: 'Nền tảng',
      icon: Pickaxe,
      tone: 'from-[#f6d365] to-[#d4a844]',
      borderColor: 'border-[#d4a844]',
      glow: 'shadow-[0_4px_24px_rgba(212,168,68,0.35)]',
      textTone: 'text-[#92400e] dark:text-[#fde68a]',
    },
    {
      stage: 'THCS',
      grade: 'Lớp 7',
      title: 'Vương triều và bản sắc Đại Việt',
      focus: 'Đại Việt • Đông Nam Á • Các triều đại phong kiến',
      status: 'Hành trình chính',
      icon: Crown,
      tone: 'from-[#fb923c] to-[#c0392b]',
      borderColor: 'border-[#c0392b]',
      glow: 'shadow-[0_4px_24px_rgba(192,57,43,0.35)]',
      textTone: 'text-[#7f1d1d] dark:text-[#fca5a5]',
    },
    {
      stage: 'THCS',
      grade: 'Lớp 8',
      title: 'Biến động cận đại',
      focus: 'Cách mạng tư sản • Chủ nghĩa tư bản • Việt Nam thế kỷ XIX',
      status: 'Chương tiếp theo',
      icon: Factory,
      tone: 'from-[#38bdf8] to-[#0284c7]',
      borderColor: 'border-[#0284c7]',
      glow: 'shadow-[0_4px_24px_rgba(2,132,199,0.35)]',
      textTone: 'text-[#0c4a6e] dark:text-[#bae6fd]',
    },
    {
      stage: 'THCS',
      grade: 'Lớp 9',
      title: 'Việt Nam trong thế kỷ XX',
      focus: 'Kháng chiến • Xây dựng đất nước • Thế giới hiện đại',
      status: 'Nâng cao',
      icon: Flame,
      tone: 'from-[#f43f5e] to-[#9f1239]',
      borderColor: 'border-[#9f1239]',
      glow: 'shadow-[0_4px_24px_rgba(159,18,57,0.35)]',
      textTone: 'text-[#4c0519] dark:text-[#fecdd3]',
    },
    {
      stage: 'THPT',
      grade: 'Lớp 10–12',
      title: 'Chuyên đề & luyện thi',
      focus: 'Tư duy lịch sử • Chủ đề chuyên sâu • Ôn thi tốt nghiệp',
      status: 'Định hướng 2026',
      icon: GraduationCap,
      tone: 'from-[#34d399] to-[#059669]',
      borderColor: 'border-[#059669]',
      glow: 'shadow-[0_4px_24px_rgba(5,150,105,0.35)]',
      textTone: 'text-[#022c22] dark:text-[#a7f3d0]',
    },
  ];

  const promiseItems = [
    { label: 'Bám chương trình học', sub: 'Theo SGK Bộ GD&ĐT' },
    { label: 'Chia theo lớp 6–12', sub: 'THCS & THPT' },
    { label: 'Học bằng nhiệm vụ', sub: 'Không học vẹt' },
  ];

  return (
    <section id="journey" className="relative py-28 md:py-36 bg-[#fff7e6] dark:bg-[#090806] overflow-hidden scroll-mt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(212,168,68,0.06)_0%,transparent_70%)] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[radial-gradient(circle,rgba(140,29,64,0.04)_0%,transparent_70%)] rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.045]" style={{ backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
          
          {/* ── Left side: Marketing Copy (Sticky) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase mb-8
              bg-gradient-to-r from-[#d4a844]/20 to-transparent text-[#92400e] dark:text-[#fde68a] border-l-4 border-[#d97706]">
              <Sparkles className="w-4 h-4" /> Lộ trình theo chương trình
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.05] tracking-tight mb-6 text-[#2d1400] dark:text-[#fff7e6]" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Hành Trình<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#b45309] dark:from-[#f6d365] dark:to-[#d4a844]">Lịch Sử</span><br />
              Theo Lớp Học
            </h2>

            <p className="text-lg md:text-xl text-[#6f4a1f] dark:text-[#d8c7a2] mb-10 leading-relaxed max-w-md">
              Từ lớp 6 đến lớp 12, mỗi chương học trở thành một <span className="font-bold text-[#b45309] dark:text-[#fde68a]">tuyến nhiệm vụ</span> — có bối cảnh sử thi, nhân vật đồng hành và thử thách đích thực.
            </p>

            <div className="space-y-6 mb-12">
              {promiseItems.map((p, i) => (
                <div key={p.label} className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-[#fdf8ef] dark:bg-[#1a1208] border border-[#d97706]/30 flex items-center justify-center shrink-0 shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#f6d365] to-[#d97706]" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#2d1400] dark:text-[#fdf8ef]">{p.label}</div>
                    <div className="text-sm font-semibold tracking-wide text-[#92400e] dark:text-[#a8987a] mt-0.5">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>

          {/* ── Right side: Vertical Quest Timeline ── */}
          <div className="relative pl-8 md:pl-12 py-8 mt-10 lg:mt-0">
            {/* The Main Vertical Track */}
            <div className="absolute top-8 bottom-12 left-0 w-1.5 bg-gradient-to-b from-[#d97706]/10 via-[#d97706]/20 to-transparent rounded-full" />
            
            <div className="space-y-12 md:space-y-16">
              {curriculums.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.grade}
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="relative group"
                  >
                    {/* Glowing Node */}
                    <div className={`absolute top-1/2 -translate-y-1/2 -left-[35px] md:-left-[51px] w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${item.tone} border-4 border-[#fff7e6] dark:border-[#090806] z-10 group-hover:scale-125 transition-transform duration-300 ease-out ${item.glow}`} />

                    {/* Mission Card */}
                    <div className="relative bg-white/85 dark:bg-[#15110a]/92 rounded-[2.5rem] p-7 md:p-9 border border-[#ead8b8] dark:border-white/5 hover:border-[#d97706]/30 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_8px_30px_rgba(180,120,30,0.06)] hover:shadow-[0_20px_40px_rgba(217,119,6,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                      {/* Background Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.tone} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.08] rounded-[2.5rem] transition-opacity duration-300`} />
                      
                      <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                        {/* Icon Box */}
                        <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-[1.25rem] bg-white dark:bg-[#120e0a] border-[1.5px] ${item.borderColor} ${item.glow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-20`}>
                          <Icon className={`w-8 h-8 md:w-9 md:h-9 ${item.textTone}`} strokeWidth={1.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="text-sm md:text-base font-black tracking-[0.2em] uppercase text-[#92400e] dark:text-[#d4a844]" style={{ fontFamily: '"Cinzel", serif' }}>
                              {item.stage} • {item.grade}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${item.tone} text-white shadow-sm`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl md:text-[1.75rem] font-black text-[#2d1400] dark:text-[#fdf8ef] mb-3 leading-[1.2]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                            {item.title}
                          </h3>
                          
                          <p className="text-base md:text-lg text-[#6f4a1f] dark:text-[#a8987a] leading-relaxed font-medium">
                            {item.focus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Mascot Carousel Showcase (TOONHUB-inspired, History Alive edition) ───

const CAROUSEL_MASCOTS = [
  {
    id: 'mieu',
    name: 'Mèo Mướp',
    role: 'Người Kể Chuyện Dân Gian',
    message: 'Một người bạn lanh lợi, ấm áp, luôn biết cách tìm lịch sử trong ca dao, nếp nhà và ký ức đời thường; bạn ấy giúp những sự kiện xa xưa trở nên gần gũi như câu chuyện được kể bên bếp lửa.',
    panelColor: '#d4a844', bgColor: '#b8811f',
  },
  {
    id: 'hung',
    name: 'Gấu Trúc Học Giả',
    role: 'Người Giữ Sử Ký',
    message: 'Một bậc uyên thâm về kiến thức lịch sử, người có thể mở từng lớp nguyên nhân, hệ quả và bối cảnh để biến những mốc thời gian khô khan thành hiểu biết có chiều sâu.',
    panelColor: '#7a5230', bgColor: '#4a2e10',
  },
  {
    id: 'bao',
    name: 'Sói Lam Chiến Binh',
    role: 'Người Dẫn Đường Trận Mạc',
    message: 'Một chiến binh mạnh mẽ và sắc bén, người có thể đưa bạn vào trung tâm trận đánh, đọc thế trận, phân tích chiến thuật và nhận ra vì sao một quyết định có thể xoay chuyển lịch sử.',
    panelColor: '#3a6eaa', bgColor: '#1e3f6a',
  },
  {
    id: 'ngoc',
    name: 'Thỏ Ngọc Mộng Mơ',
    role: 'Người Mở Cổng Huyền Sử',
    message: 'Một người dẫn lối mềm mại và giàu tưởng tượng, có thể kết nối truyền thuyết, biểu tượng và cảm xúc để lịch sử hiện lên lung linh mà vẫn giữ trọn tinh thần cốt lõi.',
    panelColor: '#c0387e', bgColor: '#7a1a50',
  },
];

function MascotCarouselShowcase() {
  const total = CAROUSEL_MASCOTS.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const nav = useNavigate();

  // Build mascot list with actual images from MASCOTS store
  const mascotData = CAROUSEL_MASCOTS.map(cm => {
    const storeM = MASCOTS.find(m => m.id === cm.id);
    return { ...cm, img: storeM?.img ?? '' };
  });

  // Preload images on mount
  useEffect(() => {
    mascotData.forEach(m => {
      if (m.img) {
        const img = new Image();
        img.src = m.img;
      }
    });
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(prev =>
      dir === 'next' ? (prev + 1) % total : (prev + total - 1) % total
    );
    setTimeout(() => setIsAnimating(false), 650);
  };

  const center = activeIndex;
  const left   = (activeIndex + total - 1) % total;
  const right  = (activeIndex + 1) % total;
  const back   = (activeIndex + 2) % total;

  const getRole = (idx: number) => {
    if (idx === center) return 'center';
    if (idx === left)   return 'left';
    if (idx === right)  return 'right';
    return 'back';
  };

  const getRoleStyle = (role: string): CSSProperties => {
    const ease = '650ms cubic-bezier(0.4,0,0.2,1)';
    const base: CSSProperties = {
      position: 'absolute',
      transition: `width ${ease}, height ${ease}, left ${ease}, bottom ${ease}, filter ${ease}, opacity ${ease}, transform ${ease}`,
      willChange: 'width, height, left, bottom, filter, opacity',
    };
    switch (role) {
      case 'center': return {
        ...base,
        width: isMobile ? '78%' : '55%',
        height: '100%',
        left: '50%',
        bottom: '0',
        transform: 'translateX(-50%)',
        filter: 'none',
        opacity: 1,
        zIndex: 20,
      };
      case 'left': return {
        ...base,
        width: isMobile ? '16%' : '13%',
        height: 'auto',
        left: isMobile ? '14%' : '20%',
        bottom: isMobile ? '7%' : '10%',
        transform: 'translateX(-50%)',
        filter: 'blur(1.8px)',
        opacity: 0.78,
        zIndex: 10,
      };
      case 'right': return {
        ...base,
        width: isMobile ? '16%' : '13%',
        height: 'auto',
        left: isMobile ? '86%' : '80%',
        bottom: isMobile ? '7%' : '10%',
        transform: 'translateX(-50%)',
        filter: 'blur(1.8px)',
        opacity: 0.78,
        zIndex: 10,
      };
      default: return {
        ...base,
        width: isMobile ? '10%' : '9%',
        height: 'auto',
        left: '50%',
        bottom: isMobile ? '8%' : '12%',
        transform: 'translateX(-50%)',
        filter: 'blur(3.5px)',
        opacity: 0.38,
        zIndex: 5,
      };
    }
  };

  const active = mascotData[activeIndex];

  return (
    <div
      style={{
        backgroundColor: active.bgColor,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
        fontFamily: "'Rubik', 'Inter', sans-serif",
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: isMobile ? '620px' : 'clamp(620px, 82vh, 760px)', minHeight: isMobile ? 600 : 620, overflow: 'hidden' }}>

        {/* Grain overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            opacity: 0.4,
          }}
        />
        {/* Ghost text — "BẠN ĐỒNG HÀNH" fit trong frame */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20%',
            left: 0, right: 0,
            transform: 'translateY(-50%)',
            zIndex: 6,
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'visible',
          }}
        >
          <span style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(72px, 13vw, 208px)',
            fontWeight: 900,
            color: 'white',
            opacity: 0.13,
            lineHeight: 1.16,
            paddingTop: '0.08em',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            display: 'block',
            position: 'relative',
            zIndex: 6,
          }}>BẠN ĐỒNG HÀNH</span>
        </div>

        {/* Top-left brand label */}
        <div style={{ position: 'absolute', top: 24, left: isMobile ? 16 : 32, zIndex: 60 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'white', opacity: 0.9,
          }}>HISTORY ALIVE</span>
        </div>

        {/* Carousel */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          {mascotData.map((m, i) => {
            const role = getRole(i);
            return (
              <div key={m.id} style={getRoleStyle(role)}>
                <img
                  src={m.img}
                  alt={`${m.name} — ${m.role}`}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: role === 'center' ? 'bottom center' : 'bottom center',
                    display: 'block',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom-left: title + description + nav */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 20 : 64,
          left: isMobile ? 16 : 80,
          zIndex: 60,
          maxWidth: isMobile ? 'calc(100vw - 32px)' : 520,
        }}>
          <div style={{
            marginBottom: isMobile ? 8 : 12,
            maxWidth: isMobile ? 'calc(100vw - 32px)' : 520,
          }}>
            <p style={{
              fontWeight: 900,
              letterSpacing: '-0.04em',
              marginBottom: 4,
              fontSize: isMobile ? 'clamp(22px, 7vw, 30px)' : 'clamp(32px, 3.2vw, 42px)',
              lineHeight: 0.95,
              color: 'white',
              whiteSpace: 'nowrap',
              textShadow: `0 8px 28px ${active.panelColor}, 0 2px 0 rgba(45,20,0,0.25)`,
              fontFamily: '"Nunito", sans-serif',
            }}>
              {active.name}
            </p>
            <p style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontSize: isMobile ? 10 : 12,
              color: 'white',
              opacity: 0.92,
            }}>
              {active.role}
            </p>
          </div>
          {!isMobile && (
            <p style={{
              fontSize: 13, color: 'white', opacity: 0.85, lineHeight: 1.7, marginBottom: 18,
              transition: 'opacity 400ms',
            }}>
              {active.message}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            {(['prev', 'next'] as const).map(dir => (
              <button
                key={dir}
                aria-label={dir === 'prev' ? 'Nhân vật trước' : 'Nhân vật tiếp theo'}
                onClick={() => navigate(dir)}
                className="focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  width: isMobile ? 44 : 56, height: isMobile ? 44 : 56,
                  borderRadius: '50%', background: 'transparent',
                  border: '2px solid rgba(255,255,255,0.85)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 150ms, background-color 150ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.14)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                {dir === 'prev'
                  ? <ArrowLeft size={isMobile ? 20 : 26} strokeWidth={2.25} />
                  : <ArrowRight size={isMobile ? 20 : 26} strokeWidth={2.25} />
                }
              </button>
            ))}
          </div>
        </div>

        {/* Bottom-right CTA */}
        <a
          href="#register"
          onClick={e => { e.preventDefault(); nav('/register'); }}
          style={{
            position: 'absolute',
            bottom: isMobile ? 20 : 64,
            right: isMobile ? 16 : 40,
            zIndex: 60,
            display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
            fontFamily: "'Anton', sans-serif",
            fontSize: `clamp(18px, 3.5vw, 50px)`,
            fontWeight: 400,
            color: 'white', opacity: 0.95,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'opacity 200ms',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.95'}
        >
          GẶP NHÂN VẬT
          <ArrowRight style={{ width: isMobile ? 18 : 28, height: isMobile ? 18 : 28 }} strokeWidth={2.25} />
        </a>

      </div>
    </div>
  );
}

// S8: About + Mascot Grid + Vision/Mission
function AboutAndMascots() {
  return (
    <section id="team" className="bg-[#fdf8ef] dark:bg-[#121212] relative z-10 scroll-mt-20">
      {/* Content inside max-w container */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-6" style={{ fontFamily: '"Nunito", sans-serif' }}>
            Câu chuyện của chúng tôi
          </h2>
          <p className="text-[#92400e] dark:text-[#d1d5db] text-lg leading-relaxed" style={{ fontFamily: '"Nunito", sans-serif' }}>
            Chúng tôi tin rằng lịch sử không chỉ là những trang sách tĩnh lặng. Đó là những con người thật, cảm xúc thật và những quyết định định hình quốc gia. History Alive ra đời để đưa bạn sống lại những khoảnh khắc đó.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="rounded-[2rem] bg-white dark:bg-[#1a1208] p-10 border border-[#e8d9b8] dark:border-white/10 shadow-[0_8px_30px_rgba(180,120,30,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0392b]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-2xl md:text-3xl font-black text-[#c0392b] tracking-wider uppercase mb-4">Tầm nhìn</h3>
            <p className="text-2xl font-bold text-[#2d1400] dark:text-[#fdf8ef] leading-snug" style={{ fontFamily: '"Nunito", sans-serif' }}>
              "Đưa lịch sử Việt Nam đến với thế hệ trẻ toàn cầu thông qua trải nghiệm tương tác đột phá."
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="rounded-[2rem] bg-white dark:bg-[#1a1208] p-10 border border-[#e8d9b8] dark:border-white/10 shadow-[0_8px_30px_rgba(180,120,30,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97706]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-2xl md:text-3xl font-black text-[#d97706] tracking-wider uppercase mb-4">Sứ mệnh</h3>
            <p className="text-2xl font-bold text-[#2d1400] dark:text-[#fdf8ef] leading-snug" style={{ fontFamily: '"Nunito", sans-serif' }}>
              "Biến mỗi bài học thành một cuộc phiêu lưu có thưởng, nơi người học là nhân vật chính."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MagneticButton({ children, className, onClick, style }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: any) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.button>
  );
}

// S8.5: Testimonials & Mini Leaderboard
function TestimonialsAndLeaderboard() {
  const testimonials = [
    { name: "Minh Khang", initials: "M", color: "bg-[#4285F4]", time: "1 tháng trước", text: "Trò chơi giúp em nhớ bài lâu hơn hẳn so với học sách. Nội dung các chiến dịch rất bám sát SGK." },
    { name: "Hải Yến", initials: "H", color: "bg-[#E91E63]", time: "2 tuần trước", text: "Thiết kế đồ hoạ quá đỉnh, cảm giác như đang chơi game thật! Cày nhiệm vụ cuốn quá quên cả thời gian." },
    { name: "Tuấn Tú", initials: "T", color: "bg-[#0F9D58]", time: "4 ngày trước", text: "Ôn thi tốt nghiệp cực kỳ hiệu quả với hệ thống quiz. Kiến thức vào đầu rất tự nhiên." },
    { name: "Lan Anh", initials: "L", color: "bg-[#F4B400]", time: "1 tháng trước", text: "Giao diện thân thiện, bé nhà tôi tự giác học lịch sử mỗi tối mà không cần giục. Một ứng dụng tuyệt vời." },
    { name: "Đức Trung", initials: "Đ", color: "bg-[#8E24AA]", time: "3 tuần trước", text: "Từ ngày có bảng xếp hạng, lớp tôi thi nhau cày nhiệm vụ trên History Alive để đua top." },
    { name: "Quang Huy", initials: "Q", color: "bg-[#FF5722]", time: "5 ngày trước", text: "Giao diện siêu mượt, cốt truyện hay như phim điện ảnh. Quá xứng đáng 5 sao!" },
    { name: "Bảo Ngọc", initials: "B", color: "bg-[#00BCD4]", time: "2 ngày trước", text: "Chưa bao giờ học môn Lịch sử lại thấy hào hứng và dễ thuộc bài như bây giờ." }
  ];

  const visibleTestimonials = ENABLE_HEAVY_MOTION ? [...testimonials, ...testimonials] : testimonials;

  const leaders = [
    { rank: 1, name: "Thần Đồng", xp: 15400, avatar: "https://i.pravatar.cc/150?img=11" },
    { rank: 2, name: "Trạng Nguyên", xp: 12350, avatar: "https://i.pravatar.cc/150?img=33" },
    { rank: 3, name: "Chiến Binh", xp: 9800, avatar: "https://i.pravatar.cc/150?img=12" },
    { rank: 4, name: "Nhà Khám Phá", xp: 8500, avatar: "https://i.pravatar.cc/150?img=47" },
    { rank: 5, name: "Sử Gia Nhí", xp: 7200, avatar: "https://i.pravatar.cc/150?img=5" },
    { rank: 6, name: "Học Giả", xp: 6800, avatar: "https://i.pravatar.cc/150?img=60" },
    { rank: 7, name: "Tiên Phong", xp: 5400, avatar: "https://i.pravatar.cc/150?img=3" },
    { rank: 8, name: "Dũng Sĩ", xp: 4900, avatar: "https://i.pravatar.cc/150?img=8" },
    { rank: 9, name: "Tinh Anh", xp: 4200, avatar: "https://i.pravatar.cc/150?img=32" },
    { rank: 10, name: "Tân Binh", xp: 3100, avatar: "https://i.pravatar.cc/150?img=51" },
  ];

  return (
    <section id="rewards" className="py-24 bg-[#f7f0e2] dark:bg-[#1a1a1a] relative z-10 border-y border-[#e8d9b8] dark:border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Testimonials */}
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#2d1400] dark:text-[#fdf8ef] mb-12" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Cộng đồng <br/><span className="text-[#d97706]">Nhà thám hiểm</span>
            </h2>
              <div className={`relative h-auto lg:h-[480px] ${ENABLE_HEAVY_MOTION ? 'overflow-hidden' : 'overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'}`} style={{ WebkitMaskImage: ENABLE_HEAVY_MOTION ? 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' : undefined, maskImage: ENABLE_HEAVY_MOTION ? 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' : undefined }}>
              <div className={`flex flex-col gap-5 ${ENABLE_HEAVY_MOTION ? 'animate-[marquee-vertical_42s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none pt-4' : ''}`}>
                {visibleTestimonials.map((t, i) => (
                  <div 
                    key={i}
                    className="bg-white dark:bg-[#1f1f1f] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-[#333] flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex gap-3 mb-2 items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${t.color}`}>
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#202124] dark:text-[#e8eaed] text-sm" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>{t.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5 text-[#70757a] dark:text-[#9aa0a6] text-xs" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
                          <span className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-[14px] h-[14px] text-[#fbbc04]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            ))}
                          </span>
                          <span className="ml-1">{t.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#3c4043] dark:text-[#e8eaed] text-sm mt-1 leading-relaxed" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Leaderboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#c0392b] to-[#991b1b] p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(192,57,43,0.3)] text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full mix-blend-screen" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-black" style={{ fontFamily: '"Nunito", sans-serif' }}>Bảng Vàng</h3>
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Mùa 1</div>
            </div>
            
            <div className="space-y-3 relative z-10 max-h-[320px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {leaders.map((l, i) => (
                <div key={i} className="flex items-center justify-between bg-black/24 p-3 rounded-2xl group hover:bg-black/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center font-black text-white/80 group-hover:text-[#fde68a] transition-colors">
                      #{l.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-black/40 overflow-hidden shrink-0 border border-white/20 shadow-inner">
                      <img src={l.avatar} alt={l.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="font-bold text-white/90 group-hover:text-white transition-colors">{l.name}</span>
                  </div>
                  <div className="font-black text-[#fde68a]">{l.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-3 rounded-xl bg-white text-[#c0392b] font-black hover:bg-[#fdf8ef] transition-colors relative z-10">
              Xem toàn bộ
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// S9: CTA & Footer
function CTAAndFooter() {
  const nav = useNavigate();
  return (
    <>
      <section className="relative py-40 overflow-hidden bg-[#0c0804] text-[#fdf8ef]">
        {/* Glow ambient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72vw] h-[72vw] max-w-[720px] max-h-[720px] bg-[#c0392b]/24 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52vw] h-[52vw] max-w-[520px] max-h-[520px] bg-[#d97706]/28 blur-[96px] rounded-full mix-blend-screen" />
        </div>
        
        {/* Floating particles */}
        {ENABLE_HEAVY_MOTION && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {CTA_PARTICLES.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#fde68a] mix-blend-screen"
                style={{
                  width: particle.width,
                  height: particle.height,
                  left: particle.left,
                  top: particle.top,
                }}
                animate={{
                  y: [0, -96, 0],
                  opacity: [0, 0.75, 0],
                  scale: [0, 1.25, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/14 text-white font-bold text-sm mb-8 border border-white/20 shadow-xl"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Hơn 500+ học viên đã tham gia hôm nay
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight" style={{ fontFamily: '"Nunito", sans-serif', textShadow: "0 10px 40px rgba(217,119,6,0.5)" }}>
            Bắt Đầu Hành Trình <br/> Lịch Sử Của Bạn
          </h2>
          <p className="text-xl md:text-3xl text-[#fde68a] mb-12 font-medium max-w-2xl mx-auto drop-shadow-md" style={{ fontFamily: '"Nunito", sans-serif' }}>
            Hàng nghìn sự kiện. Vô số nhân vật. Một ứng dụng.
          </p>
          <MagneticButton
            onClick={() => nav("/register")}
            className="px-6 sm:px-12 py-4 sm:py-6 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-black text-lg sm:text-2xl shadow-[0_10px_40px_rgba(217,119,6,0.5)] border border-[#fde68a]/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fde68a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0804]"
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            Tạo Tài Khoản Miễn Phí
          </MagneticButton>
        </div>
      </section>

      <footer id="contact" className="bg-[#1a1208] text-[#c8a878] py-16 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/assets/logo.png" 
                  alt="History Alive Logo" 
                  loading="lazy"
                  className="h-10 w-10 object-contain drop-shadow-md"
                />
                <span className="text-2xl font-black text-[#fdf8ef]" style={{ fontFamily: '"Cinzel", serif' }}>History Alive</span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed mb-6 font-medium">
                Ứng dụng học lịch sử Việt Nam thế hệ mới. Trải nghiệm gamification, AI chatbot và cốt truyện tương tác.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61559703584311" target="_blank" rel="noopener noreferrer" aria-label="Theo dõi History Alive trên Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706]"><Facebook className="w-5 h-5"/></a>
                <a href="#" aria-label="Theo dõi History Alive trên Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706]"><Instagram className="w-5 h-5"/></a>
                <a href="#" aria-label="Theo dõi History Alive trên Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706]"><Twitter className="w-5 h-5"/></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-[#fdf8ef] font-bold mb-6">Sản Phẩm</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Lộ trình học</a></li>
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Bảng giá</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#fdf8ef] font-bold mb-6">Pháp Lý</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-[#d97706] transition-colors">Liên hệ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 History Alive. All rights reserved.</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30 font-bold">EdTech AI Việt Nam</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// S10: Floating Chat Widget
function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>(() => {
    try {
      const saved = localStorage.getItem("ha_landing_chat");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [{ role: 'bot', text: 'Chào bạn, ta là Hùng — Nhà Nho thông thái. Ngươi muốn hỏi gì về lịch sử Việt Nam?' }];
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("ha_landing_chat", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Fake bot reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Thật thú vị! Trong ứng dụng History Alive, ta sẽ kể cho ngươi chi tiết hơn về vấn đề này. Hãy đăng ký ngay để chúng ta cùng đàm đạo nhé!'
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-[#fdf8ef] dark:bg-[#121212] border-2 border-[#e8d9b8] dark:border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(45,20,0,0.15)] overflow-hidden flex flex-col"
            style={{ height: '480px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#d97706] to-[#c0392b] p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdf8ef] dark:bg-[#121212] p-1 border-2 border-white shadow-inner overflow-hidden">
                  <img src={MASCOTS.find(m => m.id === 'hung')?.img} alt="Nhân vật Hùng Vương đồng hành cùng học sinh" loading="lazy" className="w-full h-full object-cover scale-125 pt-1" />
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>Sử Thần Hùng</h4>
                  <p className="text-white/80 text-xs font-semibold">Trợ lý Lịch sử AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Đóng khung chat" className="text-white hover:bg-white/20 p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f0e2] dark:bg-[#1a1a1a] relative">
              <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" aria-hidden="true" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
              
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative z-10 ${
                    m.role === 'user' 
                      ? 'bg-[#d97706] text-white rounded-br-none' 
                      : 'bg-white border border-[#e8d9b8] dark:border-white/10 text-[#2d1400] dark:text-[#fdf8ef] rounded-bl-none'
                  }`} style={{ fontFamily: '"Nunito", sans-serif' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-[#e8d9b8] dark:border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi bất kỳ điều gì..."
                className="flex-1 bg-[#f7f0e2] dark:bg-[#1a1a1a] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] text-[#2d1400] dark:text-[#fdf8ef] placeholder:text-[#92400e] dark:text-[#d1d5db]/50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 bg-[#d97706] text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#c0392b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706]"
                aria-label="Gửi tin nhắn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d97706] to-[#c0392b] border-4 border-[#fdf8ef] shadow-[0_10px_25px_rgba(217,119,6,0.4)] flex items-center justify-center relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2"
        aria-label={isOpen ? "Đóng chat Sử Thần" : "Mở chat Sử Thần"}
        aria-expanded={isOpen}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-end justify-center pt-2">
          <img src={MASCOTS.find(m => m.id === 'hung')?.img} alt="Chat cùng Sử Thần Hùng" loading="lazy" className="w-[120%] object-cover scale-125" />
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#c0392b] border-2 border-white"></span>
          </span>
        )}
        
        {/* Floating tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-[#c0392b] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Hỏi Sử Thần
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
        </div>
      </motion.button>
    </div>
  );
}

export default function LandingPage() {
  useSmoothLandingScroll();

  return (
    <main className={`min-h-screen bg-[#fdf8ef] dark:bg-[#121212] font-sans selection:bg-[#f59e0b]/30 ${ENABLE_HEAVY_MOTION ? 'ha-cinematic-motion' : 'ha-performance-motion'}`}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        html { scroll-behavior: smooth; scroll-padding-top: 96px; }
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      <StickyJourneyCTA />
      <Navbar />
      <Hero />
      <SocialProofBar />

      <LandingChapterHeader
        eyebrow="Bạn đồng hành"
        title="Không học một mình trong lịch sử"
        desc="Các mascot xuất hiện sớm như người dẫn chuyện: giải thích sự kiện, đặt câu hỏi và giữ nhịp cảm xúc trước khi bạn bước vào từng thời kỳ."
      />
      <MascotCarouselShowcase />

      <LandingChapterHeader
        eyebrow="Vấn đề cốt lõi"
        title="Lịch sử không khô khan. Cách học mới là vấn đề."
        desc="Trước khi nói về game hay điểm thưởng, History Alive bắt đầu từ một sự thật: học sinh rời bỏ môn sử vì kiến thức bị tách khỏi con người, cảm xúc và bối cảnh."
      />
      <ProblemSection />

      <LandingChapterHeader
        eyebrow="Giải pháp"
        title="Biến bài học thành nhiệm vụ có cảm xúc"
        desc="Người học chọn thời kỳ, gặp nhân vật, hoàn thành thử thách và mở khóa tri thức. Mỗi cơ chế trong app đều phục vụ một mục tiêu: hiểu sâu thay vì học vẹt."
      />
      <HowItWorks />
      <FeatureShowcase />

      <LandingChapterHeader
        eyebrow="Lộ trình học"
        title="Bám chương trình thật, trình bày như một chiến dịch"
        desc="Mỗi lớp là một hành trình có cột mốc rõ ràng. Người học biết mình đang ở đâu, sẽ đi đâu tiếp theo và vì sao mỗi nhiệm vụ quan trọng."
      />
      <CurriculumJourney />
      <AboutAndMascots />

      <LandingChapterHeader
        eyebrow="Niềm tin"
        title="Người học cảm thấy dễ nhớ hơn khi lịch sử có trải nghiệm"
        desc="Review, bảng vàng và phản hồi cộng đồng được đặt ở cuối hành trình để chứng minh: đây không chỉ là giao diện đẹp, mà là một cách học có thể giữ chân người dùng."
      />
      <TestimonialsAndLeaderboard />
      <CTAAndFooter />
      <FloatingChatWidget />
    </main>
  );
}
