// Navbar.tsx
import Link from "next/link";
import styles from "./navbar.module.css";
import { nameBigFont, serif } from "./fonts";
import SocialButtons from "./SocialButtons";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
  { name: "Projects", href: "/projects" },
  { name: "Media", href: "/media" },
  { name: "SonicScore", href: "/sonicscore" },
];

const Navbar = () => (
  <header className={styles["navbar-header"]}>
    <nav className={styles["navbar-main"]}>
  <div style={{ display: "flex", justifyContent: "center", margin: "0 auto" }}>
        <span className={`${nameBigFont.className} antialiased ${styles["navbar-title"]}`}>TINO  CARDENES</span>
      </div>
    <SocialButtons />
    </nav>
    <div className={styles["navbar-links"]}>
      {navLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={`${styles["nav-link"]} ${serif.className}`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  </header>
);

export default Navbar;
