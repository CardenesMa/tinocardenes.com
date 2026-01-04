
import type { Metadata } from "next";
import Navbar from "./ui/Navbar";
import Footer from "./ui/Footer";
import { serif } from "./ui/fonts";
import "./globals.css"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Default everything inherit same font */}
      <body className={`${serif.className} flex flex-col min-h-screen`}>
        <Navbar />
        {children}
        <Footer />
      </body>

    </html>
  );
}
