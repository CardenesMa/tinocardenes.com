
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
  <div className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg dark:shadow-md dark:hover:shadow-xl p-0 pb-16 m-0.5 transition-shadow duration-200 relative min-h-[200px] md:min-h-[150px]">
    <Image
      onClick={() => window.open(link, "_blank")}
      src={imagePath}
      alt={title}
      width={IMAGE_DEFAULT_SIZE}
      height={IMAGE_DEFAULT_SIZE}
      className="rounded-lg p-2 w-full aspect-square object-cover mb-4 cursor-pointer"
    />
    <div className="px-8 py-0 flex flex-col gap-4">
      <h2 className="text-xl md:text-2xl font-bold"><b>{title}</b></h2>
      <p className="text-base md:text-lg font-normal leading-relaxed">{description}</p>
      <Button text="Learn More" link={link} download={false} className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-200" />
    </div>
  </div>
);

export default ProjectBox;
