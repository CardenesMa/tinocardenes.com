"use client";

import { MediaVideoBox } from "./MediaVideoBox";
import gstyles from "../globals.module.css";
const getYoutubeId = (url: string) => {
    const match = url.match(/embed\/([\w-]+)/);
    return match ? match[1] : null;
};

type YoutubePlayerProps = {
    title?: string;
    link: string;
    size?: number;
};

const YoutubePlayer = ({ title, link, size }: YoutubePlayerProps) => {
    const autoplayLink = link.includes("autoplay=1") ? link : `${link}&autoplay=1`;
    const thumbnail = getYoutubeId(link) ? `https://img.youtube.com/vi/${getYoutubeId(link)}/maxresdefault.jpg` : "";

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <MediaVideoBox link={autoplayLink} thumbnail={thumbnail} size={size} />
        </div>
    );
};

export default YoutubePlayer;