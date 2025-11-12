
import type { Metadata } from "next";
import { Figtree } from "next/font/google";

import Navbar from "./ui/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
