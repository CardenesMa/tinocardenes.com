import Image from "next/image"
import styles from "./projectHeader.module.css"
import gstyles from "../globals.module.css"
import { serif } from "../ui/fonts"
const HEADER_IMAGE_SIZE = 200;
const ProjectHeader = () => (
    <div className={" flex items-center justify-center h-1/3 p-10"}>
        <div className="relative w-full max-w-6xl mx-auto p-10">

            {/* --- GRID LAYER 1: IMAGE --- */}
            <div className="absolute top-0 left-0 grid grid-cols-5 gap-0 w-full hidden md:grid">
                <div className="col-span-3 flex items-start">
                    <Image
                        src="/studio.jpg"
                        alt="Projects Header Image"
                        width={HEADER_IMAGE_SIZE}
                        height={HEADER_IMAGE_SIZE}
                        className={styles.headerImage + " w-full h-auto rounded-lg shadow-xl"}
                    />
                </div>
            </div>

            {/* --- GRID LAYER 2: TEXT CARD --- */}
            <div className="absolute bottom-0 left-0 grid grid-cols-1 md:grid-cols-5 min-h-1/2 gap-0 w-full bottom-0">
                <div className="md:col-span-3 md:col-start-3 flex items-start md:p-10 sm:p-5">
                    <div
                        className={
                            styles.introTextContainer +
                            " bg-white/95 backdrop-blur shadow-2xl p-8"
                        }
                    >
                        <h1 className={gstyles.headline}>Projects</h1>
                        <h2 className={gstyles.subheadline}>
                            Here's just some of the cool stuff I've been working on. I invite you
                            to get involved or ask me about any of these initiatives.
                        </h2>
                    </div>
                </div>
            </div>

            {/* Spacer so parent has height */}
            <div className="invisible pointer-events-none">
                <div className="h-[200px] md:h-[350px]"></div>
            </div>

        </div>
    </div>



)

export default ProjectHeader;
