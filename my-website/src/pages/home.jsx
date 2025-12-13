import { useEffect, useState } from "react";
import projects from "../data/projects.json";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const key = "jayde_exe_visits";
    const current = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, current);
    setVisits(current);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* HERO */}
      <section className="text-center space-y-3">
        <h1 className="text-2xl">▶ JAYDE.EXE</h1>

        <p className="opacity-70">
          Retro tools, experiments & playable projects
        </p>

        <p className="opacity-50 text-xs">
          PRESS ▶ PROJECTS TO START
        </p>

        {/* VISIT COUNTER */}
        {/*<div className="inline-block mt-4 pixel-border px-4 py-2 text-xs opacity-80">
          VISITS: {visits.toLocaleString()}
        </div>*/}
      </section>

      {/* FEATURED PROJECTS */}
      <section className="space-y-4">
        <h2 className="text-lg">FEATURED PROJECTS</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 2).map((p) => (
            <ProjectCard key={p.title} {...p} />
          ))}
        </div>
      </section>
    </div>
  );
}
