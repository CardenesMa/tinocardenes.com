import MediaGallery from "./mediaBox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Media Gallery',
  description: 'Explore videos and media projects by Tino Cardenes, including film compositions, video productions, and creative content.',
  openGraph: {
    title: 'Media Gallery - Tino Cardenes',
    description: 'Explore videos and media projects including film compositions and video productions.',
    url: 'https://tinocardenes.com/media',
  },
};

export default function Media() {
  return (
    <main className="bg-[rgb(246,240,236)] dark:bg-[rgb(86,81,77)] h-full min-h-screen flex flex-col">
      <div className="w-full flex flex-col gap-4 px-4 py-8 md:py-16 justify-center items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">Some videos for your enjoyment</h1>
      </div>
      <MediaGallery />
    </main>
  )
}