
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { educationData } from "../data/education";

// Shared entrance animations for both columns.
const leftVariant = {
    hidden: { opacity: 0, x: "-100vw" },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const rightVariant = {
    hidden: { opacity: 0, x: "100vw" },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function Education() {
    const [education, setEducation] = useState(educationData);

    useEffect(() => {
        let active = true;

        async function loadEducation() {
            const { data, error } = await supabase
                .from("education")
                .select(`
                    id,
                    institution,
                    qualification,
                    result,
                    location,
                    major,
                    image_caption,
                    image_location,
                    logo_alt,
                    image_alt,
                    institution_logo_media_id,
                    institution_image_media_id,
                    is_published,
                    sort_order
                `)
                .eq("is_published", true)
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("Could not load education records:", error);
                return;
            }

            if (!active) return;

            if (!data || data.length === 0) {
                setEducation([]);
                return;
            }

            const mediaIds = [
                ...new Set(
                    data.flatMap(item => [
                        item.institution_logo_media_id,
                        item.institution_image_media_id,
                    ]).filter(Boolean)
                ),
            ];

            let mediaById = {};

            if (mediaIds.length > 0) {
                const { data: media, error: mediaError } = await supabase
                    .from("media_assets")
                    .select("id, file_path, bucket_name")
                    .in("id", mediaIds);

                if (mediaError) {
                    console.error("Could not load education media:", mediaError);
                } else {
                    (media || []).forEach(asset => {
                        mediaById[asset.id] = supabase.storage
                            .from(asset.bucket_name || "portfolio-media")
                            .getPublicUrl(asset.file_path).data.publicUrl;
                    });
                }
            }

            if (!active) return;

            const records = data.map(item => {
                const fallback = educationData.find(
                    entry => entry.institution === item.institution
                );

                return {
                    id: item.id,
                    institution: item.institution,
                    qualification: item.qualification || "",
                    result: item.result || "",
                    location: item.location || "",
                    major: Array.isArray(item.major) ? item.major : [],
                    imageCaption: item.image_caption || item.institution,
                    imageLocation: item.image_location || "",
                    logoAlt: item.logo_alt || fallback?.logoAlt || item.institution,
                    imageAlt: item.image_alt || fallback?.imageAlt || item.institution,
                    logo: mediaById[item.institution_logo_media_id] || fallback?.logo || "",
                    image: mediaById[item.institution_image_media_id] || fallback?.image || "",
                };
            });

            setEducation(records);
        }

        loadEducation();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section id="education" className="relative overflow-hidden bg-mocha">

            {/* Section separator */}
            <div
                aria-hidden="true"
                className="relative h-[76px] w-full overflow-hidden"
                style={{
                    background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)",
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)",
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)",
                    }}
                />
                <div
                    className="absolute inset-x-0 bottom-0 h-[22px]"
                    style={{
                        background: "linear-gradient(to bottom, rgba(107,74,58,0) 0%, rgba(107,74,58,0.55) 55%, #6B4A3A 100%)",
                        filter: "blur(2px)",
                    }}
                />
            </div>

            <div className="container mx-auto max-w-7xl px-6 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:px-10">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h2 className="text-4xl font-bold tracking-tight text-espresso sm:text-5xl">
                        Education
                    </h2>
                </motion.div>

                {/* Education records */}
                <motion.div
                    key={education.map(item => item.id).join("-")}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="space-y-10"
                >
                    {education.map((item, index) => {
                        const isReversed = index % 2 === 1;

                        return (
                            <div
                                key={item.id}
                                className="grid items-center gap-8 lg:grid-cols-2"
                            >

                                {/* Institution details */}
                                <motion.div
                                    variants={isReversed ? rightVariant : leftVariant}
                                    className={`flex items-start gap-4 ${isReversed ? "order-2" : "order-1"
                                        }`}
                                >
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cream/15 bg-white p-1.5">
                                        <img
                                            src={item.logo}
                                            alt={item.logoAlt}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold leading-snug text-gold sm:text-2xl">
                                            {item.institution}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-cream/70">
                                            {item.qualification}
                                            <span className="mx-1 text-cream/30">|</span>
                                            {item.result}
                                        </p>

                                        <p className="mt-1 text-sm text-cream/70">
                                            {item.location}
                                        </p>

                                        <p className="mt-3 text-sm leading-6 text-cream/60">
                                            <span className="font-semibold text-cream/85">
                                                Major:
                                            </span>{" "}
                                            {item.major.join(", ")}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Interactive 3D institution card */}
                                <motion.div
                                    variants={isReversed ? leftVariant : rightVariant}
                                    className={`w-2/3 justify-self-center ${isReversed
                                            ? "order-1 lg:justify-self-start"
                                            : "order-2 lg:justify-self-end"
                                        }`}
                                    style={{ perspective: 1200 }}
                                >
                                    <motion.div
                                        initial={false}
                                        whileHover={{
                                            y: -10,
                                            rotateX: 8,
                                            rotateY: isReversed ? 8 : -8,
                                            scale: 1.035,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 180,
                                            damping: 18,
                                            mass: 0.7,
                                        }}
                                        className="group relative overflow-hidden rounded-2xl border border-cream/15 bg-espresso/30 shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-colors duration-500 hover:border-gold/60 hover:shadow-[0_28px_60px_rgba(0,0,0,0.55)]"
                                        style={{
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        {/* Floating image */}
                                        <motion.div
                                            initial={false}
                                            whileHover={{
                                                z: 45,
                                                rotateX: 12,
                                                rotateZ: isReversed ? 3 : -3,
                                                scale: 1.04,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 160,
                                                damping: 16,
                                            }}
                                            className="relative overflow-hidden"
                                            style={{
                                                transformStyle: "preserve-3d",
                                            }}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.imageAlt}
                                                className="aspect-[16/10] w-full rounded-xl object-cover shadow-xl transition-[filter] duration-500 group-hover:brightness-110"
                                            />
                                        </motion.div>

                                        {/* Image caption */}
                                        <motion.p
                                            initial={false}
                                            whileHover={{ z: 25 }}
                                            className="relative px-4 py-3 text-sm font-semibold text-cream/85"
                                            style={{
                                                transform: "translateZ(15px)",
                                            }}
                                        >
                                            {item.imageCaption}{" "}
                                            <span className="font-normal text-cream/60">
                                                {item.imageLocation}
                                            </span>
                                        </motion.p>
                                    </motion.div>
                                </motion.div>

                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
