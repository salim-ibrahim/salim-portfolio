import { useEffect, useState } from "react";
import {
    Plus, Save, Trash2, ChevronUp, ChevronDown,
    Award, Image as ImageIcon, RefreshCw
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyCertification = {
    title: "New certification",
    issuer: "",
    issued_date: "",
    credential_id: "",
    description: "",
    skills: [],
    issuer_logo_media_id: null,
    certificate_media_id: null,
    is_published: false,
};

export default function CertificationsAdmin() {
    const [records, setRecords] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState("");

    async function loadData() {
        setLoading(true);
        setMessage("");

        const [certResult, mediaResult] = await Promise.all([
            supabase.from("certifications").select("*").order("sort_order"),
            supabase.from("media_assets")
                .select("id, original_name, file_name, file_path, bucket_name, mime_type")
                .order("original_name"),
        ]);

        if (certResult.error) {
            setMessage(certResult.error.message);
        } else {
            setRecords(certResult.data || []);
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

    async function addCertification() {
        setMessage("");

        const { error } = await supabase
            .from("certifications")
            .insert({
                ...emptyCertification,
                issued_date: null,
                issuer_logo_media_id: null,
                certificate_media_id: null,
                sort_order: records.length,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("New certification created as a draft.");
        await loadData();
    }

    async function saveCertification(record) {
        setSaving(record.id);
        setMessage("");

        const payload = {
            title: String(record.title || "").trim(),
            issuer: String(record.issuer || "").trim(),
            issued_date: record.issued_date || null,
            credential_id: String(record.credential_id || "").trim() || null,
            description: String(record.description || "").trim() || null,
            skills: Array.isArray(record.skills) ? record.skills : [],
            issuer_logo_media_id: record.issuer_logo_media_id || null,
            certificate_media_id: record.certificate_media_id || null,
            is_published: Boolean(record.is_published),
            sort_order: record.sort_order ?? 0,
        };

        if (!payload.title || !payload.issuer) {
            setMessage("Certification title and issuer are required.");
            setSaving(null);
            return;
        }

        const { error } = await supabase
            .from("certifications")
            .update(payload)
            .eq("id", record.id);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(`${payload.title} saved successfully.`);
            await loadData();
        }

        setSaving(null);
    }

    async function deleteCertification(record) {
        if (!window.confirm(`Delete "${record.title}"? This cannot be undone.`)) {
            return;
        }

        const { error } = await supabase
            .from("certifications")
            .delete()
            .eq("id", record.id);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Certification deleted.");
            await loadData();
        }
    }

    async function moveCertification(index, direction) {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= records.length) return;

        const current = records[index];
        const target = records[targetIndex];

        const { error: firstError } = await supabase
            .from("certifications")
            .update({ sort_order: target.sort_order })
            .eq("id", current.id);

        if (firstError) {
            setMessage(firstError.message);
            return;
        }

        const { error: secondError } = await supabase
            .from("certifications")
            .update({ sort_order: current.sort_order })
            .eq("id", target.id);

        if (secondError) {
            setMessage(secondError.message);
            return;
        }

        await loadData();
        setMessage("Certification order updated.");
    }

    function updateSkills(record, value) {
        const skills = value
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean);

        updateRecord(record.id, "skills", skills);
    }

    const imageOptions = media.filter(item =>
        item.mime_type?.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(
            item.file_name || item.original_name || ""
        )
    );

    if (loading) {
        return (
            <div className="flex items-center gap-3 p-8 text-cream/70">
                <RefreshCw className="animate-spin" size={18} />
                Loading certifications...
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Award className="text-gold" size={27} />
                        <h1 className="text-2xl font-bold text-cream">
                            Certifications Management
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-cream/60">
                        Manage certificates, issuing organisations, credentials,
                        skills and certificate images.
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
                        onClick={addCertification}
                        className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-espresso hover:opacity-90"
                    >
                        <Plus size={17} /> Add certification
                    </button>
                </div>
            </div>

            {message && (
                <div className="rounded-lg border border-cream/15 bg-white/5 px-4 py-3 text-sm text-cream/80">
                    {message}
                </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-cream/60">
                <span>{records.length} certifications</span>
                <span>·</span>
                <span>{records.filter(item => item.is_published).length} published</span>
                <span>·</span>
                <span>{records.filter(item => !item.is_published).length} drafts</span>
                <span>·</span>
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
                                {record.title || "Untitled certification"}
                            </h2>
                            <p className="mt-1 text-xs text-cream/40">
                                Record {index + 1} · {record.is_published ? "Published" : "Draft"}
                                {record.issuer ? ` · ${record.issuer}` : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => moveCertification(index, -1)}
                                disabled={index === 0}
                                title="Move up"
                                className="rounded-lg border border-cream/15 p-2 text-cream disabled:opacity-25"
                            >
                                <ChevronUp size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveCertification(index, 1)}
                                disabled={index === records.length - 1}
                                title="Move down"
                                className="rounded-lg border border-cream/15 p-2 text-cream disabled:opacity-25"
                            >
                                <ChevronDown size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteCertification(record)}
                                title="Delete certification"
                                className="rounded-lg border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10"
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm text-cream/70">
                            Certification title *
                            <input
                                value={record.title || ""}
                                onChange={e => updateRecord(record.id, "title", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Issuing organisation *
                            <input
                                value={record.issuer || ""}
                                onChange={e => updateRecord(record.id, "issuer", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Date issued
                            <input
                                type="date"
                                value={record.issued_date || ""}
                                onChange={e => updateRecord(record.id, "issued_date", e.target.value)}
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>

                        <label className="space-y-1 text-sm text-cream/70">
                            Credential ID
                            <input
                                value={record.credential_id || ""}
                                onChange={e => updateRecord(record.id, "credential_id", e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                            />
                        </label>
                    </div>

                    <label className="block space-y-1 text-sm text-cream/70">
                        Description
                        <textarea
                            rows={4}
                            value={record.description || ""}
                            onChange={e => updateRecord(record.id, "description", e.target.value)}
                            placeholder="Describe the training or certification..."
                            className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                        />
                    </label>

                    <label className="block space-y-1 text-sm text-cream/70">
                        Skills acquired
                        <textarea
                            rows={3}
                            value={(record.skills || []).join("\n")}
                            onChange={e => updateSkills(record, e.target.value)}
                            placeholder={"One skill per line"}
                            className="w-full rounded-lg border border-cream/15 bg-black/20 px-3 py-2 text-cream outline-none focus:border-gold"
                        />
                        <span className="text-xs text-cream/40">
                            Enter one skill per line.
                        </span>
                    </label>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-3 rounded-xl border border-cream/10 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-cream">
                                <ImageIcon size={17} /> Issuer logo
                            </div>

                            {assetUrl(record.issuer_logo_media_id) && (
                                <img
                                    src={assetUrl(record.issuer_logo_media_id)}
                                    alt={`${record.issuer || "Issuer"} logo`}
                                    className="h-20 w-20 rounded-lg bg-white p-2 object-contain"
                                />
                            )}

                            <select
                                value={record.issuer_logo_media_id || ""}
                                onChange={e => updateRecord(
                                    record.id,
                                    "issuer_logo_media_id",
                                    e.target.value || null
                                )}
                                className="w-full rounded-lg border border-cream/15 bg-[#211812] px-3 py-2 text-sm text-cream"
                            >
                                <option value="">No issuer logo selected</option>
                                {imageOptions.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.original_name || asset.file_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3 rounded-xl border border-cream/10 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-cream">
                                <ImageIcon size={17} /> Certificate image
                            </div>

                            {assetUrl(record.certificate_media_id) && (
                                <img
                                    src={assetUrl(record.certificate_media_id)}
                                    alt={`${record.title || "Certificate"} image`}
                                    className="h-36 w-full rounded-lg bg-black/20 object-contain"
                                />
                            )}

                            <select
                                value={record.certificate_media_id || ""}
                                onChange={e => updateRecord(
                                    record.id,
                                    "certificate_media_id",
                                    e.target.value || null
                                )}
                                className="w-full rounded-lg border border-cream/15 bg-[#211812] px-3 py-2 text-sm text-cream"
                            >
                                <option value="">No certificate image selected</option>
                                {imageOptions.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.original_name || asset.file_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-4">
                        <label className="flex items-center gap-2 text-sm text-cream/75">
                            <input
                                type="checkbox"
                                checked={Boolean(record.is_published)}
                                onChange={e => updateRecord(
                                    record.id,
                                    "is_published",
                                    e.target.checked
                                )}
                                className="accent-yellow-500"
                            />
                            Published on public website
                        </label>

                        <button
                            type="button"
                            onClick={() => saveCertification(record)}
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
                    No certifications found. Select Add certification to create one.
                </div>
            )}
        </div>
    );
}
