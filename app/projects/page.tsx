"use client";
import ProjectBox from "./ProjectBox";
import ProjectHeader from "./ProjectHeader";
import { Project } from "./ProjectBox";
import { projectData } from "./projectData"

// Note: metadata export not available in client components
// SEO is handled through root layout and sitemap

export default function Projects() {
  return (
    <main >
      <ProjectHeader />

      <div className="grid grid-cols-1 gap-4 bg-[var(--surface-soft)] px-4 py-10 md:grid-cols-2 md:px-10 lg:grid-cols-3">
        {projectData.map((project: Project, index: number) => (
          <div className="flex col-span-1" key={index}>
            <ProjectBox
              imagePath={project.imagePath}
              link={project.link}
              title={project.title}
              description={project.description}
            />
          </div>
        ))}
      </div>
    </main>
  );
}