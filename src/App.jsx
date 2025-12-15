import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // <--- REMOVED "BrowserRouter as Router"

import Navbar from "./components/navbar";
import Footer from "./components/footer"; 
import BootScreen from "./components/bootscreen";
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

  useEffect(() => {
    const strength = typeof settings.scanlines === "number" ? settings.scanlines : 0.15;
    document.documentElement.style.setProperty("--scanline-strength", strength);
  }, [settings.scanlines]);

  useEffect(() => {
    document.documentElement.dataset.sound = settings.sound ? "on" : "off";
  }, [settings.sound]);

  useEffect(() => {
    if (settings.crt) {
        document.body.classList.add('crt-global');
    } else {
        document.body.classList.remove('crt-global');
    }
  }, [settings.crt]);

  const finishBoot = () => {
    sessionStorage.setItem("booted", "true");
    setBooted(true);
  };

  if (!booted) return <BootScreen onFinish={finishBoot} />;

  return (
    // <--- REMOVED <Router> wrapper here
    <div className="min-h-screen w-full text-foreground selection:bg-green-500/30 selection:text-green-200">
      
      {/* === LAYER 1: FIXED BACKGROUND WALLPAPER === */}
      <div 
          className={`fixed inset-0 z-0 pointer-events-none ${
              settings.background ? "retro-bg" : "bg-neutral-900"
          }`}
      ></div>

      {/* === LAYER 2: APP CONTENT === */}
      <div className="relative z-10">
          
          <Navbar />

          <main className="pt-24 pb-24 px-4 max-w-7xl mx-auto min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/about" element={<About />} />
              <Route path="/sys" element={<System />} />
            </Routes>
          </main>

          <Footer />
      </div>

      {/* === LAYER 3: GLOBAL OVERLAYS === */}
      {settings.debug && <div className="debug-overlay fixed inset-0 z-[100] pointer-events-none"></div>}
      
      {settings.crt && (
          <div className="pointer-events-none fixed inset-0 z-[60] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
      )}
      
    </div>
    // <--- REMOVED </Router> wrapper here
  );
}