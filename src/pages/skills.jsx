import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { skillsData } from "../data/skills";
import { supabase } from "../lib/supabase";

const defaultSkillCategories = [
    {
        title: skillsData.technical.title,
        short: "Tools",
        direction: -1,
        speed: 0.6,
        sparkleFill: "#E7D6C1",
        sparkleStroke: "rgba(255,255,255,0.85)",
        skills: skillsData.technical.skills,
    },
    {
        title: skillsData.professional.title,
        short: "Professional Skills",
        direction: 1,
        speed: 0.6,
        sparkleFill: "#A678B9",
        sparkleStroke: "none",
        skills: skillsData.professional.skills,
    },
    {
        title: skillsData.soft.title,
        short: "Soft Skills",
        direction: -1,
        speed: 0.45,
        sparkleFill: "#2B4BD8",
        sparkleStroke: "none",
        skills: skillsData.soft.skills,
    },
];
// SPARKLE SEPARATOR — the 4-point star from your reference, instead of the dot.
// Colour still identifies the lane. Tools star was black — invisible on the
// new super-black marquee — so it is now latte cream + white outline.
function Sparkle({ fill, stroke, size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
            <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill={fill} stroke={stroke} strokeWidth={stroke === "none" ? 0 : 1.4} />
        </svg>
    );
}
function MarqueeRow({ category }) {
    const trackRef = useRef(null); const groupRef = useRef(null);
    const posRef = useRef(0); const draggingRef = useRef(false); const lastXRef = useRef(0); const hoverRef = useRef(false);
    useEffect(() => {
        let raf;
        const tick = () => {
            const track = trackRef.current; const group = groupRef.current;
            if (track && group) {
                const loop = group.offsetWidth;
                if (!hoverRef.current && !draggingRef.current) {
                    posRef.current += category.speed * category.direction;
                    if (posRef.current <= -loop) posRef.current += loop;
                    if (posRef.current > 0) posRef.current -= loop;
                }
                track.style.transform = `translateX(${posRef.current}px)`;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [category.speed, category.direction]);
    const onPointerDown = (e) => { draggingRef.current = true; lastXRef.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); };
    const onPointerMove = (e) => {
        if (!draggingRef.current) return;
        const dx = e.clientX - lastXRef.current; lastXRef.current = e.clientX; posRef.current += dx;
        const group = groupRef.current; const track = trackRef.current;
        if (group && track) { const loop = group.offsetWidth; if (posRef.current <= -loop) posRef.current += loop; if (posRef.current > 0) posRef.current -= loop; track.style.transform = `translateX(${posRef.current}px)`; }
    };
    const onPointerUp = () => { draggingRef.current = false; };
    return (
        <div className="border-t border-white/10 py-4 last:border-b">
            <div className="cursor-grab overflow-hidden active:cursor-grabbing"
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
                onPointerLeave={() => { hoverRef.current = false; }} onPointerEnter={() => { hoverRef.current = true; }}>
                <div ref={trackRef} className="flex w-max select-none will-change-transform">
                    {[0, 1, 2, 3, 4, 5].map((copy) => (
                        <div key={copy} ref={copy === 0 ? groupRef : null} className="flex items-center gap-3 pr-3">
                            {category.skills.map((skill) => (
                                <span key={`${copy}-${skill}`} className="flex items-center gap-3 whitespace-nowrap">
                                    <span className="text-sm font-medium text-cream">{skill}</span>
                                    <Sparkle fill={category.sparkleFill} stroke={category.sparkleStroke} />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default function Skills() {
    const [skillCategories, setSkillCategories] = useState(defaultSkillCategories);

    useEffect(() => {
        let active = true;

        async function loadPublishedSkills() {
            try {
                const { data: groups, error: groupError } = await supabase
                    .from("skill_groups")
                    .select("id, title, group_key, sort_order")
                    .eq("is_published", true)
                    .order("sort_order", { ascending: true });

                if (groupError || !groups?.length) return;

                const { data: skillRows, error: skillError } = await supabase
                    .from("skills")
                    .select("id, group_id, name, sort_order")
                    .eq("is_published", true)
                    .order("sort_order", { ascending: true });

                if (skillError || !active) return;

                const styles = {
                    technical: { short: "Tools", direction: -1, speed: 0.6, sparkleFill: "#E7D6C1", sparkleStroke: "rgba(255,255,255,0.85)" },
                    professional: { short: "Professional Skills", direction: 1, speed: 0.6, sparkleFill: "#A678B9", sparkleStroke: "none" },
                    soft: { short: "Soft Skills", direction: -1, speed: 0.45, sparkleFill: "#2B4BD8", sparkleStroke: "none" },
                };

                const mapped = groups.map((group) => ({
                    title: group.title,
                    skills: (skillRows || [])
                        .filter((skill) => skill.group_id === group.id)
                        .map((skill) => skill.name),
                    ...(styles[group.group_key] || styles.technical),
                }));

                if (active) setSkillCategories(mapped);
            } catch (error) {
                console.error("Unable to load published skills:", error);
            }
        }

        loadPublishedSkills();
        return () => { active = false; };
    }, []);

    return (
        <section id="skills" className="relative overflow-hidden">
            {/* DIRTY-BLACK SEPARATOR — ~2cm band fading down into mocha + spreading to the edges */}
            <div aria-hidden="true" className="relative h-[76px] w-full overflow-hidden" style={{ background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)" }}>
                {/* smoky wash: darkest in the middle-top, softening as it falls */}
                <div className="absolute inset-0" style={{ background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)" }} />
                {/* spread to the edges: left + right stay dirty-black longer, centre melts first */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)" }} />
                {/* soft blur edge where it meets the mocha, so there is no hard line */}
                <div className="absolute inset-x-0 bottom-0 h-[22px]" style={{ background: "linear-gradient(to bottom, rgba(107,74,58,0) 0%, rgba(107,74,58,0.55) 55%, #6B4A3A 100%)", filter: "blur(2px)" }} />
            </div>
            {/* TOP — header on MOCHA */}
            <div className="bg-mocha pt-12 sm:pt-16 pb-4 sm:pb-6">
                <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-0 max-w-3xl">
                        {/* TITLE — espresso, as requested */}
                        <h2 className="text-4xl font-bold tracking-tight text-espresso sm:text-5xl">Skills</h2>
                        {/* NORMAL TEXT — deep black would vanish on mocha, so warm off-white */}
                        <p className="mt-3 max-w-xl text-sm leading-7 text-cream/75">A combination of technical tools, professional capabilities and personal qualities<br />developed through my experience in<br />finance, data analytics, research and technology.</p>
                        {/* LEGEND — SEMI TITLES in GOLD */}
                        <div className="mt-14 sm:mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold uppercase tracking-[0.2em] text-gold">
                            {skillCategories.map((c, i) => (
                                <span key={c.title} className="flex items-center gap-2">
                                    {c.short}<Sparkle fill={c.sparkleFill} stroke={c.sparkleStroke} size={12} />{i < skillCategories.length - 1 && <span className="ml-3 font-normal text-cream/40">|</span>}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
            {/* BOTTOM — marquee lanes on VERY DEEP SUPER BLACK */}
            <div className="bg-[#050504]">
                {skillCategories.map((category) => (
                    <MarqueeRow key={category.title} category={category} />
                ))}
            </div>
        </section>
    );
}
