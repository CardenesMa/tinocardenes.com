import About from "./ui/about";
import VlahakisPreview from "./ui/VlahakisPreview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Tino Cardenes - Pianist, Music Technologist. Explore my work in music technology, jazz piano, and audio production.',
  openGraph: {
    title: 'Tino Cardenes - Pianist, Music Technologist',
    description: 'Explore my work in music technology, jazz piano, and audio production.',
    url: 'https://tinocardenes.com',
  },
};

export default function Home() {
  return (
    <main>
      <About />
      <VlahakisPreview />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Tino Cardenes",
            "url": "https://tinocardenes.com",
            "image": "https://tinocardenes.com/headshot.avif",
            "jobTitle": "Pianist, Music Technologist",
            "description": "Professional musician and computer scientist specializing in music technology, jazz piano, and media production.",
            "sameAs": [
              // Add your social media URLs here
              // "https://twitter.com/tinocardenes",
              // "https://linkedin.com/in/tinocardenes",
              // "https://youtube.com/@tinocardenes"
            ]
          })
        }}
      />
    </main>
  );
}
