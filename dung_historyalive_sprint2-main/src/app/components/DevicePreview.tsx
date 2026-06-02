import React from 'react';

export function DevicePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center p-4 md:p-8">
      {/* Device Frame */}
      <div className="relative w-full max-w-[393px] h-[852px] bg-black rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-neutral-800 ring-1 ring-white/10 shrink-0">
        
        {/* Hardware Status Bar (Top Notch/Dynamic Island area) */}
        <div className="absolute top-0 inset-x-0 h-12 z-50 pointer-events-none flex justify-center">
          {/* Dynamic Island */}
          <div className="w-[120px] h-7 bg-black rounded-full mt-2 relative">
            {/* Camera dot */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0f0f12] rounded-full border border-white/10 shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"></div>
          </div>
        </div>

        {/* Content clipping wrapper */}
        <div className="absolute inset-0 bg-white overflow-hidden rounded-[42px]">
           {children}
        </div>
        
        {/* Hardware Home Indicator (Bottom) */}
        <div className="absolute bottom-2 inset-x-0 h-1 z-50 pointer-events-none flex justify-center">
          <div className="w-[120px] h-1 bg-black/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
