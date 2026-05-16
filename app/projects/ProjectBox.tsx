
"use client";
import Image from "next/image";
import Button from "../ui/Button";

const IMAGE_DEFAULT_SIZE = 200;
export interface Project {
  imagePath: string;
  link: string;
  title: string;
  description: string;
}

export class ProjectData implements Project {
  imagePath: string;
  link: string;
  title: string;
  description: string;

  constructor(
    imagePath: string = "/studio.jpg",
    link: string = "https://tinocardenes.com",
    title: string = "Project",
    description: string = ""
  ) {
    if (imagePath == "") {
      imagePath = "/studio.jpg";
    }
    this.imagePath = imagePath;
    this.link = link;
    this.title = title;
    this.description = description;
  }
}

const ProjectBox = ({ imagePath, link, title, description }: Project) => (
  <div className="relative m-0.5 flex min-h-[200px] flex-col items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0 pb-16 shadow-md transition-shadow duration-200 hover:shadow-lg md:min-h-[150px]">
    <Image
      onClick={() => window.open(link, "_blank")}
      src={imagePath}
      alt={title}
      width={IMAGE_DEFAULT_SIZE}
      height={IMAGE_DEFAULT_SIZE}
      className="rounded-lg p-2 w-full aspect-square object-cover mb-4 cursor-pointer"
    />
    <div className="flex flex-col gap-4 px-8 py-0">
      <h2 className="text-xl font-bold md:text-2xl"><b>{title}</b></h2>
      <p className="text-base font-normal leading-relaxed md:text-lg">{description}</p>
      <Button text="Learn More" link={link} download={false} className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-200" />
    </div>
  </div>
);

export default ProjectBox;
