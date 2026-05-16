import Image from "next/image";
import { serif } from "./fonts";
import Button from "./Button";
import { faFile, faImage } from "@fortawesome/free-solid-svg-icons";

export default function About() {
  return (
    <main className={`flex flex-col lg:flex-row items-center justify-center min-h-[50vh] px-4 md:px-10 py-8 gap-4 lg:gap-4 ${serif.className}`}>

      <section className="flex-1 px-4 md:px-8 py-4 flex flex-col gap-4 text-left">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">About</h1>
        <h2 className="text-lg md:text-2xl font-medium mb-2 md:mb-4">Musician, Computer Scientist</h2>
        <p className="text-lg md:text-2xl font-normal leading-normal md:pt-4">
          I'm a pianist and music technologist based in Pittsburgh, PA.
          On this corner of the internet you can find my music, software, and projects that combine the two.
          I'm currently pursuing a Bachelors in Computer Science and Music Techology at Carnegie Mellon University,
          and I'm always excited to collaborate with artists and developers to create engaging experiences.
        </p>

      </section>
      <aside className="flex-1 lg:flex flex-col items-center justify-center h-full">
        <Image
          src="/headshot.jpeg"
          alt="Tino Cardenes Headshot"
          width={300}
          height={400}
          className="rounded-xl h-full w-auto"
          priority
        />
        <div className="flex flex-row gap-4 mt-6 flex-shrink">
          <Button text="Resume"
            link="/resume.pdf"
            download={true}
            icon={faFile} />
          <Button text="Photo"
            link="/headshot.jpeg"
            download={true}
            icon={faImage}
          />
          <Button text="Bio"
            link="/bio.pdf"
            download={true}
            icon={faFile}
          />
        </div>
      </aside>
    </main>
  );
}