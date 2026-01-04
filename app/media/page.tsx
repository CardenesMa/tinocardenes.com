import gstyles from "../globals.module.css";
import MediaGallery from "./mediaBox";
import styles from "./media.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Media Gallery',
  description: 'Explore videos and media projects by Tino Cardenes, including film compositions, video productions, and creative content.',
  openGraph: {
    title: 'Media Gallery - Tino Cardenes',
    description: 'Explore videos and media projects including film compositions and video productions.',
    url: 'https://tinocardenes.com/media',
  },
};

export default function Media() {
    return (
        <main className={gstyles.softBackground + " h-full min-h-screen flex flex-col"}>
            <div className={styles.mediaHeaderContainer + " w-full mb-8"}>
                <h1 className={gstyles.headline}>Some videos for your enjoyment</h1>
            </div>
            <MediaGallery />
        </main>
    )
}