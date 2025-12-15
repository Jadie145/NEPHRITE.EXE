import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import projects from "../projects/projects.json"; // <--- Updated path to match Projects.jsx
import ProjectCard from "../components/projectcard"; // <--- Updated path/case to match Projects.jsx

export default function Home() {
  const [visits, setVisits] = useState(0);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // 1. Get the Correct Base URL (Vital for GitHub Pages images)
  const baseUrl = import.meta.env.BASE_URL;

  // Handle Visits & Clock
  useEffect(() => {
    // Visit Counter
    const key = "jayde_exe_visits";
    const current = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, current);
    setVisits(current);

    // Real-time Clock
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-16 pt-10 px-4">
      
      {/* === HERO SECTION === */}
      <section className="relative text-center space-y-6">
        
        {/* Decorative 'System Ready' Badge */}
        <div className="flex justify-center mb-4">
            <span className="font-tech text-xs border border-green-600/50 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-sm bg-green-900/10">
                SYSTEM_READY :: {time}
            </span>
        </div>

        {/* Main Title with Cursor */}
        <h1 className="font-arcade text-4xl md:text-6xl tracking-tight">
          <span className="text-green-600 dark:text-green-400 mr-2">▶</span>
          NEPHRITE.EXE
          <span className="animate-pulse text-green-500">_</span>
        </h1>

        <p className="font-retro text-lg md:text-xl opacity-70 max-w-2xl mx-auto">
          Tools, experiments & playable projects initialized in a React-based shell environment.
        </p>

        {/* Visit Counter (Styled as User ID) */}
        <div className="font-tech text-xs opacity-50 tracking-widest">
            SESSION_ID: <span className="text-green-600 dark:text-green-400">#{visits.toString().padStart(6, '0')}</span>
        </div>

        {/* Primary Call to Action Button */}
        <div className="pt-6">
            <Link 
                to="/projects" 
                className="inline-block font-arcade text-sm bg-foreground text-background px-6 py-4 hover:scale-105 active:scale-95 transition-transform border-2 border-transparent hover:border-green-500"
            >
                [ INSERT COIN / START ]
            </Link>
        </div>
      </section>

      {/* === FEATURED PROJECTS === */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-4 border-b border-dashed border-gray-400/30 pb-2">
            <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
            <h2 className="font-arcade text-lg md:text-xl">FEATURED_CARTRIDGES</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.slice(0, 2).map((p) => {
            // 2. Fix the Image & Link paths using Base URL
            // This prevents broken images on the Home page
            const fixedProject = {
                ...p,
                image: `${baseUrl}${p.image.replace(/^\//, '')}`,
                link: `${baseUrl}${p.link.replace(/^\//, '')}`
            };
            
            return <ProjectCard key={p.title} {...fixedProject} />;
          })}
        </div>

        {/* View All Link */}
        <div className="text-center pt-4">
            <Link to="/projects" className="font-retro text-lg hover:text-green-500 hover:underline decoration-dashed underline-offset-4">
                View All Projects &rarr;
            </Link>
        </div>
      </section>

    </div>
  );
}