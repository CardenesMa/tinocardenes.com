import Image from "next/image"
import styles from "./projectHeader.module.css"
import { serif } from "../ui/fonts"
const HEADER_IMAGE_SIZE = 200;
const  ProjectHeader = () => (
    <div className={styles.container}>
        <Image className={styles.headerImage} src="/headshot.avif" alt="Project Header Image" width={HEADER_IMAGE_SIZE} height={HEADER_IMAGE_SIZE} />
        <div className={styles.introTextContainer}>
            <h1 className={styles.headline}>Projects</h1>
            <h2 className={styles.subheadline}>A collection of my work in music technology, programming, and more.</h2>
        </div>
    </div>
)

export default ProjectHeader;
