// Navbar.tsx
import Link from "next/link";
import { nameBigFont, serif } from "./fonts";
import SocialButtons from "./SocialButtons";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "mailto:cardenestino@gmail.com" },
  { name: "Projects", href: "/projects" },
  { name: "Media", href: "/media" },
  { name: "SonicScore", href: "/sonicscore" },
];

const Navbar = () => (
  <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 shadow-[0 1px 6px -1px rgba(34,34,34,1)]">
    <nav className="block w-full px-2 md:pl-8 pt-4 md:pt-0">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center w-full gap-2 mb-2 md:mb-0">
        <div className="col-span-1 hidden md:block"></div>
        <span className={`${nameBigFont.className} col-span-1 text-center text-xl md:text-3xl font-light tracking-widest antialiased`}>
          TINO  CARDENES
        </span>
        <div className="col-span-1 flex justify-center">
          <SocialButtons />
        </div>
      </div>
      <div className="flex flex-row justify-center flex-wrap gap-3 md:gap-10 px-1 md:px-0 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`${serif.className} font-light text-sm md:text-lg text-slate-800 dark:text-slate-200 no-underline px-2 md:px-3 py-1 md:py-0.5 border-b-2 border-transparent transition-all duration-100 hover:border-b-2 hover:border-slate-800 dark:hover:border-slate-200`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  </header>
);

export default Navbar;
