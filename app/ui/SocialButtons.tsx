// SocialButtons.tsx
// Simple Social Media Buttons for the Navbar


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
  <div className="flex gap-2.5">
    {socialLinks.map((link) => (
      <Link
        key={link.name}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.name}
        className="text-inherit no-underline"
        passHref
      >
        <span className="inline-block w-5 h-5 transition-colors duration-200 text-[var(--accent)] hover:opacity-80">
          <FontAwesomeIcon icon={link.icon} className="w-full h-full" />
        </span>
      </Link>
    ))}
  </div>
);

export default SocialButtons;
