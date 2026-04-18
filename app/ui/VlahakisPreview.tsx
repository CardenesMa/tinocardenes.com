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
      <div className="w-full px-4 md:px-0 flex flex-col items-center pt-10 md:pt-20 pb-8 md:pb-16 gap-3 bg-[rgb(246,240,236)] dark:bg-[rgb(86,81,77)]">
        <h1 className="text-3xl md:text-5xl font-bold text-center">Here's a preview of</h1>
        <h2 className="text-5xl md:text-7xl font-black tracking-wide md:tracking-wider text-center">The Vlahakis Sessions</h2>

        <div className="flex flex-col md:flex-row justify-center flex-wrap gap-6 md:gap-8 w-full pt-6 md:pt-8 max-w-5xl px-2 md:px-0">
          {videos.map((file, idx) => (
            <YoutubePlayer title={file.title} key={idx} link={file.link} size={300} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VlahakisPreview;
