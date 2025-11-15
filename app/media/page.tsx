import gstyles from "../globals.module.css";
import MediaGallery from "./mediaBox";
import styles from "./media.module.css";
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