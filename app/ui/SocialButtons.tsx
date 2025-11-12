// SocialButtons.tsx
// Einfache Social Media Buttons für die Navbar


import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";

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
  <div style={{ display: "flex", gap: "1rem" }}>
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
          <span style={{ display: "inline-block", width: "2.2rem", height: "2.2rem" }}>
            <FontAwesomeIcon icon={link.icon} style={{ fontSize: "2rem", color: "#222", width: "100%", height: "100%" }} />
          </span>
        </Link>
    ))}
  </div>
);

export default SocialButtons;
