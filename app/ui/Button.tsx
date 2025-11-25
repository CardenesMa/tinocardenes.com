import React from "react";
import styles from "./button.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";

type ButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
    text: string;
    link: string;
    download?: boolean;
    icon?: IconDefinition;
};

const Button = ({ text, link, download, icon, ...props }: ButtonProps) => {
    const finalClassName = `${styles.button} ${props.className || ""}`;

    return (
        <Link href={link}
            {...props}
            className={finalClassName}
            {...(download ? { download: true } : {})}
        >
            {text}
            {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" className={styles.icon} />}

        </Link>
    );
};

export default Button;