import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Save, RefreshCw, Image, FileText } from "lucide-react";

const emptyForm = {
    welcome_text: "Welcome to my portfolio",
    greeting: "Hello, I'm",
    name: "Salim Ibrahim",
    tagline: "Turning Data Into Decisions. Building Solutions That Matter.",
    introduction: "Combining financial knowledge, analytical thinking and technology to solve problems, uncover insights and create meaningful business value.",
    background_media_id: "",
    cv_label: "Download CV",
    cv_description: "Detailed academic and professional background",
    cv_media_id: "",
    resume_label: "Download Resume",
    resume_description: "Concise professional experience and qualifications",
    resume_media_id: "",
    is_published: false,
};

function HomeAdmin() {
    const [form, setForm] = useState(emptyForm);
    const [recordId, setRecordId] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [settingsResult, mediaResult] = await Promise.all([
                supabase.from("home_settings").select("*").order("created_at").limit(1),
                supabase.from("media_assets")
                    .select("id, original_name, file_name, file_path, bucket_name, mime_type")
                    .order("original_name"),
            ]);

            if (settingsResult.error) throw settingsResult.error;
            if (mediaResult.error) throw mediaResult.error;

            setMedia(mediaResult.data || []);

            const record = settingsResult.data?.[0];

            if (record) {
                setRecordId(record.id);
                setForm({
                    ...emptyForm,
                    ...record,
                    background_media_id: record.background_media_id || "",
                    cv_media_id: record.cv_media_id || "",
                    resume_media_id: record.resume_media_id || "",
                });
            }
        } catch (err) {
            setError(err.message || "Unable to load Home settings.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function save(publish) {
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const payload = {
                welcome_text: form.welcome_text,
                greeting: form.greeting,
                name: form.name,
                tagline: form.tagline,
                introduction: form.introduction,
                background_media_id: form.background_media_id || null,
                cv_label: form.cv_label,
                cv_description: form.cv_description,
                cv_media_id: form.cv_media_id || null,
                resume_label: form.resume_label,
                resume_description: form.resume_description,
                resume_media_id: form.resume_media_id || null,
                is_published: publish,
            };

            let result;

            if (recordId) {
                result = await supabase.from("home_settings")
                    .update(payload).eq("id", recordId).select().single();
            } else {
                result = await supabase.from("home_settings")
                    .insert(payload).select().single();
            }

            if (result.error) throw result.error;

            setRecordId(result.data.id);
            setForm((current) => ({ ...current, is_published: publish }));
            setNotice(publish ? "Home content published successfully." : "Home draft saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save Home settings.");
        } finally {
            setSaving(false);
        }
    }

    function mediaOptions(type) {
        return media.filter((item) =>
            type === "image"
                ? item.mime_type?.startsWith("image/")
                : item.mime_type?.startsWith("application/pdf")
        );
    }

    function field(label, key, options = {}) {
        const Component = options.multiline ? "textarea" : "input";

        return (
            <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <Component
                    value={form[key] ?? ""}
                    onChange={(event) => updateField(key, event.target.value)}
                    rows={options.multiline ? 4 : undefined}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
                />
            </label>
        );
    }

    function mediaField(label, key, type) {
        const options = mediaOptions(type);

        return (
            <label className="block space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    {type === "image" ? <Image size={15} /> : <FileText size={15} />}
                    {label}
                </span>
                <select
                    value={form[key] || ""}
                    onChange={(event) => updateField(key, event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                    <option value="">Use existing website file / no selection</option>
                    {options.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.original_name || item.file_name}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-slate-500">
                    {options.length} available {type === "image" ? "images" : "PDF files"} in Media Library
                </span>
            </label>
        );
    }

    if (loading) {
        return <div className="py-16 text-center text-slate-400">Loading Home settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Home Page</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage the content displayed in your portfolio introduction.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadData}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                    <RefreshCw size={15} /> Reload
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
            {notice && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{notice}</div>}

            <div className="space-y-6 rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 md:p-7">
                <section className="space-y-4">
                    <h2 className="font-semibold text-white">Introduction</h2>
                    {field("Welcome text", "welcome_text")}
                    <div className="grid gap-4 md:grid-cols-2">
                        {field("Greeting", "greeting")}
                        {field("Your name", "name")}
                    </div>
                    {field("Tagline", "tagline", { multiline: true })}
                    {field("Introduction", "introduction", { multiline: true })}
                </section>

                <div className="border-t border-white/[0.07]" />

                <section className="space-y-4">
                    <h2 className="font-semibold text-white">Background image</h2>
                    {mediaField("Background image", "background_media_id", "image")}
                </section>

                <div className="border-t border-white/[0.07]" />

                <section className="space-y-4">
                    <h2 className="font-semibold text-white">CV document</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {field("Button label", "cv_label")}
                        {field("Description", "cv_description")}
                    </div>
                    {mediaField("CV PDF", "cv_media_id", "pdf")}
                </section>

                <div className="border-t border-white/[0.07]" />

                <section className="space-y-4">
                    <h2 className="font-semibold text-white">Resume document</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {field("Button label", "resume_label")}
                        {field("Description", "resume_description")}
                    </div>
                    {mediaField("Resume PDF", "resume_media_id", "pdf")}
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                    <span className={`text-xs ${form.is_published ? "text-emerald-400" : "text-amber-400"}`}>
                        {form.is_published ? "Currently published" : "Draft / unpublished"}
                    </span>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => save(false)}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50"
                        >
                            Save draft
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => save(true)}
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                        >
                            <Save size={16} /> {saving ? "Saving..." : "Publish Home"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeAdmin;
