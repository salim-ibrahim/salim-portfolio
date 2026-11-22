import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

const initialForm = {
    heading: "Where Finance Meets Data, Economics and Technology.",
    paragraphs: [
        "I'm a Finance and Data Analytics professional with a BSc in Agricultural Economics from the University of Ghana. My background covers financial operations, transaction reconciliation, data analysis and research, and I'm particularly interested in how technology can make everyday business processes better.",
        "At BRAC Ghana Savings and Loans, I worked with the Finance and Accounts team, where I handled transaction reconciliations, financial entries, documentation and fixed asset records across multiple branches. The experience gave me a practical understanding of financial operations and the importance of accuracy, organisation and good reporting.",
        "Outside my finance work, I enjoy exploring data, finding patterns and turning information into useful insights. I also enjoy building things with code, which led me to develop ReconPro, a web application that simplifies financial reconciliation. I'm interested in bringing finance, data and technology together to solve practical problems.",
    ],
    stats: [
        { target: 7, suffix: "+", label: "Analytics projects" },
        { target: 2, suffix: "+", label: "Deployed digital projects" },
        { target: 10, suffix: "+", label: "Tools & technologies" },
    ],
    focus_areas: [
        { icon: "Landmark", title: "Finance & Accounting", description: "Financial operations, reconciliations, transaction processing and reporting." },
        { icon: "ChartNoAxesCombined", title: "Data Analytics", description: "Data analysis, visualisation, business intelligence and evidence based decisions." },
        { icon: "GraduationCap", title: "Economics & Research", description: "Econometrics, economic analysis, research and quantitative methods." },
        { icon: "Code", title: "Software Development", description: "Building practical applications and technology driven solutions." },
    ],
    is_published: false,
};

function AboutAdmin() {
    const [form, setForm] = useState(initialForm);
    const [recordId, setRecordId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const { data, error: queryError } = await supabase
                .from("about_settings")
                .select("*")
                .order("created_at")
                .limit(1);

            if (queryError) throw queryError;

            if (data?.[0]) {
                const record = data[0];
                setRecordId(record.id);
                setForm({
                    ...initialForm,
                    ...record,
                    paragraphs: record.paragraphs || [],
                    stats: record.stats || [],
                    focus_areas: record.focus_areas || [],
                });
            }
        } catch (err) {
            setError(err.message || "Unable to load About settings.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateArrayItem(field, index, key, value) {
        setForm((current) => ({
            ...current,
            [field]: current[field].map((item, i) =>
                i === index ? (typeof item === "object" ? { ...item, [key]: value } : value) : item
            ),
        }));
    }

    function addParagraph() {
        update("paragraphs", [...form.paragraphs, ""]);
    }

    function addStat() {
        update("stats", [...form.stats, { target: 0, suffix: "+", label: "" }]);
    }

    function addFocusArea() {
        update("focus_areas", [
            ...form.focus_areas,
            { icon: "Star", title: "", description: "" },
        ]);
    }

    function removeItem(field, index) {
        update(field, form[field].filter((_, i) => i !== index));
    }

    async function save(publish) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const payload = {
                heading: form.heading,
                paragraphs: form.paragraphs,
                stats: form.stats.map((item) => ({
                    target: Number(item.target) || 0,
                    suffix: item.suffix || "",
                    label: item.label || "",
                })),
                focus_areas: form.focus_areas,
                is_published: publish,
            };

            const result = recordId
                ? await supabase.from("about_settings").update(payload).eq("id", recordId).select().single()
                : await supabase.from("about_settings").insert(payload).select().single();

            if (result.error) throw result.error;

            setRecordId(result.data.id);
            setForm((current) => ({ ...current, is_published: publish }));
            setNotice(publish ? "About content published successfully." : "About draft saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save About settings.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="py-16 text-center text-slate-400">Loading About settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">About Page</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your biography, highlights and professional focus areas.
                    </p>
                </div>
                <button type="button" onClick={loadData} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                    <RefreshCw size={15} /> Reload
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
            {notice && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div>}

            <div className="space-y-7 rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 md:p-7">
                <section className="space-y-3">
                    <h2 className="font-semibold text-white">Section heading</h2>
                    <input value={form.heading || ""} onChange={(e) => update("heading", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500" />
                </section>

                <section className="space-y-4 border-t border-white/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-white">Biography paragraphs</h2>
                        <button type="button" onClick={addParagraph} className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-300"><Plus size={14} /> Add paragraph</button>
                    </div>
                    {form.paragraphs.map((paragraph, index) => (
                        <div key={index} className="flex gap-3">
                            <textarea rows={4} value={paragraph} onChange={(e) => updateArrayItem("paragraphs", index, null, e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500" />
                            <button type="button" onClick={() => removeItem("paragraphs", index)} className="self-start rounded-lg p-2 text-red-400 hover:bg-red-500/10" title="Remove paragraph"><Trash2 size={17} /></button>
                        </div>
                    ))}
                </section>

                <section className="space-y-4 border-t border-white/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-white">Statistics</h2>
                        <button type="button" onClick={addStat} className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-300"><Plus size={14} /> Add statistic</button>
                    </div>
                    {form.stats.map((stat, index) => (
                        <div key={index} className="grid gap-3 rounded-xl border border-white/[0.07] bg-[#0b0f18] p-4 md:grid-cols-[1fr_1fr_2fr_auto]">
                            <label className="space-y-2 text-xs text-slate-400">Target
                                <input type="number" value={stat.target ?? 0} onChange={(e) => updateArrayItem("stats", index, "target", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                            </label>
                            <label className="space-y-2 text-xs text-slate-400">Suffix
                                <input value={stat.suffix || ""} onChange={(e) => updateArrayItem("stats", index, "suffix", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                            </label>
                            <label className="space-y-2 text-xs text-slate-400">Label
                                <input value={stat.label || ""} onChange={(e) => updateArrayItem("stats", index, "label", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                            </label>
                            <button type="button" onClick={() => removeItem("stats", index)} className="self-end rounded-lg p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={17} /></button>
                        </div>
                    ))}
                </section>

                <section className="space-y-4 border-t border-white/[0.07] pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-white">Professional focus areas</h2>
                        <button type="button" onClick={addFocusArea} className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-300"><Plus size={14} /> Add focus area</button>
                    </div>
                    {form.focus_areas.map((area, index) => (
                        <div key={index} className="space-y-3 rounded-xl border border-white/[0.07] bg-[#0b0f18] p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="space-y-2 text-xs text-slate-400">Icon name (Lucide)
                                    <input value={area.icon || ""} onChange={(e) => updateArrayItem("focus_areas", index, "icon", e.target.value)} placeholder="e.g. Landmark, Code, ChartNoAxesCombined" className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                                </label>
                                <label className="space-y-2 text-xs text-slate-400">Title
                                    <input value={area.title || ""} onChange={(e) => updateArrayItem("focus_areas", index, "title", e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <textarea rows={2} value={area.description || ""} onChange={(e) => updateArrayItem("focus_areas", index, "description", e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#11151f] px-3 py-2 text-sm text-white" />
                                <button type="button" onClick={() => removeItem("focus_areas", index)} className="self-start rounded-lg p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={17} /></button>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-slate-500">Use valid Lucide icon names. The public page will map these names to icons.</p>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                    <span className={`text-xs ${form.is_published ? "text-emerald-400" : "text-amber-400"}`}>
                        {form.is_published ? "Currently published" : "Draft / unpublished"}
                    </span>
                    <div className="flex gap-3">
                        <button type="button" disabled={saving} onClick={() => save(false)} className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">Save draft</button>
                        <button type="button" disabled={saving} onClick={() => save(true)} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"><Save size={16} /> {saving ? "Saving..." : "Publish About"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutAdmin;
