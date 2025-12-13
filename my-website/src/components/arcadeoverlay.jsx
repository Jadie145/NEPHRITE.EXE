import { useEffect, useState } from "react";

export default function ArcadeOverlay({ src, mode = "arcade", onClose }) {
  const [booting, setBooting] = useState(true);

  // Detect touch devices
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  // Resolve mode
  const resolvedMode =
    mode === "adaptive"
      ? isMobile
        ? "interactive"
        : "arcade"
      : mode;

  // Boot delay
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ESC to exit
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 pixel-border bg-neutral-900 text-white">
        <span>
          {resolvedMode === "arcade"
            ? "ARCADE MODE"
            : resolvedMode === "interactive"
            ? "INTERACTIVE MODE"
            : "ADAPTIVE MODE"}
        </span>

        <button
          onClick={onClose}
          className="pixel-border px-3 py-1 bg-red-600 text-white"
        >
          ✕ EXIT
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {booting ? (
          /* BOOT SCREEN */
          <div className="pixel-border p-6 text-center bg-black text-white">
            <p className="mb-2">BOOTING SYSTEM...</p>
            <p className="opacity-60 text-xs">LOADING MODULES</p>
            <div className="mt-4 h-2 w-40 bg-neutral-800">
              <div className="h-full w-full animate-pulse bg-white" />
            </div>
          </div>
        ) : resolvedMode === "arcade" ? (
          /* ARCADE MODE */
          <div className="arcade-shell crt">
            <iframe
              src={src}
              className="arcade-iframe"
              title="Arcade"
            />
          </div>
        ) : (
          /* INTERACTIVE MODE */
          <iframe
            src={src}
            className="w-full h-full border-none"
            title="Interactive"
          />
        )}
      </div>
    </div>
  );
}
