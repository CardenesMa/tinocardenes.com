"use client";
import style from "./media.module.css";
import gstyle from "../globals.module.css";
import Image from "next/image";
import YoutubePlayer from "../ui/YoutubePlayer";

export type Media = { name: string, link: string, type: "Image" | "Video" };

const MEDIA_BOX_SIZE = 300;

const mediaList: Media[] = [
    { name: "", link: "/media/image1.jpg", type: "Image" },
    { name: "Harlem Noctourne", link: "https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW", type: "Video" },
    { name: "", link: "/media/image2.jpg", type: "Image" },
    { name: "Wave", link: "https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs", type: "Video" },
];

const MediaGallery = () => (
    <div className={style.mediaGallery + " grid grid-flow-row-dense grid-cols-3 gap-2"}>
        {mediaList.map((media, idx) => (
            <div key={idx}>
                {media.type === "Image" ? (
                    <Image src={media.link} alt="Media Image" height={MEDIA_BOX_SIZE} width={MEDIA_BOX_SIZE} />
                ) : (
                    <YoutubePlayer link={media.link} size={MEDIA_BOX_SIZE} />
                )}
                <p className={gstyle.description + " " + style.mediaName}>{media.name}</p>
            </div>
        ))}
    </div>
);

export default MediaGallery;