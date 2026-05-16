import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { sans } from "./fonts";

type ButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
    text: string;
    link: string;
    download?: boolean;
    icon?: IconDefinition;
};

const Button = ({ text, link, download, icon, ...props }: ButtonProps) => {
    const baseClasses = "inline-flex items-center gap-2 px-7 py-3 rounded-lg border-2 border-[var(--accent)] text-[var(--accent)] no-underline font-bold text-base transition-all duration-300 hover:bg-[var(--accent)] hover:text-[var(--background)] hover:border-transparent";
    const finalClassName = `${baseClasses} ${sans.className} ${props.className || ""}`;

    return (
        <Link href={link}
            {...props}
            className={finalClassName}
            {...(download ? { download: true } : {})}
        >
            {text}
            {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" className="w-4" />}
        </Link>
    );
};

export default Button;