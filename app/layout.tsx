
import type { Metadata } from "next";
import Navbar from "./ui/Navbar";
import Footer from "./ui/Footer";
import { serif } from "./ui/fonts";
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://tinocardenes.com'),
  title: {
    default: 'Tino Cardenes - Pianist, Music Technologist',
    template: '%s | Tino Cardenes'
  },
  description: 'Professional musician and computer scientist specializing in music technology, jazz piano, and media production.',
  keywords: ['Tino Cardenes', 'pianist', 'music technologist', 'jazz piano', 'audio production', 'music technology', 'computer scientist', 'musician'],
  authors: [{ name: 'Tino Cardenes' }],
  creator: 'Tino Cardenes',
  publisher: 'Tino Cardenes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tinocardenes.com',
    siteName: 'Tino Cardenes',
    title: 'Tino Cardenes - Pianist, Music Technologist',
    description: 'Professional musician and computer scientist specializing in music technology, jazz piano, and media production.',
    images: [
      {
        url: '/headshot.avif',
        width: 1200,
        height: 630,
        alt: 'Tino Cardenes',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you get them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

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
