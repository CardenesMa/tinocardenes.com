import styles from "./about.module.css";
import gstyles from "../globals.module.css";
import Image from "next/image";
import { serif } from "./fonts";
import Button from "./Button";
import { faFile, faImage } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <main className={`${styles.container} ${serif.className} grid grid-flow-col grid-cols-3`}>
      <section className={styles.panel + " col-span-2 "}>
        <h1 className={gstyles.headline}>About</h1>
        <h2 className={gstyles.subheadline}>Pianist, Music Technologist</h2>
        <p className={gstyles.description}>
          I'm a pianist and music technologist based in Pittsburgh, PA.
          On this corner of the internet you can find my music, software, and projects that combine the two.
          I'm currently pursuing a Bachelors in Computer Science and Music Techology at Carnegie Mellon University,
          and I'm always excited to collaborate with artists and developers to create engaging experiences.

        </p>
        <div className={styles.buttons+ " flex flex-row gap-4 mt-6"}>
          <Button text="Resume"
            link="/resume.pdf"
            download={true}
            icon={faFile} />
          <Button text="Photo"
            link="/headshot.jpg"
            download={true}
            icon={faImage}
          />
        </div>
      </section>
      <aside className={styles.photoPanel + " col-span-1"}>
        <Image
          src="/headshot.avif"
          alt="Tino Cardenes Headshot"
          width={300}
          height={400}
          className={styles.photo}
          priority
        />
      </aside>
    </main>
  );
}