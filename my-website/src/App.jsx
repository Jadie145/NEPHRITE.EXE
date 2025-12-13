import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import BootScreen from "./components/BootScreen";
import { useSystemSettings } from "./hooks/usesystemsettings";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import About from "./pages/About";
import System from "./pages/System";

export default function App() {
  const [booted, setBooted] = useState(
    sessionStorage.getItem("booted") === "true"
  );

  const { settings } = useSystemSettings();

  // Scanline intensity (CSS variable)
  useEffect(() => {
    const strength =
      typeof settings.scanlines === "number"
        ? settings.scanlines
        : 0.4;

    document.documentElement.style.setProperty(
      "--scanline-strength",
      strength
    );
  }, [settings.scanlines]);

  // Sound toggle (global)
  useEffect(() => {
    document.documentElement.dataset.sound =
      settings.sound ? "on" : "off";
  }, [settings.sound]);

  const finishBoot = () => {
    sessionStorage.setItem("booted", "true");
    setBooted(true);
  };

  if (!booted) return <BootScreen onFinish={finishBoot} />;

  return (
    <Router>
      <div
        className={[
          "min-h-screen",
          settings.background ? "retro-bg" : "",
          settings.crt ? "crt" : "",
          settings.debug ? "debug-overlay" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          "--scanline-strength": settings.scanlines,
        }}
      >
        <Navbar />

        <main className="relative z-10 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/sys" element={<System />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
