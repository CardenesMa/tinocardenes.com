"use client";
import style from "./media.module.css";
import gstyle from "../globals.module.css";
import Image from "next/image";
import YoutubePlayer from "../ui/YoutubePlayer";

export type Media = { name: string, link: string, type: "Image" | "Video" };

const mediaList: Media[] = [
    { name: "Harlem Noctourne", link: "https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW", type: "Video" },
    { name: "Peterson: Allegro", link: "https://www.youtube.com/embed/YaTAE7Da26o?si=A-oIirofLudugQqB", type: "Video" },
    { name: "Wave", link: "https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs", type: "Video" },
    { name: "Recorda-Me", link: "https://www.youtube.com/embed/1MmuILlKXMs?si=hVb-njnABBJzP5rl", type: "Video" },
    { name: "There Will Never Be Another You", link: "https://www.youtube.com/embed/MdaJb28w_9Q?si=e_SprLslL8VikDHn", type: "Video" },
    { name: "Kasschau Concerto", link: "https://www.youtube.com/embed/nVpjuSUunGE?si=cMmlpK6bOhkoRaaz", type: "Video" },
    { name: "Beethoven Concerto", link: "https://www.youtube.com/embed/7I83NEO6O_I?si=EAWaejoqoaxrHvhM", type: "Video" },
];

const MediaGallery = () => (
    <div className={style.mediaGallery + " grid grid-flow-row-dense grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
        {mediaList.map((media, idx) => (
            <div key={idx} className={style.mediaCard}>
                <div className={style.mediaContent}>
                    {media.type === "Image" ? (
                        <Image src={media.link} alt="Media Image" className="w-full h-auto" />
                    ) : (
                        <YoutubePlayer link={media.link} />
                    )}
                </div>
                <div className={style.mediaInfo}>
                    <h3 className={style.mediaName}>{media.name}</h3>
                </div>
            </div>
        ))}
    </div>
);

export default MediaGallery;