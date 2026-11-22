import { useEffect, useState } from "react";
import {
    Plus, Save, Trash2, ChevronUp, ChevronDown,
    GraduationCap, Image as ImageIcon, RefreshCw
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyEducation = {
    institution: "New institution",
    qualification: "",
    result: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    major: [],
    image_caption: "",
    image_location: "",
    logo_alt: "",
    image_alt: "",
    institution_logo_media_id: null,
    institution_image_media_id: null,
    is_published: false,
};

export default function EducationAdmin() {
    const [records, setRecords] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState("");

    async function loadData() {
        setLoading(true);
        setMessage("");

        const [educationResult, mediaResult] = await Promise.all([
            supabase.from("education").select("*").order("sort_order"),
            supabase.from("media_assets")
                .select("id, original_name, file_name, file_path, bucket_name, mime_type")
                .order("original_name"),
        ]);

        if (educationResult.error) {
            setMessage(educationResult.error.message);
        } else {
            setRecords(educationResult.data || []);
        }

        if (mediaResult.error) {
            setMessage(mediaResult.error.message);
        } else {
            setMedia(mediaResult.data || []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    function updateRecord(id, field, value) {
        setRecords(current => current.map(record =>
            record.id === id ? { ...record, [field]: value } : record
        ));
    }

    function assetUrl(id) {
        const asset = media.find(item => item.id === id);
        if (!asset?.file_path) return "";

        return supabase.storage
            .from(asset.bucket_name || "portfolio-media")
            .getPublicUrl(asset.file_path).data.publicUrl;
    }

    async function addEducation() {
        setMessage("");

        const { error } = await supabase
            .from("education")
            .insert({
                ...emptyEducation,
                start_date: null,
                end_date: null,
                institution_logo_media_id: null,
                institution_image_media_id: null,
                sort_order: records.length,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("New education record created as a draft.");
        await loadData();
    }

    async function saveEducation(record) {
        setSaving(record.id);
        setMessage("");

        const payload = {
            institution: String(record.institution || "").trim(),
            qualification: record.qualification || null,
            result: record.result || null,
            location: record.location || null,
            start_date: record.start_date || null,
            end_date: record.is_current ? null : (record.end_date || null),
            is_current: Boolean(record.is_current),
            major: Array.isArray(record.major) ? record.major : [],
            image_caption: record.image_caption || null,
            image_location: record.image_location || null,
            logo_alt: record.logo_alt || null,
            image_alt: record.image_alt || null,
            institution_logo_media_id: record.institution_logo_media_id || null,
            institution_image_media_id: record.institution_image_media_id || null,
            is_published: Boolean(record.is_published),
            sort_order: record.sort_order ?? 0,
        };

        if (!payload.institution) {
            setMessage("Institution name is required.");
            setSaving(null);
            return;
        }

        const { error } = await supabase
            .from("education")
            .update(payload)
            .eq("id", record.id);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(`${payload.institution} saved successfully.`);
            await loadData();
        }

        setSaving(null);
    }

    async function deleteEducation(record) {
        if (!window.confirm(`Delete ${record.institution}? This cannot be undone.`)) {
            return;
        }

        const { error } = await supabase
            .from("education")
            .delete()
            .eq("id", record.id);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Education record deleted.");
            await loadData();
        }
    }

    async function moveEducation(index, direction) {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= records.length) return;

        const current = records[index];
        const target = records[targetIndex];

        const { error: firstError } = await supabase
            .from("education")
            .update({ sort_order: target.sort_order })
            .eq("id", current.id);

        if (firstError) {
            setMessage(firstError.message);
            return;
        }

        const { error: secondError } = await supabase
            .from("education")
            .update({ sort_order: current.sort_order })
            .eq("id", target.id);

        if (secondError) {
            setMessage(secondError.message);
            return;
        }

        await loadData();
        setMessage("Education order updated.");
    }

    function updateMajor(record, value) {
        const major = value
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean);

        updateRecord(record.id, "major", major);
    }

    const imageOptions = media.filter(item =>
        item.mime_type?.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(item.file_name || item.original_name || "")
    );

    if (loading) {
        return (
            <div className="flex items-center gap-3 p-8 text-cream/70">
                <RefreshCw className="animate-spin" size={18} />
                Loading education records...
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="text-gold" size={27} />
                        <h1 className="text-2xl font-bold text-cream">Education Management</h1>
                    </div>
                    <p className="mt-2 text-sm text-cream/60">
                        Manage institutions, qualifications, majors, logos and campus images.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 rounded-lg border border-cream/15 px-4 py-2 text-sm text-cream hover:bg-white/5"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button
                        onClick={addEducation}
                        className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-espresso hover:opacity-90"
                    >
                        <Plus size={17} /> Add institution
                    </button>
                </div>
            </div>

            {message && (
                <div className="rounded-lg border border-cream/15 bg-white/5 px-4 py-3 text-sm text-cream/80">
                    {message}
                </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-cream/60">
                <span>{records.length} institutions</span>
                <span>â€¢</span>
                <span>{records.filter(item => item.is_published).length} published</span>
                <span>â€¢</span>
                <span>{imageOptions.length} image assets available</span>
            </div>

            {records.map((record, index) => (
                <section
                    key={record.id}
                    className="space-y-5 rounded-2xl border border-cream/10 bg-espresso/40 p-5 sm:p-6"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gold">
                                {record.institution || "Untitled institution"}
                            </h2>
                            <p className="mt-1 text-xs text-cream/40">
                                Record {index + 1} Â· {record.is_published ? "Published" : "Draft"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => moveEducation(index, -1)}
                                disabled={index === 0}
                                title="Move up"
                                className="rounded-lg border border-cream/15 p-2 text-cream disabled:opacity-25"
                            >
                                <ChevronUp size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveEducation(index, 1)}
                                disabled={index === records.length - 1}
                                title="Move down"
                                className="rounded-lg border border-cream/15 p-2 text-cream disabled:opacity-25"
                            >
                                <ChevronDown size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteEducation(record)}
                                title="Delete institution"
                                className="rounded-lg border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10"
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm text-cream/70">
                            Institution name *
                            <input
                                value={record.institution || ""}
                                onChange={e => updateRecord(record.id, "institution", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Qualification
                            <input
                                value={record.qualification || ""}
                                onChange={e => updateRecord(record.id, "qualification", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Result / classification
                            <input
                                value={record.result || ""}
                                onChange={e => updateRecord(record.id, "result", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Location
                            <input
                                value={record.location || ""}
                                onChange={e => updateRecord(record.id, "location", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Start date
                            <input
                                type="date"
                                value={record.start_date || ""}
                                onChange={e => updateRecord(record.id, "start_date", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            End date
                            <input
                                type="date"
                                value={record.end_date || ""}
                                disabled={record.is_current}
                                onChange={e => updateRecord(record.id, "end_date", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none disabled:opacity-40"
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-cream/75">
                        <input
                            type="checkbox"
                            checked={Boolean(record.is_current)}
                            onChange={e => updateRecord(record.id, "is_current", e.target.checked)}
                            className="accent-yellow-500"
                        />
                        Currently studying here
                    </label>

                    <label className="block space-y-1 text-sm text-cream/70">
                        Majors / subjects
                        <textarea
                            rows={4}
                            value={(record.major || []).join("\n")}
                            onChange={e => updateMajor(record, e.target.value)}
                            placeholder={"One major or subject per line"}
                            className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                        />
                        <span className="text-xs text-cream/40">
                            Enter one major or subject per line.
                        </span>
                    </label>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-3 rounded-xl border border-cream/10 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-cream">
                                <ImageIcon size={17} /> Institution logo
                            </div>

                            {assetUrl(record.institution_logo_media_id) && (
                                <img
                                    src={assetUrl(record.institution_logo_media_id)}
                                    alt={record.logo_alt || ""}
                                    className="h-20 w-20 rounded-lg bg-white p-2 object-contain"
                                />
                            )}

                            <select
                                value={record.institution_logo_media_id || ""}
                                onChange={e => updateRecord(record.id, "institution_logo_media_id", e.target.value || null)}
                                className="w-full rounded-lg border border-cream/15 bg-[#211812] px-3 py-2 text-sm text-cream"
                            >
                                <option value="">No logo selected</option>
                                {imageOptions.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.original_name || asset.file_name}
                                    </option>
                                ))}
                            </select>

                            <label className="block space-y-1 text-sm text-cream/70">
                                Logo alternative text
                                <input
                                    value={record.logo_alt || ""}
                                    onChange={e => updateRecord(record.id, "logo_alt", e.target.value)}
                                    className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream"
                                />
                            </label>
                        </div>

                        <div className="space-y-3 rounded-xl border border-cream/10 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-cream">
                                <ImageIcon size={17} /> Institution / campus image
                            </div>

                            {assetUrl(record.institution_image_media_id) && (
                                <img
                                    src={assetUrl(record.institution_image_media_id)}
                                    alt={record.image_alt || ""}
                                    className="h-28 w-full rounded-lg object-cover"
                                />
                            )}

                            <select
                                value={record.institution_image_media_id || ""}
                                onChange={e => updateRecord(record.id, "institution_image_media_id", e.target.value || null)}
                                className="w-full rounded-lg border border-cream/15 bg-[#211812] px-3 py-2 text-sm text-cream"
                            >
                                <option value="">No campus image selected</option>
                                {imageOptions.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.original_name || asset.file_name}
                                    </option>
                                ))}
                            </select>

                            <label className="block space-y-1 text-sm text-cream/70">
                                Image alternative text
                                <input
                                    value={record.image_alt || ""}
                                    onChange={e => updateRecord(record.id, "image_alt", e.target.value)}
                                    className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream"
                                />
                            </label>

                            <label className="block space-y-1 text-sm text-cream/70">
                                Image caption
                                <input
                                    value={record.image_caption || ""}
                                    onChange={e => updateRecord(record.id, "image_caption", e.target.value)}
                                    className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream"
                                />
                            </label>

                            <label className="block space-y-1 text-sm text-cream/70">
                                Image location caption
                                <input
                                    value={record.image_location || ""}
                                    onChange={e => updateRecord(record.id, "image_location", e.target.value)}
                                    className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-4">
                        <label className="flex items-center gap-2 text-sm text-cream/75">
                            <input
                                type="checkbox"
                                checked={Boolean(record.is_published)}
                                onChange={e => updateRecord(record.id, "is_published", e.target.checked)}
                                className="accent-yellow-500"
                            />
                            Published on public website
                        </label>

                        <button
                            type="button"
                            onClick={() => saveEducation(record)}
                            disabled={saving === record.id}
                            className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-espresso hover:opacity-90 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving === record.id ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </section>
            ))}

            {records.length === 0 && (
                <div className="rounded-xl border border-dashed border-cream/20 p-10 text-center text-cream/60">
                    No education records found. Select Add institution to create one.
                </div>
            )}
        </div>
    );
}
