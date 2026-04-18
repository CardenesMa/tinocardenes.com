import Image from "next/image"
import { serif } from "../ui/fonts"
const HEADER_IMAGE_SIZE = 200;
const ProjectHeader = () => (
    <div className="flex items-center justify-center py-10 md:py-20 px-4">
        <div className="relative w-full max-w-6xl mx-auto py-10 md:py-0">

            {/* --- GRID LAYER 1: IMAGE --- */}
            <div className="hidden md:grid absolute top-0 left-0 grid-cols-5 gap-0 w-full">
                <div className="col-span-3 flex items-start">
                    <Image
                        src="/studio.jpg"
                        alt="Projects Header Image"
                        width={HEADER_IMAGE_SIZE}
                        height={HEADER_IMAGE_SIZE}
                        className="w-full h-auto rounded-lg shadow-xl opacity-60"
                    />
                </div>
            </div>

            {/* --- GRID LAYER 2: TEXT CARD --- */}
            <div className="absolute bottom-0 left-0 grid grid-cols-1 md:grid-cols-5 gap-0 w-full">
                <div className="md:col-span-3 md:col-start-3 flex items-start md:p-10 p-5">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl p-6 md:p-8 rounded-lg">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Projects</h1>
                        <h2 className="text-lg md:text-2xl font-medium">
                            Here's just some of the cool stuff I've been working on. I invite you
                            to get involved or ask me about any of these initiatives.
                        </h2>
                    </div>
                </div>
            </div>

            {/* Spacer so parent has height */}
            <div className="invisible pointer-events-none">
                <div className="h-[150px] md:h-[350px]"></div>
            </div>

        </div>
    </div>
)

export default ProjectHeader;
