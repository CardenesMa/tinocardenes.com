import Image from "next/image";
import { serif } from "./fonts";
import Button from "./Button";
import { faFile, faImage } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <main className={`flex flex-col lg:flex-row items-start justify-center min-h-[50vh] px-4 md:px-8 py-8 gap-4 lg:gap-4 ${serif.className}`}>
      <section className="flex-1 px-4 md:px-8 py-4 flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">About</h1>
        <h2 className="text-lg md:text-2xl font-medium mb-2 md:mb-4">Musician, Computer Scientist</h2>
        <p className="text-lg md:text-2xl font-normal leading-normal md:pt-4">
          I'm a pianist and music technologist based in Pittsburgh, PA.
          On this corner of the internet you can find my music, software, and projects that combine the two.
          I'm currently pursuing a Bachelors in Computer Science and Music Techology at Carnegie Mellon University,
          and I'm always excited to collaborate with artists and developers to create engaging experiences.
        </p>
        <div className="flex flex-row gap-4 mt-6 flex-wrap">
          <Button text="Resume"
            link="/resume.pdf"
            download={true}
            icon={faFile} />
          <Button text="Photo"
            link="/headshot.jpg"
            download={true}
            icon={faImage}
          />
          <Button text="Bio"
            link="/bio.pdf"
            download={true}
            icon={faFile}
          />
        </div>
      </section>
      <aside className="flex-1 hidden lg:flex items-center justify-center w-full">
        <Image
          src="/headshot.avif"
          alt="Tino Cardenes Headshot"
          width={300}
          height={400}
          className="w-full h-auto rounded-2xl"
          priority
        />
      </aside>
    </main>
  );
}