"use client";
import Image from "next/image";
import { useState } from "react";
import style from "./mediaVideoBox.module.css";

export type MediaVideoBoxProps = {
    link: string;
    thumbnail: string;
    size?: number;
    aspectRatio?: number;
};

export function MediaVideoBox({ link, thumbnail, size, aspectRatio: providedAspectRatio }: MediaVideoBoxProps) {
    const [imageAspectRatio, setImageAspectRatio] = useState<string>("16/9");
    const aspectRatio = providedAspectRatio ? `${providedAspectRatio}` : imageAspectRatio;

    // Autoplay aktivieren, wenn das Video geladen wird
    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        const container = e.currentTarget;
        if (container.getAttribute('data-has-video') === 'false') {
            container.setAttribute('data-has-video', 'true');
            const iframeStyle = size
                ? `width='${size}' height='${size}'`
                : `style='width:100%; aspect-ratio:${aspectRatio};'`;
            container.innerHTML = `<iframe src='${link}&autoplay=1' ${iframeStyle} class='${style.mediaVideo}' allow='autoplay; fullscreen; picture-in-picture' allowfullscreen border:0'></iframe>`;
        }
    }

    const containerStyle = size
        ? { position: "relative" as const, width: size, height: size }
        : { position: "relative" as const, width: "100%", aspectRatio };

    return (
        <div
            style={containerStyle}
            data-has-video="false"
            onClick={handleClick}
        >
            <Image
                src={thumbnail}
                alt="Video Thumbnail"
                fill={true}
                style={{ objectFit: "cover",  cursor: "pointer" }}
                sizes={size ? `${size}px` : "100vw"}
                priority
                onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    const ratio = `${img.naturalWidth}/${img.naturalHeight}`;
                    setImageAspectRatio(ratio);
                }}
            />
            <button
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}
                aria-label="Play Video"
            >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="white"><polygon points="10,8 22,14 10,20" /></svg>
            </button>
        </div>
    );
}
