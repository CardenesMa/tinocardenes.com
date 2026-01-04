import Image from "next/image";

export default function ContactPage() {
    return (
        <div className="max-w-sm w-[50%] lg:max-w-full lg:flex shadow-lg my-10 mx-auto">
            <div className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style={{ backgroundImage: "url('/headshot.avif" }} title="Woman holding a mug">
            </div>
            <div className="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                    <p className="text-gray-700 text-base">cardenestino@gmail.com</p>
                    <p className="text-gray-700 text-base">(412) 758-8290</p>
                </div>

            </div>
        </div>
    );
}
