
"use client";

import { MediaVideoBox } from "./MediaVideoBox";
import { useState } from "react";
const getYoutubeId = (url: string) => {
    const match = url.match(/embed\/([\w-]+)/);
    return match ? match[1] : null;
};

type YoutubePlayerProps = {
    title?: string;
    link: string;
    size?: number;
    aspectRatio?: number;
};

const YoutubePlayer = ({ title, link, size, aspectRatio }: YoutubePlayerProps) => {
    const autoplayLink = link.includes("autoplay=1") ? link : `${link}&autoplay=1`;
    const thumbnail = getYoutubeId(link) ? `https://img.youtube.com/vi/${getYoutubeId(link)}/maxresdefault.jpg` : "";
    const [playing, setPlaying] = useState(false);
    return (
        <div className="relative">
            <MediaVideoBox link={autoplayLink} thumbnail={thumbnail} size={size} aspectRatio={aspectRatio} playing={playing}
                onPlay={() => setPlaying(true)} />
            {title && !playing && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 md:px-6 pt-8 md:pt-12 pb-3 md:pb-2 text-white text-2xl md:text-3xl font-black h-full flex flex-col-reverse whitespace-nowrap text-center pointer-events-none">
                    {title}
                </div>
            )}
        </div>
    );
};

export default YoutubePlayer;