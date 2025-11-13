import Image from "next/image";
import Link from "next/link";
import styles from "./project.module.css";

const IMAGE_DEFAULT_SIZE = 200;
interface ProjectBoxProps {
  imagePath: string;
  link: string;
  title: string;
  description: string;
}

const ProjectBox = ({ imagePath, link, title, description }: ProjectBoxProps) => (
  <div className={styles.projectBox}>
    <Image src={imagePath} alt={title} width={IMAGE_DEFAULT_SIZE} height={IMAGE_DEFAULT_SIZE} className={styles.projectImage} />
    <h2 className={styles.projectTitle}>{title}</h2>
    <p className={styles.projectDescription}>{description}</p>
    <Link href={link} passHref className={styles.projectButton} target="_blank" rel="noopener noreferrer">
      Mehr erfahren
    </Link>
  </div>
);

export default ProjectBox;
