import projects from "../projects/projects.json";
import ProjectCard from "../components/projectcard";

export default function Projects() {
  // 1. Get the Base URL from Vite (it will be "/NEPHRITE-EXE/" on GitHub)
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SELECT A PROJECT</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          
          // 2. Create a "fixed" version of the project object with correct paths
          // We remove the leading slash from the JSON path (slice(1)) to join it cleanly
          const fixedProject = {
            ...project,
            image: `${baseUrl}${project.image.startsWith('/') ? project.image.slice(1) : project.image}`,
            link: `${baseUrl}${project.link.startsWith('/') ? project.link.slice(1) : project.link}`
          };

          // 3. Pass the fixed object to the card
          return <ProjectCard key={index} {...fixedProject} />;
        })}
      </div>
    </div>
  );
}