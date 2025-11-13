import styles from "./about.module.css";
import gstyles from "../globals.module.css";
import Image from "next/image";
import { serif } from "./fonts";

export default function About() {
  return (
    <main className={`${styles.container} ${serif.className}`}>
      <section className={styles.panel}>
        <h1 className={gstyles.headline}>About</h1>
        <h2 className={gstyles.subheadline}>Pianist, Programmer, Music Technology</h2>
        <p className={gstyles.description}>
          Hi, I'm Tino Cardenes. Welcome to my website! I am passionate about music and technology, and I work at the intersection of both. As a pianist and programmer, I love building tools and experiences that empower creativity and connect people through sound and code. Here you can find my projects, blog, and more about my journey in music technology.
        </p>
        <div className={styles.buttons}>
          <a href="/resume.pdf" download className={styles.button}>
            Download Resume
          </a>
          <a href="/headshot.jpg" download className={styles.button}>
            Download Headshot
          </a>
        </div>
      </section>
      <aside className={styles.photoPanel}>
        <Image
          src="/headshot.avif"
          alt="Tino Cardenes Headshot"
          width={400}
          height={420}
          className={styles.photo}
          priority
        />
      </aside>
    </main>
  );
}