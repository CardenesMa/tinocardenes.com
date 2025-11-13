import gstyles from "../globals.module.css";
import MediaGallery from "./mediaBox";
export default function Media() {
    return (
        <main>
            <div className="w-full bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 py-8 px-4 flex flex-col items-center text-white shadow-lg mb-8">
                <h1 className={gstyles.headline}>Media</h1>
                <h2 className={gstyles.subheadline}>Photos, Videos, and Press</h2>
            </div>
            <MediaGallery />
        </main>
    )
}