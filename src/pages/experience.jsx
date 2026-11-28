import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ListChecks, BriefcaseBusiness } from "lucide-react";
import { experienceData } from "../data/experience";
import { supabase } from "../lib/supabase";

function formatExperienceDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

const defaultExperiences = experienceData.map((experience) => ({
    ...experience,
    highlights: experience.responsibilities,
}));

export default function Experience() {
    const [experiences, setExperiences] = useState(defaultExperiences);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        let active = true;

        async function loadPublishedExperiences() {

            const { data, error } = await supabase
                .from("experiences")
                .select("id, role, company, location, employment_type, start_date, end_date, is_current, responsibilities, sort_order")
                .eq("is_published", true)
                .order("sort_order", { ascending: true });


            if (error || !data?.length || !active) return;

            const mapped = data.map((item) => {
                const start = formatExperienceDate(item.start_date);
                const end = item.is_current
                    ? "Present"
                    : formatExperienceDate(item.end_date);

                return {
                    ...item,
                    period: `${start || "Date not specified"} - ${end || "Date not specified"}`,
                    highlights: Array.isArray(item.responsibilities)
                        ? item.responsibilities
                        : [],
                };
            });

            if (active) {
                setExperiences(mapped);
                setOpenIndex(null);
            }
        }

        loadPublishedExperiences();

        return () => {
            active = false;
        };
    }, []);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
    return (
        <section id="experience" className="relative overflow-hidden bg-mocha">
            {/* DIRTY-BLACK SEPARATOR — v1, same as Skills: ~2cm band fading down into mocha + spreading to the edges */}
            <div aria-hidden="true" className="relative h-[76px] w-full overflow-hidden" style={{ background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 h-[22px]" style={{ background: "linear-gradient(to bottom, rgba(107,74,58,0) 0%, rgba(107,74,58,0.55) 55%, #6B4A3A 100%)", filter: "blur(2px)" }} />
            </div>
            <div className="container mx-auto max-w-7xl px-6 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:px-10">
                {/* OLD HEADER BACK */}
                <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16 max-w-3xl">
                    <h2 className="text-3xl font-bold tracking-tight text-espresso sm:text-5xl">Experience</h2>
                    <p className="mt-6 text-base leading-8 text-cream/75">My professional journey has given me practical experience in financial operations, data collection, transaction reconciliation and team supervision.</p>
                </motion.div>
                {/* TIMELINE - old briefcase markers back, no dotted style */}
                <div className="relative">
                    <div className="absolute bottom-8 left-5 top-8 hidden w-px bg-gradient-to-b from-gold/60 via-[#A678B9]/30 to-transparent sm:block" />
                    <div className="space-y-10">
                        {experiences.map((e, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <motion.div key={e.id || e.role} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative sm:pl-16">
                                    <div className="absolute left-0 top-8 hidden h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-mocha text-gold sm:flex"><BriefcaseBusiness size={18} /></div>
                                    <button type="button" onClick={() => toggle(i)} aria-expanded={isOpen} className="w-full text-left">
                                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                {/* POSITION BEFORE COMPANY */}
                                                <h3 className="text-xl font-bold leading-snug text-gold sm:text-2xl">{e.role}</h3>
                                                <p className="mt-1 text-sm font-medium text-cream/85">{e.company}</p>
                                            </div>
                                            <div className="shrink-0 text-right text-sm leading-6 text-cream/60">
                                                <p>{e.location}</p>
                                                <p>{e.period}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#A678B9]"><ListChecks size={16} />{isOpen ? "Hide responsibilities" : "See responsibilities"}<ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} /></div>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 220, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                                                <div className="relative mt-4 h-[220px] overflow-y-auto rounded-2xl px-4 pr-2 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]" style={{ background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)" }}>
                                                    {/* same v1 wash, inside the dropdown only */}
                                                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)" }} />
                                                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)" }} />
                                                    <ul className="relative space-y-3 py-3">
                                                        {e.highlights.map((h, idx) => (
                                                            <li key={idx} className="flex gap-3 text-sm leading-7 text-cream/70"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /><span>{h}</span></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

