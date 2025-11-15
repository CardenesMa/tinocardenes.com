"use client";
import ProjectBox from "./ProjectBox";
import ProjectHeader from "./ProjectHeader";
import { Project } from "./ProjectBox";
import { projectData } from "./projectData"
import gstyles from "../globals.module.css";

export default function Projects() {
  return (
    <main >
      <ProjectHeader />

      <div className={`${gstyles.softBackground} grid grid-cols-3  gap-4 p-10`}>
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