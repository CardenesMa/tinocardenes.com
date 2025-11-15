import styles from "./about.module.css";
import gstyles from "../globals.module.css";
import Image from "next/image";
import { serif } from "./fonts";
import Button from "./Button";

export default function About() {
  return (
    <main className={`${styles.container} ${serif.className} grid grid-flow-col grid-cols-3`}>
      <section className={styles.panel + " col-span-2 "}>
        <h1 className={gstyles.headline}>About</h1>
        <h2 className={gstyles.subheadline}>Pianist, Producer, Music Technology</h2>
        <p className={gstyles.description}>
          I'm a Pianist and Computer Scientist based in Pittsburgh.

          Fun Facts: I made this website from scratch in Next.js
        </p>
        <div className={styles.buttons}>
          <Button text="Resume"
            link="/resume.pdf"
            download={true} />
          <Button text="Photo"
            link="/headshot.jpg"
            download />
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