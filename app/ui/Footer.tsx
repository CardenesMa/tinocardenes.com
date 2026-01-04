import styles from "../globals.module.css";
export default function Footer() {
    return (
        <div className=" text-white py-5 mt-auto border-t border-gray-300"
            style={{ backgroundColor: "rgba(54, 34, 59, 1)" }}>
            <div className="container mx-auto text-center" >
                <p>Made with Next.js</p>
                <p>&copy; {new Date().getFullYear()} Tino Cardenes. All rights reserved.</p>
            </div>
        </div>
    );
}