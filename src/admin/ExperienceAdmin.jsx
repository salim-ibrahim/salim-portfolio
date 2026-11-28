import { useEffect, useState } from "react";
import {
    Plus, Trash2, ChevronUp, ChevronDown, Save, BriefcaseBusiness,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyExperience = {
    role: "New position",
    company: "New company",
    location: "",
    employment_type: "",
    start_date: null,
    end_date: null,
    is_current: false,
    responsibilities: [],
    company_logo_media_id: null,
    is_published: false,
};

export default function ExperienceAdmin() {
    const [experiences, setExperiences] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function loadData() {
        setLoading(true);

        const [experienceResult, mediaResult] = await Promise.all([
            supabase
                .from("experiences")
                .select("*")
                .order("sort_order", { ascending: true }),
            supabase.from("media_assets")
                .select("id,original_name,file_name,file_path,bucket_name")
                .order("original_name"),
        ]);

        if (experienceResult.error) {
            setMessage(experienceResult.error.message);
        } else {
            setExperiences((experienceResult.data || []).map((item) => ({
                ...item,
                start_date: item.start_date || "",
                end_date: item.end_date || "",
                company_logo_media_id: item.company_logo_media_id || "",
                responsibilities: Array.isArray(item.responsibilities)
                    ? item.responsibilities : [],
            })));
        }

        if (mediaResult.error) {
            setMessage((current) => current || mediaResult.error.message);
        } else {
            setMedia(mediaResult.data || []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    function changeExperience(id, field, value) {
        setExperiences((current) => current.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }

    async function saveExperience(item) {
        if (!item.role.trim() || !item.company.trim()) {
            setMessage("Role and company are required.");
            return;
        }

        setBusy(true);
        setMessage("");

        const payload = {
            role: item.role.trim(),
            company: item.company.trim(),
            location: item.location?.trim() || null,
            employment_type: item.employment_type?.trim() || null,
            start_date: item.start_date?.trim() || null,
            end_date: item.is_current ? null : (item.end_date?.trim() || null),
            is_current: item.is_current,
            responsibilities: item.responsibilities
                .map((value) => String(value).trim())
                .filter(Boolean),
            company_logo_media_id: item.company_logo_media_id || null,
            is_published: item.is_published,
        };

        const { error } = await supabase
            .from("experiences")
            .update(payload)
            .eq("id", item.id);

        setBusy(false);

        if (error) {
            setMessage(`Save failed: ${error.message}`);
        } else {
            setMessage(`Saved: ${item.role}`);
            await loadData();
        }
    }



    async function addExperience() {
        if (busy) return;

        setBusy(true);
        setMessage("");

        try {
            const sortOrders = experiences
                .map((item) => Number(item.sort_order))
                .filter(Number.isFinite);

            const nextSortOrder = sortOrders.length
                ? Math.min(...sortOrders) - 1
                : 0;

            const { error } = await supabase
                .from("experiences")
                .insert({
                    role: "New position",
                    company: "New company",
                    location: null,
                    employment_type: null,
                    start_date: null,
                    end_date: null,
                    is_current: false,
                    responsibilities: [],
                    company_logo_media_id: null,
                    is_published: false,
                    sort_order: nextSortOrder,
                });

            if (error) {
                console.error("Experience insert error:", error);
                setMessage(`Unable to add experience: ${error.message}`);
                return;
            }

            await loadData();
            setMessage("New experience created at the top as a draft.");
        } catch (error) {
            console.error("Unexpected experience error:", error);
            setMessage(`Unable to add experience: ${error.message}`);
        } finally {
            setBusy(false);
        }
    }



    async function deleteExperience(item) {
        if (!window.confirm(`Delete "${item.role || "this experience"}" at ${item.company || "this company"}?`)) {
            return;
        }

        const { error } = await supabase
            .from("experiences")
            .delete()
            .eq("id", item.id);

        if (error) {
            setMessage(`Delete failed: ${error.message}`);
        } else {
            setMessage("Experience deleted.");
            await loadData();
        }
    }

    async function moveExperience(index, direction) {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= experiences.length || busy) return;

        const first = experiences[index];
        const second = experiences[targetIndex];

        setBusy(true);

        const [a, b] = await Promise.all([
            supabase.from("experiences")
                .update({ sort_order: second.sort_order })
                .eq("id", first.id),
            supabase.from("experiences")
                .update({ sort_order: first.sort_order })
                .eq("id", second.id),
        ]);

        setBusy(false);

        if (a.error || b.error) {
            setMessage(a.error?.message || b.error?.message);
        } else {
            setMessage("Experience order updated.");
            await loadData();
        }
    }

    function updateResponsibility(item, index, value) {
        const responsibilities = [...item.responsibilities];
        responsibilities[index] = value;
        changeExperience(item.id, "responsibilities", responsibilities);
    }

    function addResponsibility(item) {
        changeExperience(item.id, "responsibilities", [
            ...item.responsibilities,
            "",
        ]);
    }

    function removeResponsibility(item, index) {
        changeExperience(
            item.id,
            "responsibilities",
            item.responsibilities.filter((_, i) => i !== index)
        );
    }

    if (loading) {
        return <div className="p-8 text-cream/70">Loading experience records...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cream sm:text-3xl">
                        Experience Management
                    </h1>
                    <p className="mt-2 text-sm text-cream/60">
                        Manage work experience, placements, responsibilities and company logos.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={addExperience}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-espresso disabled:opacity-50"
                >
                    <Plus size={17} /> Add experience
                </button>
            </div>

            {message && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream/80">
                    {message}
                </div>
            )}

            {experiences.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <BriefcaseBusiness className="mx-auto mb-3 text-gold" size={32} />
                    <p className="text-cream/80">No experience records found.</p>
                    <p className="mt-1 text-sm text-cream/50">
                        Add your first experience to get started.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {experiences.map((item, index) => (
                        <article
                            key={item.id}
                            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <BriefcaseBusiness className="text-gold" size={21} />
                                    <div>
                                        <h2 className="font-semibold text-cream">
                                            {item.role || "New experience"}
                                        </h2>
                                        <p className="text-xs text-cream/50">
                                            {item.company || "Company not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_published
                                        ? "bg-emerald-500/15 text-emerald-300"
                                        : "bg-amber-500/15 text-amber-300"
                                        }`}>
                                        {item.is_published ? "Published" : "Draft"}
                                    </span>

                                    <button
                                        type="button"
                                        title="Move up"
                                        disabled={index === 0 || busy}
                                        onClick={() => moveExperience(index, -1)}
                                        className="rounded-lg border border-white/10 p-2 text-cream/70 disabled:opacity-30"
                                    >
                                        <ChevronUp size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Move down"
                                        disabled={index === experiences.length - 1 || busy}
                                        onClick={() => moveExperience(index, 1)}
                                        className="rounded-lg border border-white/10 p-2 text-cream/70 disabled:opacity-30"
                                    >
                                        <ChevronDown size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete experience"
                                        onClick={() => deleteExperience(item)}
                                        className="rounded-lg border border-red-400/20 p-2 text-red-300"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Role / Position">
                                    <input
                                        value={item.role}
                                        onChange={(e) => changeExperience(item.id, "role", e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Finance Officer"
                                    />
                                </Field>

                                <Field label="Company">
                                    <input
                                        value={item.company}
                                        onChange={(e) => changeExperience(item.id, "company", e.target.value)}
                                        className={inputClass}
                                        placeholder="Company name"
                                    />
                                </Field>

                                <Field label="Location">
                                    <input
                                        value={item.location || ""}
                                        onChange={(e) => changeExperience(item.id, "location", e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Accra, Ghana"
                                    />
                                </Field>

                                <Field label="Employment type">
                                    <select
                                        value={item.employment_type || ""}
                                        onChange={(e) => changeExperience(item.id, "employment_type", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Not specified</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="National Service">National Service</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Temporary">Temporary</option>
                                        <option value="Volunteer">Volunteer</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>

                                <Field label="Start date">
                                    <input
                                        type="date"
                                        value={item.start_date || ""}
                                        onChange={(e) => changeExperience(item.id, "start_date", e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="End date">
                                    <input
                                        type="date"
                                        value={item.end_date || ""}
                                        disabled={item.is_current}
                                        onChange={(e) => changeExperience(item.id, "end_date", e.target.value)}
                                        className={`${inputClass} disabled:opacity-40`}
                                    />
                                </Field>

                                <Field label="Company logo (Media Library)">
                                    <select
                                        value={item.company_logo_media_id || ""}
                                        onChange={(e) => changeExperience(item.id, "company_logo_media_id", e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">No logo selected</option>
                                        {media.map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.original_name || asset.file_name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <label className="flex items-center gap-3 text-sm text-cream/80">
                                <input
                                    type="checkbox"
                                    checked={item.is_current}
                                    onChange={(e) => changeExperience(item.id, "is_current", e.target.checked)}
                                    className="h-4 w-4 accent-amber-400"
                                />
                                This is my current position
                            </label>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-cream">
                                        Responsibilities and achievements
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => addResponsibility(item)}
                                        className="inline-flex items-center gap-1 text-sm font-medium text-gold"
                                    >
                                        <Plus size={15} /> Add bullet
                                    </button>
                                </div>

                                {item.responsibilities.map((responsibility, responsibilityIndex) => (
                                    <div key={responsibilityIndex} className="flex items-start gap-2">
                                        <textarea
                                            rows={2}
                                            value={responsibility}
                                            onChange={(e) => updateResponsibility(item, responsibilityIndex, e.target.value)}
                                            className={`${inputClass} resize-y`}
                                            placeholder="Describe a responsibility or achievement..."
                                        />
                                        <button
                                            type="button"
                                            title="Remove responsibility"
                                            onClick={() => removeResponsibility(item, responsibilityIndex)}
                                            className="mt-2 rounded-lg p-2 text-red-300 hover:bg-red-400/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                {item.responsibilities.length === 0 && (
                                    <p className="text-sm text-cream/40">
                                        No responsibilities added yet.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                <label className="flex items-center gap-2 text-sm text-cream/80">
                                    <input
                                        type="checkbox"
                                        checked={item.is_published}
                                        onChange={(e) => changeExperience(item.id, "is_published", e.target.checked)}
                                        className="h-4 w-4 accent-amber-400"
                                    />
                                    Published on public website
                                </label>

                                <button
                                    type="button"
                                    onClick={() => saveExperience(item)}
                                    disabled={busy}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-espresso disabled:opacity-50"
                                >
                                    <Save size={16} /> Save changes
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-[#171310] px-3 py-2.5 text-sm text-cream outline-none focus:border-gold/60";

function Field({ label, children }) {
    return (
        <label className="block space-y-2">
            <span className="text-xs font-medium text-cream/60">{label}</span>
            {children}
        </label>
    );
}



