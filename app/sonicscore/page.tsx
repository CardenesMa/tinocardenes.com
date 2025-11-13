import styles from "./sonicscore.module.css";
import gstyles from "../globals.module.css";
import { sans } from "../ui/fonts";
import Image
    from "next/image";
export default function SonicScore() {
    return (
        <main className={styles.pageBackground}>
            <div className=" grid grid-flow-col grid-cols-3 gap-0 p-10 m-0 items-center">
                {/* Split the components into R, L */}
                <div className={`${styles.sonicScoreTypeset} col-span-2 rounded-md p-0 `}>
                    <h1 className={`${gstyles.headline}  ${sans.className}`}>
                        SonicScore
                    </h1>
                    <h2 className={gstyles.subheadline}>
                        Revolutionizing Music Notation with AI-Powered SonicScore
                    </h2>
                    <p className={gstyles.description}>
                        SonicScore is an innovative music notation software that leverages artificial intelligence to transform the way musicians compose, edit, and share their music. By integrating advanced AI algorithms, SonicScore offers intelligent suggestions, automatic harmonization, and real-time feedback, making music creation more intuitive and accessible for composers of all levels.
                    </p>
                </div>
                <div className="col-span-1 flex justify-center items-center p-4">
                    <Image className={styles.sonicScoreLogo} src="/sonicscore_logo.png" alt="SonicScore Logo" fill={true} />
                </div>

            </div>
        </main>
    );
}