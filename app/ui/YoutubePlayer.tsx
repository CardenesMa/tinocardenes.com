"use client";

import { MediaVideoBox } from "./MediaVideoBox";
import gstyles from "../globals.module.css";
import styles from "./VlahakisPreview.module.css";

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

    return (
        <div className=" relative">
            <MediaVideoBox link={autoplayLink} thumbnail={thumbnail} size={size} aspectRatio={aspectRatio} />
            {title && (
                <div className={styles.videoTitleOverlay}>
                    {title}
                </div>
            )}
        </div>
    );
};

export default YoutubePlayer;