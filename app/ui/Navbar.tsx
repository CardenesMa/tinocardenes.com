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
  <header className="sticky top-0 z-50 pt-4 w-full bg-[var(--background)] shadow-[0_1px_6px_-1px_rgba(34,34,34,0.35)]">
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
      <div className="flex flex-row flex-wrap justify-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-1 py-2 md:gap-10 md:px-0">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`${serif.className} border-b-2  border-transparent px-2 py-1 text-sm  font-light text-[var(--foreground)] no-underline transition-colors duration-200 hover:border-[var(--foreground)] md:px-3 md:py-0.5 md:text-lg`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  </header>
);

export default Navbar;
