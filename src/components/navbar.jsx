import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navLinks } from "../data/navigation";
import salimLogo from "../assets/navbar/salim_logo.png";
import { supabase } from "../lib/supabase";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [active, setActive] = useState("Home");
    const [navigationLinks, setNavigationLinks] = useState(navLinks);
    const [cta, setCta] = useState({
        label: "Let's Talk",
        href: "#contact",
        is_visible: true,
    });
    const [logoUrl, setLogoUrl] = useState(salimLogo);

    const closeMenu = () => setMenuOpen(false);

    // LOAD NAVIGATION SETTINGS FROM SUPABASE
    useEffect(() => {
        let cancelled = false;

        async function loadNavigation() {
            try {
                const { data: section, error } = await supabase
                    .from("portfolio_sections")
                    .select("content")
                    .eq("section_key", "navigation")
                    .eq("is_published", true)
                    .maybeSingle();

                if (error) throw error;
                if (!section?.content || cancelled) return;

                const content = section.content;

                if (Array.isArray(content.links)) {
                    const links = content.links
                        .filter((link) =>
                            link &&
                            typeof link.name === "string" &&
                            typeof link.href === "string" &&
                            link.is_visible !== false
                        )
                        .sort(
                            (a, b) =>
                                (Number(a.sort_order) || 0) -
                                (Number(b.sort_order) || 0)
                        )
                        .map((link) => ({
                            name: link.name,
                            href: link.href,
                        }));

                    setNavigationLinks(links);
                    setActive(links[0]?.name || "");
                }

                if (content.cta && !cancelled) {
                    setCta({
                        label:
                            typeof content.cta.label === "string"
                                ? content.cta.label
                                : "Let's Talk",
                        href:
                            typeof content.cta.href === "string"
                                ? content.cta.href
                                : "#contact",
                        is_visible: content.cta.is_visible !== false,
                    });
                }

                // LOAD SELECTED NAVBAR LOGO
                if (content.logo_media_id) {
                    const { data: media, error: mediaError } = await supabase
                        .from("media_assets")
                        .select("id, file_path, bucket_name")
                        .eq("id", content.logo_media_id)
                        .maybeSingle();

                    if (mediaError) throw mediaError;

                    if (media?.file_path && !cancelled) {
                        const { data: publicUrl } = supabase.storage
                            .from(media.bucket_name || "portfolio-media")
                            .getPublicUrl(media.file_path);

                        if (publicUrl?.publicUrl) {
                            setLogoUrl(publicUrl.publicUrl);
                        }
                    }
                } else if (!cancelled) {
                    setLogoUrl(salimLogo);
                }
            } catch (error) {
                console.error("Unable to load navigation settings:", error);
                // Keep the existing static navigation and logo as fallback.
            }
        }

        loadNavigation();

        return () => {
            cancelled = true;
        };
    }, []);

    // ACTIVE SECTION — watches the visible page section.
    useEffect(() => {
        const hashLinks = navigationLinks.filter(
            (link) => typeof link.href === "string" && link.href.startsWith("#")
        );

        const sections = hashLinks
            .map((link) => document.getElementById(link.href.slice(1)))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const link = hashLinks.find(
                            (item) => item.href === `#${entry.target.id}`
                        );

                        if (link) setActive(link.name);
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [navigationLinks]);

    return (
        <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-4 sm:px-6">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/15 bg-white/[0.08] py-1.5 pl-4 pr-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:pl-5">

                {/* NAVBAR LOGO */}
                <a
                    href="#home"
                    onClick={closeMenu}
                    className="flex shrink-0 items-center"
                    aria-label="Salim — home"
                >
                    <img
                        src={logoUrl}
                        alt="Salim"
                        className="h-9 w-auto object-contain"
                    />
                </a>

                {/* DESKTOP NAVIGATION */}
                <div className="hidden items-center gap-5 lg:flex xl:gap-6">
                    {navigationLinks.map((link) => {
                        const isActive = active === link.name;

                        return (
                            <a
                                key={`${link.href}-${link.name}`}
                                href={link.href}
                                className={`relative pb-1.5 text-[13px] transition-colors ${
                                    isActive
                                        ? "font-semibold text-white"
                                        : "text-white/70 hover:text-white"
                                }`}
                            >
                                {isActive && (
                                    <span
                                        className="absolute -bottom-0.5 left-0 right-0 h-[3px] rounded-full bg-[#A678B9] shadow-[0_0_10px_2px_rgba(166,120,185,0.85)]"
                                        aria-hidden="true"
                                    />
                                )}
                                {link.name}
                            </a>
                        );
                    })}
                </div>

                {/* CTA AND MOBILE MENU BUTTON */}
                <div className="flex items-center gap-2">
                    {cta.is_visible && (
                        <a
                            href={cta.href}
                            className="hidden items-center gap-2 rounded-full bg-[#A678B9] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#8F5FA8] lg:flex"
                        >
                            {cta.label} <ArrowUpRight size={16} />
                        </a>
                    )}

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white lg:hidden"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={17} /> : <Menu size={17} />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-white/15 bg-white/[0.08] px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden">
                    <div className="flex flex-col gap-4">
                        {navigationLinks.map((link) => {
                            const isActive = active === link.name;

                            return (
                                <a
                                    key={`${link.href}-${link.name}`}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className={`relative flex items-center gap-3 text-sm transition-colors ${
                                        isActive
                                            ? "font-semibold text-white"
                                            : "text-white/80 hover:text-white"
                                    }`}
                                >
                                    {isActive && (
                                        <span
                                            className="h-[2px] w-6 rounded-full bg-[#A678B9]"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {link.name}
                                </a>
                            );
                        })}

                        {cta.is_visible && (
                            <a
                                href={cta.href}
                                onClick={closeMenu}
                                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#A678B9] px-4 py-2 text-[13px] font-semibold text-white"
                            >
                                {cta.label} <ArrowUpRight size={16} />
                            </a>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
