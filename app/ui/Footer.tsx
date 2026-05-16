export default function Footer() {
    return (
        <div className="mt-auto border-t border-[var(--border)] bg-[var(--footer-background)] px-4 py-5 text-[var(--accent-foreground)]">
            <div className="container mx-auto text-center">
                <p className="text-sm md:text-base">Made with Next.js</p>
                <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} Tino Cardenes. All rights reserved.</p>
            </div>
        </div>
    );
}