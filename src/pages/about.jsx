import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Landmark, ChartNoAxesCombined, GraduationCap, Code } from "lucide-react";
import personImg from "../assets/about/person.jpg";
import { aboutData } from "../data/about";
import { supabase } from "../lib/supabase";

// Analytics is 7 now

function CountUp({ target, suffix }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const start = performance.now(); const dur = 1200;
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * target));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, target]);
    return <p ref={ref} className="text-xl font-bold text-latte sm:text-2xl">{String(val).padStart(2, "0")}{suffix}</p>;
}

const aboutIconMap = {
    Landmark,
    ChartNoAxesCombined,
    GraduationCap,
    Code,
};

export default function About() {
    const [content, setContent] = useState(aboutData);

    useEffect(() => {
        let active = true;

        async function loadPublishedAbout() {
            try {
                const { data, error } = await supabase
                    .from("about_settings")
                    .select("*")
                    .eq("is_published", true)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error || !data || !active) return;

                setContent({
                    heading: data.heading ?? content.heading,
                    paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : content.paragraphs,
                    stats: Array.isArray(data.stats) ? data.stats : content.stats,
                    focusAreas: Array.isArray(data.focus_areas) ? data.focus_areas : content.focusAreas,
                });
            } catch (error) {
                console.error("Unable to load published About content:", error);
            }
        }

        loadPublishedAbout();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section id="about" className="relative overflow-hidden bg-mocha py-12 sm:py-16">
            <div className="container relative mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid items-start gap-6 lg:grid-cols-[0.62fr_1.38fr] lg:gap-10">
                    {/* 1. PERSON - full image, no crop. Container matches real ratio 846x1280 */}
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.5rem] lg:mx-0">
                        <img src={personImg} alt="Salim Ibrahim" className="aspect-[846/1280] w-full object-cover object-center" />
                    </motion.div>
                    {/* RIGHT - 2. Title just About, 4. ALL writings back, smaller font */}
                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <h2 className="text-4xl font-bold tracking-tight text-espresso sm:text-5xl">About</h2>
                        <h3 className="mt-3 text-base font-semibold leading-relaxed text-gold sm:text-lg">
                            {content.heading}
                        </h3>
                        <div className="mt-3 space-y-3 text-[13px] leading-6 text-cream/85">
                            {content.paragraphs.map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                        {/* 3. SMALLER + GLASS + COUNT-UP — now light glass on latte */}
                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                            {content.stats.map((s) => (
                                <div key={s.label} className="rounded-xl border border-white/15 bg-black/15 p-3 backdrop-blur-md">
                                    <span className="mb-2 block h-2 w-2 rounded-full bg-gold" />
                                    <CountUp target={s.target} suffix={s.suffix} />
                                    <p className="mt-1 text-[10px] leading-3.5 text-cream/70 sm:text-[11px]">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                <div className="mt-10">
                    <h3 className="mb-5 text-xl font-bold text-espresso">Area of Focus</h3>
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                        {content.focusAreas.map((area, i) => {
                            const Icon = typeof area.icon === "string" ? (aboutIconMap[area.icon] || Code) : (area.icon || Code); return (
                                <motion.div key={area.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="rounded-2xl border border-white/10 bg-espresso/40 p-4 transition hover:-translate-y-1 hover:border-gold/50">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><Icon size={20} /></div>
                                    <h4 className="mb-1.5 text-sm font-semibold text-gold">{area.title}</h4>
                                    <p className="text-[13px] leading-6 text-cream/70">{area.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
