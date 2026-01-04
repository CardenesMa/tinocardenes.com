import styles from "./sonicscore.module.css";
import gstyles from "../globals.module.css";
import { sans } from "../ui/fonts";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'SonicScore Editor',
  description: 'SonicScore Editor - Create, share, and print fully customizable sound bath notation projects with complete control over colors, fonts, styles, and symbols.',
  keywords: ['SonicScore', 'sound bath', 'sound practitioner', 'music editor', 'notation software'],
  openGraph: {
    title: 'SonicScore Editor - Tino Cardenes',
    description: 'Create, share, and print fully customizable sound bath notation projects.',
    url: 'https://tinocardenes.com/sonicscore',
  },
};

export default function SonicScore() {
    return (
        <main className={styles.pageBackground + " h-full min-h-screen flex flex-col"}>
            <div className="grid grid-flow-col grid-cols-2 gap-20 p-10 m-0 items-center">
                {/* Split the components into R, L */}
                <div className={`${styles.sonicScoreTypeset} flex flex-row gap-10 col-span-1 rounded-md p-0 `}>
                    <h1 className={`${gstyles.headline}  ${sans.className}`}>
                        SonicScore Editor
                    </h1>
                    <p className={gstyles.description}>
                        Create, share, and print fully customizable SonicScore notation projects with ease. Upgrade your sound bath courses with the only notation software designed specifically for sound practitioners. Enjoy complete control over colors, fonts, styles, and symbols while adjusting text, spacing, and layouts to fit your needs. Your work stays secure with encrypted files for privacy and protection.                    </p>

                    <button className={styles.downloadButton}>
                        Download for Mac
                    </button>
                </div>
                <div className="col-span-1 flex justify-center items-center p-4">
                    <Image preload={true} className={styles.sonicScoreLogo} src="/sonicscore_logo.png" alt="SonicScore Logo" fill={true} />
                </div>

            </div>
        </main>
    );
}