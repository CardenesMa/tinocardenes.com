import Image from "next/image";
import gstyles from "../globals.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
export default function ContactPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full border border-gray-100">
                <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                        src="/headshot.avif"
                        alt="Tino Cardenes"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Get In Touch</h1>
                    
                    <div className="space-y-4">
                        <div className={ gstyles.description + " flex items-center gap-3 group"}>
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                            <a href="mailto:cardenestino@gmail.com" className={ " hover:underline"}>
                                cardenestino@gmail.com
                            </a>
                        </div>
                         
                        <div className={ gstyles.description + " flex items-center gap-3 group"}>
                                  <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />

                            <a href="tel:+14127588290" className={ " hover:underline"}>
                                (412) 758-8290
                            </a> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
