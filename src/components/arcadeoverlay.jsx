import { useEffect, useState } from "react";

export default function ArcadeOverlay({ src, mode = "arcade", onClose }) {
  const [isIframeLoaded, setIframeLoaded] = useState(false);
  const [minLoadTimePassed, setMinLoadTimePassed] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Cartridge loading text state
  const [bootText, setBootText] = useState("READING CARTRIDGE...");

  // Detect touch (safe for SSR/Hydration)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    
    // Minimum 1.5s load time for the aesthetic (even if internet is fast)
    const timer = setTimeout(() => setMinLoadTimePassed(true), 1500);
    
    // Boot text animation sequence
    const txtTimer1 = setTimeout(() => setBootText("VERIFYING CHECKSUM..."), 600);
    const txtTimer2 = setTimeout(() => setBootText("ALLOCATING MEMORY..."), 1100);

    return () => {
      clearTimeout(timer);
      clearTimeout(txtTimer1);
      clearTimeout(txtTimer2);
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // === KEY FIX ===
  // If on Mobile, force "interactive" mode. 
  // This ignores the 16:9 arcade ratio and fills the phone screen.
  const activeMode = isMobile ? "interactive" : mode;
  
  const isLoading = !isIframeLoaded || !minLoadTimePassed;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-mono animate-in fade-in duration-300">
      
      {/* --- HUD HEADER --- */}
      <div className="flex justify-between items-center p-2 border-b-2 border-neutral-800 bg-neutral-900 text-xs sm:text-sm select-none z-50 relative">
        
        {/* Left: System Status */}
        <div className="flex items-center gap-4 text-green-500">
          <span className="font-bold tracking-widest hidden sm:inline">
              SYS::OVERLAY
          </span>
          <span className="flex items-center gap-2 px-2 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-gray-300">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            {activeMode === "arcade" ? "ARCADE CORE" : "MOBILE CORE"}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          
          {/* CRT Toggle (Show in Arcade OR if user wants retro feel on mobile) */}
          {activeMode === "arcade" && (
            <button 
              onClick={() => setCrtEnabled(!crtEnabled)}
              className={`hidden sm:block px-2 py-1 border ${crtEnabled ? 'border-green-600 text-green-400 bg-green-900/20' : 'border-neutral-600 text-neutral-500'} hover:bg-neutral-800 transition-colors`}
              title="Toggle CRT Effect"
            >
              CRT:{crtEnabled ? "ON" : "OFF"}
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="hidden sm:block px-2 py-1 border border-neutral-600 text-neutral-400 hover:text-white hover:border-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? "MINIMIZE" : "[ ] EXPAND"}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-2 px-3 py-1 bg-red-700 text-white font-bold border border-red-500 hover:bg-red-600 active:translate-y-0.5 transition-all"
          >
            ✕ CLOSE
          </button>
        </div>
      </div>

      {/* --- MAIN VIEWPORT --- */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-[#050505] bg-[size:20px_20px] bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)]">
        
        {/* LOADING STATE OVERLAY */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-green-500">
             <div className="w-48 sm:w-64 border border-green-800 p-1 bg-neutral-900 overflow-hidden relative">
                <div className="h-4 bg-green-600 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
             </div>
             <p className="mt-4 text-sm animate-pulse">{bootText}</p>
          </div>
        )}

        {/* CONTENT CONTAINER */}
        <div className={`relative transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} w-full h-full flex items-center justify-center`}>
            
            {activeMode === "arcade" ? (
              /* DESKTOP ARCADE CONTAINER (16:9 FIXED) */
              <div className={`relative transition-all duration-500 ${crtEnabled ? 'arcade-shell crt' : 'arcade-shell-clean'}`}>
                 <iframe
                   src={src}
                   onLoad={() => setIframeLoaded(true)}
                   className="arcade-iframe block w-full h-full bg-black"
                   title="Arcade Project"
                 />
                 {crtEnabled && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10 rounded-lg"></div>}
              </div>
            ) : (
              /* MOBILE / INTERACTIVE CONTAINER (FULL SCREEN) */
              /* z-10 ensures it sits above the grid background */
              <div className="w-full h-full relative z-10">
                  <iframe
                    src={src}
                    onLoad={() => setIframeLoaded(true)}
                    className="w-full h-full border-none bg-white"
                    title="Interactive Project"
                  />
              </div>
            )}
        </div>
      </div>
      
      {/* --- FOOTER INSTRUCTIONS (Only Desktop) --- */}
      {!isMobile && (
        <div className="py-1 bg-neutral-900 text-center text-[10px] text-neutral-500 uppercase tracking-widest border-t border-neutral-800 z-50 relative">
           Controls: Mouse / Arrow Keys • Press ESC to Exit
        </div>
      )}
    </div>
  );
}