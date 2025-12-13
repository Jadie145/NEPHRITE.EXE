import { useState } from "react";
import ArcadeOverlay from "./ArcadeOverlay";

export default function ProjectCard({ title, image, link, mode = "arcade" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative pixel-border pixel-hover p-4 cursor-pointer
  bg-neutral-200 text-black
  dark:bg-neutral-800 dark:text-white"
      >
        {/* Mode Badge */}
        <div className="absolute top-3 right-3
    pixel-border px-2 py-1 text-xs
    bg-neutral-200 text-black
    dark:bg-neutral-900 dark:text-white">
          {mode === "arcade" && "🕹 ARCADE"}
          {mode === "interactive" && "📱 TOUCH"}
          {mode === "adaptive" && "🖥📱 ADAPTIVE"}
        </div>

        <img
          src={image}
          alt={title}
          className="mb-3 w-full h-40 object-cover pixel-border"
        />

        <h2 className="text-lg font-bold">{title}</h2>

        <p className="text-xs mt-1 opacity-70 dark:opacity-60">
          ▶ CLICK TO PLAY
        </p>

        {/* Subtle mode hint */}
        <p className="text-[10px] opacity-50 mt-1">
          {mode === "arcade" && "Keyboard / Desktop"}
          {mode === "interactive" && "Touch / Mobile Friendly"}
          {mode === "adaptive" && "Auto adapts to device"}
        </p>
      </div>

      {open && (
        <ArcadeOverlay
          src={link}
          mode={mode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
