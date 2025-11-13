import ProjectBox from "./ProjectBox";
import ProjectHeader from "./ProjectHeader";
export default function Projects() {
  return (
    <main>
    <ProjectHeader />
      <ProjectBox
        imagePath="/headshot.avif"
        link="https://tinocardenes.com"
        title="Project Title"
        description="Project description goes here."
      />
      
    </main>
  );
}