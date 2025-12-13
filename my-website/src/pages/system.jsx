import { useSystemSettings } from "../hooks/useSystemSettings";

export default function System() {
  const { reset } = useSystemSettings();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 space-y-6">
      <h1 className="text-xl text-center sm:text-left">
        SYSTEM INFORMATION
      </h1>

      {/* Build Info */}
      <div className="pixel-border p-4 space-y-2">
        <p>SOFTWARE:</p>
        <ul className="text-sm opacity-80 space-y-1">
          <li>• React 18</li>
          <li>• Vite</li>
          <li>• React Router</li>
          <li>• Tailwind CSS</li>
        </ul>
      </div>

      {/* Build Metadata */}
      <div className="pixel-border p-4 space-y-1 text-sm opacity-80">
        <p>BUILD NAME: JAYDE.EXE</p>
        <p>INTERFACE: Retro Pixel UI</p>
        <p>MODE: Client-side SPA</p>
        <p>BOOT STATE: Persistent (session)</p>
      </div>

      <hr className="opacity-30" />

      {/* Reset */}
      <button
        onClick={reset}
        className="pixel-border bg-red-600 text-white px-4 py-2 w-full sm:w-auto"
      >
        FACTORY RESET
      </button>
    </section>
  );
}
