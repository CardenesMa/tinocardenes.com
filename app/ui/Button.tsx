import React from "react";
import styles from "./button.module.css";
import Link from "next/link";

type ButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
    text: string;
    link: string;
    download?: boolean;
};

const Button = ({ text, link, download, ...props }: ButtonProps) => {
    const finalClassName = `${styles.button} ${props.className || ""}`;

    return (
        <Link href={link}
            {...props}
            className={finalClassName}
            {...(download ? { download: true } : {})}
        >
            {text}

        </Link>
    );
};

export default Button;