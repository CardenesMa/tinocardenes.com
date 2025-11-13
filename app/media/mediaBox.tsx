
type Media = { link: string, type: "Image" | "Video" };
import Image from "next/image";

const MEDIA_BOX_SIZE = 500;

const mediaList: Media[] = [
    { link: "/media/image1.jpg", type: "Image" },
    { link: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "Video" },
    { link: "/media/image2.jpg", type: "Image" },
    { link: "https://player.vimeo.com/video/76979871", type: "Video" },
];

const mediaBox = (
    { link, type }: Media
) => {
    if (type === "Image") {
        return (
            <Image src={link} alt="Media Image" width={MEDIA_BOX_SIZE} height={MEDIA_BOX_SIZE} />
        )
    }
    else if (type === "Video") {
        return (<div>
            <iframe
                src={link}
                width={`${MEDIA_BOX_SIZE}px`}
                height={`${MEDIA_BOX_SIZE}px`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
        )
    }
}


const MediaGallery = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        {mediaList.map((media, idx) => (
            <div key={idx} style={{ margin: "1rem" }}>
                {mediaBox(media)}
            </div>
        ))}
    </div>
);

export default MediaGallery;