// Navbar.tsx
import Link from "next/link";
import styles from "./navbar.module.css";
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
  <header className={styles["navbar-header"]}>
    <nav className={styles["navbar-main"]}>
      <div className={"grid grid-cols-1 md:grid-cols-3 items-center w-full gap-2"}>
        <div className="col-span-1 hidden md:block"></div>
        <span className={`${nameBigFont.className} col-span-1 antialiased ${styles["navbar-title"]}`}>TINO  CARDENES</span>
        <div className="col-span-1 flex justify-center md:justify-end">
          <SocialButtons />
        </div>
      </div>
      <div className={styles["navbar-links"] + " flex flex-row"}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`${styles["nav-link"]} ${serif.className} `}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>

  </header>
);

export default Navbar;
