"use client";
import Image from "next/image";
import styles from "./project.module.css";
import gstyles from "../globals.module.css";
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
  <div className={styles.projectBox}>
    <Image onClick={() => window.open(link, "_blank")} src={imagePath} alt={title} width={IMAGE_DEFAULT_SIZE} height={IMAGE_DEFAULT_SIZE} className={styles.projectImage} />
    <div className={styles.projectText}>
      <h2 className={gstyles.medheadline}><b>{title}</b></h2>
      <p className={gstyles.description}>{description}</p>
      <Button text="Learn More" link={link} download={false} className={styles.projectButton} />
    </div>
  </div>
);

export default ProjectBox;
