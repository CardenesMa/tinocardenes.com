// SocialButtons.tsx
// Einfache Social Media Buttons für die Navbar


import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import styles from "./navbar.module.css";

const SOCIAL_SIZE = 20;
const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/CardenesMa",
    icon: faGithub,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/tinocardenes/",
    icon: faInstagram,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@tinocardenes",
    icon: faYoutube,
  },
];

const SocialButtons = () => (
  <div style={{ display: "flex", gap: `${SOCIAL_SIZE / 2}px` }}>
    {socialLinks.map((link) => (
      <Link
        key={link.name}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.name}
        style={{ color: "inherit", textDecoration: "none" }}
        passHref
      >
        <span style={{ display: "inline-block", width: `${SOCIAL_SIZE}px`, height: `${SOCIAL_SIZE}px` }}>
          <FontAwesomeIcon icon={link.icon} className={styles.socialIcon} />
        </span>
      </Link>
    ))}
  </div >
);

export default SocialButtons;
