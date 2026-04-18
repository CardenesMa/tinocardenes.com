
"use client";
import Image from "next/image";
import YoutubePlayer from "../ui/YoutubePlayer";
import Masonry from '@mui/lab/Masonry';

export type Media = {
    name: string;
    link: string;
    type: "Image" | "Video";
    aspectRatio?: number; // width/height ratio (e.g., 16/9, 1, 4/3)
};

const mediaList: Media[] = [
    { name: "Harlem Noctourne", link: "https://www.youtube.com/embed/z1hGBjZeRz0?si=FP9UI2or-gaPvKrW", type: "Video", aspectRatio: 1 },
    { name: "Peterson: Allegro", link: "https://www.youtube.com/embed/YaTAE7Da26o?si=A-oIirofLudugQqB", type: "Video", aspectRatio: 16 / 9 },
    { name: "Wave", link: "https://www.youtube.com/embed/4eYuc9c5NaY?si=pBg-dM5RqD7w5VJs", type: "Video", aspectRatio: 1 },
    { name: "Recorda-Me", link: "https://www.youtube.com/embed/1MmuILlKXMs?si=hVb-njnABBJzP5rl", type: "Video", aspectRatio: 1 },
    { name: "There Will Never Be Another You", link: "https://www.youtube.com/embed/MdaJb28w_9Q?si=e_SprLslL8VikDHn", type: "Video", aspectRatio: 16 / 9 },
    { name: "Kasschau Concerto", link: "https://www.youtube.com/embed/nVpjuSUunGE?si=cMmlpK6bOhkoRaaz", type: "Video", aspectRatio: 16 / 9 },
    { name: "Beethoven Concerto", link: "https://www.youtube.com/embed/7I83NEO6O_I?si=EAWaejoqoaxrHvhM", type: "Video", aspectRatio: 16 / 9 },
];



const MediaGallery = () => {
    return (
        <div className="w-full px-2 md:px-0">
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={0}>
                {mediaList.map((media, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-lg">
                        {media.type === "Image" ? (
                            <div className="relative w-full" style={{ aspectRatio: media.aspectRatio || 16 / 9 }}>
                                <Image
                                    src={media.link}
                                    alt={media.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <YoutubePlayer link={media.link} title={media.name} aspectRatio={media.aspectRatio} />
                        )}

                    </div>
                ))}
            </Masonry>
        </div>
    );
}

export default MediaGallery;