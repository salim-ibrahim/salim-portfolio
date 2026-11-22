import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Fingerprint, Award } from "lucide-react";
import { certificationsData } from "../data/certifications";
import { supabase } from "../lib/supabase";

export default function Certifications() {
    const [certifications, setCertifications] = useState(certificationsData);
    const [active, setActive] = useState(0);

    const swipeX = useRef(null);

    useEffect(() => {
        let isMounted = true;

        async function loadCertifications() {
            const { data, error } = await supabase
                .from("certifications")
                .select("*")
                .eq("is_published", true)
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("Error loading certifications:", error);
                return;
            }

            if (!isMounted) return;

            if (!data || data.length === 0) {
                setCertifications([]);
                setActive(0);
                return;
            }

            const mediaIds = [
                ...new Set(
                    data.flatMap((item) =>
                        [
                            item.issuer_logo_media_id,
                            item.certificate_media_id,
                        ].filter(Boolean)
                    )
                ),
            ];

            let mediaMap = {};

            if (mediaIds.length > 0) {
                const { data: media, error: mediaError } = await supabase
                    .from("media_assets")
                    .select("id, file_path, bucket_name")
                    .in("id", mediaIds);

                if (mediaError) {
                    console.error("Error loading certification media:", mediaError);
                } else {
                    mediaMap = Object.fromEntries(
                        media.map((asset) => [
                            asset.id,
                            supabase.storage
                                .from(asset.bucket_name || "portfolio-media")
                                .getPublicUrl(asset.file_path).data.publicUrl,
                        ])
                    );
                }
            }

            const formatted = data.map((item) => {
                const issuedDate = item.issued_date
                    ? new Date(`${item.issued_date}T00:00:00`)
                    : null;

                let issued = "";

                if (issuedDate) {
                    issued = issuedDate.getDate() === 1
                        ? issuedDate.toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                        })
                        : issuedDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        });
                }

                return {
                    title: item.title,
                    issuer: item.issuer,
                    issued,
                    id: item.credential_id === "—" || item.credential_id === "â€”"
                        ? ""
                        : item.credential_id || "",
                    desc: item.description || "",
                    skills: Array.isArray(item.skills) ? item.skills : [],
                    img: mediaMap[item.certificate_media_id] || "",
                    logo: mediaMap[item.issuer_logo_media_id] || "",
                };
            });

            if (isMounted) {
                setCertifications(formatted);
                setActive(0);
            }
        }

        loadCertifications();

        return () => {
            isMounted = false;
        };
    }, []);

    const cert = certifications[active];

    const goNext = () => {
        if (certifications.length > 0) {
            setActive((a) => (a + 1) % certifications.length);
        }
    };

    const goPrev = () => {
        if (certifications.length > 0) {
            setActive((a) => (a - 1 + certifications.length) % certifications.length);
        }
    };

    const onTouchStart = (e) => {
        swipeX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (swipeX.current === null) return;

        const dx = e.changedTouches[0].clientX - swipeX.current;
        swipeX.current = null;

        if (dx < -50) goNext();
        else if (dx > 50) goPrev();
    };

    if (!cert) {
        return (
            <section id="certifications" className="relative overflow-hidden bg-mocha">
                <div className="container mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] font-bold text-espresso">
                        Certifications & Training.
                    </h2>
                    <p className="mt-6 text-espresso/60">
                        No certifications are currently available.
                    </p>
                </div>
            </section>
        );
    }
    return (
        <section id="certifications" className="relative overflow-hidden bg-mocha">
            {/* DIRTY-BLACK SEPARATOR — v1, same as Skills / Experience / Education / Projects: ~2cm band fading down into mocha + spreading to the edges */}
            <div aria-hidden="true" className="relative h-[76px] w-full overflow-hidden" style={{ background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 h-[22px]" style={{ background: "linear-gradient(to bottom, rgba(107,74,58,0) 0%, rgba(107,74,58,0.55) 55%, #6B4A3A 100%)", filter: "blur(2px)" }} />
            </div>
            {/* HEADING — above the section, one line, never wraps */}
            <div className="container mx-auto max-w-7xl px-6 pt-12 sm:pt-16 lg:px-10">
                <h2 className="mb-8 whitespace-nowrap text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-none tracking-tight text-espresso">Certifications & <span className="text-espresso">Training.</span></h2>
            </div>
            {/* 3 COLUMNS: left glass | middle image | right details - image has its OWN lane, so it covers nothing */}
            <div className="grid items-start pb-12 sm:pb-16 lg:grid-cols-[0.85fr_0.62fr_0.95fr]">
                {/* 2. LEFT - GLASS EDGE TO EDGE, title INSIDE glass */}
                <div className="rounded-r-[1.5rem] border-y border-r border-cream/15 bg-white/[0.06] p-6 pr-6 backdrop-blur-md sm:p-8 sm:pl-10 lg:pl-16">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Certifications</p>
                    <div className="mt-6 space-y-1">
                        {certificationsData.map((c, i) => {
                            const isActive = i === active;
                            return (
                                <button key={c.title} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} className={`block w-full text-left text-[15px] leading-6 transition-all duration-200 ${isActive ? "scale-[1.02] font-bold text-white [text-shadow:0_0_12px_rgba(167,139,250,0.85)]" : "font-medium text-white/40 hover:text-[#C4B5FD] hover:[text-shadow:0_0_12px_rgba(167,139,250,0.9)]"}`}>{c.title}</button>
                            );
                        })}
                    </div>
                </div>

                {/* 1+3. MIDDLE - BIGGER, STRAIGHT, NOT SLANTED, pops + gently bounces up/down */}
                <div className="relative hidden items-center justify-center px-4 pt-32 lg:flex">
                    <AnimatePresence mode="wait">
                        <motion.div key={active} initial={{ scale: 0.6, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.6, y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.7 }} className="w-full max-w-[300px]">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} className="overflow-hidden rounded-xl border-2 border-cream/20 bg-white shadow-2xl">
                                <img src={cert.img} alt={cert.title} className="aspect-[4/3] w-full object-cover" />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RIGHT - open text + 4. BUBBLES BACK, glass, long ID wraps inside.
                    SWIPE HERE changes the selection — same as the left list. */}
                <div className="touch-pan-y px-6 pt-8 lg:px-10 lg:pt-2" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    <AnimatePresence mode="wait">
                        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5"><img src={cert.logo} alt={cert.issuer} className="max-h-full max-w-full object-contain" /></div>
                                <p className="text-sm font-bold text-latte">{cert.issuer === "MTN" ? "MTN" : "Mastercard"}</p>
                            </div>
                            <h3 className="mt-5 text-2xl font-bold leading-8 text-gold sm:text-3xl">{cert.title}</h3>
                            <p className="mt-4 text-[14px] leading-7 text-cream/60">{cert.desc}</p>
                            <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
                                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-cream/15 bg-white/[0.06] px-4 py-3 backdrop-blur-md"><Calendar size={16} className="shrink-0 text-gold" /><div className="min-w-0"><p className="text-[11px] uppercase tracking-wider text-gold">Issued</p><p className="text-sm font-semibold text-latte">{cert.issued}</p></div></div>
                                <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-cream/15 bg-white/[0.06] px-4 py-3 backdrop-blur-md"><Fingerprint size={16} className="shrink-0 text-gold" /><div className="min-w-0"><p className="text-[11px] uppercase tracking-wider text-gold">Credential ID</p><p className="break-all text-sm font-semibold leading-5 text-latte">{cert.id}</p></div></div>
                            </div>
                            <div className="mt-6">
                                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold"><Award size={14} /> Skills</p>
                                <div className="flex flex-wrap gap-2">{cert.skills.map((s) => (<span key={s} className="rounded-full border border-cream/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-cream backdrop-blur-md">{s}</span>))}</div>
                            </div>
                            <div className="mt-6 overflow-hidden rounded-xl border border-cream/15 bg-white lg:hidden"><img src={cert.img} alt={cert.title} className="w-full object-cover" /></div>
                            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-cream/40 lg:hidden">Swipe left / right to browse</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
