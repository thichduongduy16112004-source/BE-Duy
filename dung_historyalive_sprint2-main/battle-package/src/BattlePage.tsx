import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import ImageWithFallback from './components/ImageWithFallback';
import { SOURCE_IMAGES } from './data/images';
const N = SOURCE_IMAGES.length;

const SCENES = [
  { title: 'Sở Chỉ Huy – Bờ Bắc',       dir: 'N', angle: 0,   color: '#C0392B' },
  { title: 'Cộc Ngậm – Sườn Đông',      dir: 'E', angle: 90,  color: '#8E44AD' },
  { title: 'Hạm Đội Tiến Công – Bờ Nam',dir: 'S', angle: 180, color: '#D4AF37' },
  { title: 'Đại Phản Công – Sườn Tây',  dir: 'W', angle: 270, color: '#E67E22' },
];

async function buildPanoramaCanvas(srcs: string[], W: number, H: number, blendRatio = 0.18): Promise<HTMLCanvasElement> {
  const n = srcs.length;
  const BLEND = Math.round(W * blendRatio);
  const loopSrcs = [...srcs, srcs[0]];
  const imgs = await Promise.all(loopSrcs.map(src => new Promise<HTMLImageElement>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(img);
    img.src = src;
  })));

  const canvas = document.createElement('canvas');
  canvas.width = n * W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0A0603';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  loopSrcs.forEach((_, i) => {
    const img = imgs[i];
    if (!img.width) return;
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const tctx = tmp.getContext('2d')!;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * scale; const dh = img.naturalHeight * scale;
    tctx.filter = 'brightness(0.82) contrast(1.10) saturate(0.78) sepia(0.20)';
    tctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    tctx.filter = 'none';
    tctx.globalCompositeOperation = 'destination-in';
    const grad = tctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(BLEND / W, 'rgba(0,0,0,1)');
    grad.addColorStop(1 - BLEND / W, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    tctx.fillStyle = grad; tctx.fillRect(0, 0, W, H);
    const destX = i * W - BLEND; const destW = W + BLEND * 2;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tmp, 0, 0, W, H, destX, 0, destW, H);
  });
  return canvas;
}

export default function BattlePage() {
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [panoramaUrl, setPanoramaUrl] = useState<string>('');
  const [panoramaW, setPanoramaW] = useState(0);
  const offsetRef = useRef(0);
  const [displayOffset, setDisplayOffset] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  // panoramaAngle removed (unused locally) to avoid lint warnings
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0); const dragStartOff = useRef(0);
  const lastX = useRef(0); const lastT = useRef(0); const velRef = useRef(0);
  const inertiaRaf = useRef<number | null>(null);
  const autoPanRaf = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);
  const [, setShowHint] = useState(true);
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  const isAutoPanningRef = useRef(false);
  const AUTO_SPEED = 0.36; const RESUME_DELAY = 2000;

  useEffect(() => {
    const el = viewerRef.current; if (!el) return;
    const build = () => {
      const W = el.offsetWidth || 390; const H = el.offsetHeight || 340;
      buildPanoramaCanvas(SOURCE_IMAGES, W, H).then(canvas => {
        const url = canvas.toDataURL('image/jpeg', 0.88);
        setPanoramaUrl(url); setPanoramaW(N * W); offsetRef.current = 0;
      });
    };
    const t = setTimeout(build, 80); return () => clearTimeout(t);
  }, []);

  const applyOffset = useCallback((raw: number) => {
    if (panoramaW === 0) return; const norm = ((raw % panoramaW) + panoramaW) % panoramaW;
    offsetRef.current = norm; setDisplayOffset(norm);
  const panelW = panoramaW / N; const idx = Math.floor(norm / panelW) % N; setActiveIdx(idx);
  }, [panoramaW]);

  const stopAutoPan = useCallback(() => {
    cancelAnimationFrame(autoPanRaf.current!); clearTimeout(resumeTimer.current!);
    isAutoPanningRef.current = false; setIsAutoPanning(false);
  }, []);

  const startAutoPan = useCallback(() => {
    if (panoramaW === 0) return; cancelAnimationFrame(autoPanRaf.current!);
    isAutoPanningRef.current = true; setIsAutoPanning(true);
    const tick = () => { if (!isDragging.current && isAutoPanningRef.current) { applyOffset(offsetRef.current + AUTO_SPEED); autoPanRaf.current = requestAnimationFrame(tick); } };
    autoPanRaf.current = requestAnimationFrame(tick);
  }, [applyOffset, panoramaW]);

  const scheduleResume = useCallback(() => { clearTimeout(resumeTimer.current!); resumeTimer.current = setTimeout(startAutoPan, RESUME_DELAY); }, [startAutoPan]);

  useEffect(() => {
    if (!panoramaUrl) return; const t = setTimeout(() => { setShowHint(false); startAutoPan(); }, 3200); return () => clearTimeout(t);
  }, [panoramaUrl, startAutoPan]);

  useEffect(() => () => { cancelAnimationFrame(autoPanRaf.current!); cancelAnimationFrame(inertiaRaf.current!); clearTimeout(resumeTimer.current!); }, []);

  const snapTo = useCallback((idx: number) => {
    stopAutoPan(); if (panoramaW === 0) return; const panelW = panoramaW / N; const target = idx * panelW; const from = offsetRef.current;
    let diff = target - from; if (Math.abs(diff) > panoramaW / 2) diff = diff > 0 ? diff - panoramaW : diff + panoramaW; const dur = 440; const t0 = performance.now();
    const go = (now: number) => { const p = Math.min((now - t0) / dur, 1); const e = 1 - Math.pow(1 - p, 3); applyOffset(from + diff * e); if (p < 1) inertiaRaf.current = requestAnimationFrame(go); else scheduleResume(); };
    inertiaRaf.current = requestAnimationFrame(go);
  }, [applyOffset, stopAutoPan, scheduleResume, panoramaW]);

  const onPointerDown = (e: React.PointerEvent) => { stopAutoPan(); cancelAnimationFrame(inertiaRaf.current!); isDragging.current = true; setDragging(true); setShowHint(false); dragStartX.current = e.clientX; dragStartOff.current = offsetRef.current; lastX.current = e.clientX; lastT.current = performance.now(); velRef.current = 0; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => { if (!isDragging.current) return; const dx = dragStartX.current - e.clientX; const now = performance.now(); const dt = now - lastT.current; if (dt > 0) velRef.current = (-(e.clientX - lastX.current) / dt) * 14; lastX.current = e.clientX; lastT.current = now; applyOffset(dragStartOff.current + dx); };
  const onPointerUp = () => { if (!isDragging.current) return; isDragging.current = false; setDragging(false); let v = velRef.current; const decay = 0.91; const tick = () => { v *= decay; applyOffset(offsetRef.current + v); if (Math.abs(v) > 0.4) inertiaRaf.current = requestAnimationFrame(tick); else scheduleResume(); }; Math.abs(v) > 0.5 ? (inertiaRaf.current = requestAnimationFrame(tick)) : scheduleResume(); };

  // activeIdx and panoramaAngle are managed elsewhere and affect UI; no local use required here
  const deg = panoramaW ? Math.round(((displayOffset / panoramaW) * 360 + 360) % 360) : 0;
  const direction = SCENES[activeIdx]?.dir ?? 'N';
  const toggleAuto = () => { isAutoPanningRef.current ? stopAutoPan() : startAutoPan(); };

  return (
    <div className="flex flex-col overflow-hidden relative" style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', background: '#0A0603' }}>
      
      {/* Nút Quay lại - Đặt bên ngoài viewerRef để không bị ảnh hưởng bởi sự kiện kéo (pointer events) */}
      <button
        onClick={() => navigate('/home')}
        className="active:scale-95 transition-transform"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 9999,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(6,3,1,0.80)',
          border: '1.5px solid rgba(212,175,55,0.45)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer'
        }}
        aria-label="Quay lại"
      >
        <svg fill="none" viewBox="0 0 16 16" width="16" height="16">
          <path d="M10 3L5 8l5 5" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div ref={viewerRef} className="relative overflow-hidden" style={{ flex: '1 1 0', minHeight: 0, cursor: dragging ? 'grabbing' : 'ew-resize', touchAction: 'none', userSelect: 'none' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} onPointerCancel={onPointerUp}>
        {panoramaUrl && panoramaW > 0 && (
          <div className="absolute top-0 h-full" style={{ width: panoramaW * 3, transform: `translateX(-${displayOffset + panoramaW}px)`, willChange: 'transform', display: 'flex' }}>
            {[0,1,2].map(copy => (
              <img key={copy} src={panoramaUrl} alt="" style={{ width: panoramaW, height: '100%', objectFit: 'fill', flexShrink: 0, display: 'block', pointerEvents: 'none' }} draggable={false} />
            ))}
          </div>
        )}
        {!panoramaUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ fontSize: 32 }}>
                ⚓
              </motion.div>
              <span style={{ color: 'rgba(212,175,55,0.7)', fontSize: 12, fontWeight: 700 }}>Đang tải panorama…</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(5,2,0,0.55) 0%, transparent 18%, transparent 82%, rgba(5,2,0,0.55) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 35%)' }} />

        {/* Badge 360° đã dịch chuyển sang bên cạnh (left-16) để không bị đè lên bởi nút Quay lại */}
        <div className="absolute top-4 left-16 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl" style={{ background: 'rgba(6,3,1,0.80)', border: '1.5px solid rgba(212,175,55,0.45)', backdropFilter: 'blur(8px)' }}>
          <motion.span style={{ fontSize: 17 }} animate={{ rotate: isAutoPanning ? 360 : 0 }} transition={{ duration: 4, repeat: isAutoPanning ? Infinity : 0, ease: 'linear' }}>🔄</motion.span>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#D4AF37', letterSpacing: 0.8 }}>360°</span>
          {isAutoPanning && (<span style={{ fontSize: 9, color: 'rgba(212,175,55,0.65)', fontWeight: 700 }}>AUTO</span>)}
        </div>

        <div className="absolute top-3 right-3 z-20" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); isAutoPanning ? stopAutoPan() : startAutoPan(); }}>
          <div style={{ width: 54, height: 54 }}>
            <svg viewBox="0 0 54 54" style={{ width: '100%', height: '100%' }}>
              <circle cx="27" cy="27" r="26" fill="rgba(8,4,1,0.85)" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="mx-auto" style={{ maxWidth: 440 }}>
            <div className="pointer-events-auto rounded-t-[12px] bg-[linear-gradient(180deg,#2a1a14,rgba(31,17,11,0.9))] p-4 shadow-[0px_-10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-start gap-3">
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#F8E7D9', fontWeight: 900, fontSize: 16 }}>{`Bạch Đằng 1288 · ${SCENES[activeIdx].title}`}</div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 6 }}>Trần Hưng Đạo chỉ huy trận chiến từ bờ Bắc sông Bạch Đằng với chiến thuật thiên tài của mình.</p>
                  <div style={{ color: '#D4AF37', marginTop: 8, fontSize: 12, fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ opacity: 0.9 }}>⚓</span>
                    <span>BẢN ĐỒ CHIẾN TRẬN · TRẬN BẠCH ĐẰNG 1288</span>
                  </div>

                  <div className="mt-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="flex items-center gap-3">
                      {SOURCE_IMAGES.map((s, i) => (
                        <button key={i} onClick={() => snapTo(i)} className="shrink-0" style={{ width: 84, height: 56, padding: 0, border: 'none', background: 'transparent' }}>
                          <div style={{ width: '84px', height: '56px', borderRadius: 8, overflow: 'hidden', boxShadow: i === activeIdx ? '0 4px 12px rgba(0,0,0,0.5)' : 'none', border: i === activeIdx ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.06)' }}>
                            <ImageWithFallback src={s} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                          <div style={{ color: i === activeIdx ? '#D4AF37' : 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 6, textAlign: 'center' }}>{SCENES[i].dir}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ width: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 58, height: 58, borderRadius: 999, background: 'rgba(8,4,1,0.85)', border: '1.5px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 900 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14 }}>{direction}</div>
                      <div style={{ fontSize: 11, color: 'rgba(212,175,55,0.9)', fontWeight: 800 }}>{deg}°</div>
                    </div>
                  </div>

                  <button onClick={() => toggleAuto()} style={{ width: 58, height: 44, borderRadius: 10, background: isAutoPanning ? '#D4AF37' : 'rgba(255,255,255,0.06)', border: 'none', color: isAutoPanning ? '#000' : '#F8E7D9', fontWeight: 800 }}>
                    AUTO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
