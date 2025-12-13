import { useSystemSettings } from "../hooks/usesystemsettings";

export default function DebugOverlay() {
  const { settings } = useSystemSettings();
  if (!settings.debug) return null;

  return (
    <div className="fixed bottom-2 right-2 pixel-border bg-black text-white text-xs p-2 z-50">
      <p>DEBUG MODE</p>
      <p>CRT: {String(settings.crt)}</p>
      <p>BG: {String(settings.background)}</p>
      <p>SOUND: {String(settings.sound)}</p>
    </div>
  );
}
