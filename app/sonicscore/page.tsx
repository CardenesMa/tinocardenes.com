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
        <main className="flex min-h-screen flex-col bg-[var(--surface-soft)]">
            <div className="m-0 grid grid-cols-2 items-center gap-4 p-4  sm:gap-20 md:p-10">
                <div className={`order-2  flex flex-col gap-6 rounded-md p-0 text-left sm:order-1`}>
                    <h1 className="m-0 text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] md:text-6xl">
                        SonicScore Editor
                    </h1>
                    <p className="m-0 pt-4 text-lg leading-relaxed text-[var(--muted-foreground)] md:text-2xl">
                        Create, share, and print fully customizable SonicScore notation projects with ease. Upgrade your sound bath courses with the only notation software designed specifically for sound practitioners. Enjoy complete control over colors, fonts, styles, and symbols while adjusting text, spacing, and layouts to fit your needs. Your work stays secure with encrypted files for privacy and protection.                    </p>

                    <a
                        href="https://github.com/CardenesMa/SonicScore/archive/refs/heads/main.zip"
                        className={sans.className + " cursor-pointer inline-flex max-w-full items-center justify-center rounded-lg border-0 bg-[var(--accent)] px-6 py-3 text-base font-semibold text-[var(--accent-foreground)] transition-colors duration-300 hover:bg-[var(--accent-strong)] active:bg-[var(--foreground)] active:text-[var(--background)] sm:max-w-[50%]"}>
                        Download for Mac
                    </a>
                </div>
                <div className="order-1 flex items-center justify-center p-4 sm:order-2">
                    <Image preload={true} className="relative h-auto w-full object-contain" src="/sonicscore_logo.png" alt="SonicScore Logo" height={200} width={200} />
                </div>

            </div>
        </main >
    );
}