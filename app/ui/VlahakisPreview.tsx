"use client"
import { serif } from './fonts';
import YoutubePlayer from './YoutubePlayer';
const videos = [
  { title: "Harlem Nocturne", link: 'https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW' },
  { title: "Wave", link: 'https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs' },
  { title: "Bach: Fugue in D# Minor", link: 'https://www.youtube.com/embed/VnlUzmmqrGg?si=q-UDafTx_bkhgIWf' },
];

const VlahakisPreview = () => {
  return (
    <div className={`flex flex-col items-center ${serif.className}`}>
      <div className="flex w-full flex-col items-center gap-3 bg-[var(--surface-soft)] px-4 pb-8 pt-10 md:px-0 md:pb-16 md:pt-20">
        <h1 className="text-center text-3xl font-bold md:text-5xl">Here's a preview of</h1>
        <h2 className="text-center text-5xl font-black tracking-wide md:text-7xl md:tracking-wider">The Vlahakis Sessions</h2>

        <div className="flex w-full flex-col flex-wrap justify-center gap-6 px-2 pt-6 md:max-w-5xl md:flex-row md:gap-8 md:px-0 md:pt-8">
          {videos.map((file, idx) => (
            <YoutubePlayer title={file.title} key={idx} link={file.link} size={300} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VlahakisPreview;
