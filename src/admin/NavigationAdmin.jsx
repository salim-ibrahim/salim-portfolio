import { useEffect, useState } from "react";
import {
    Save, RefreshCw, Plus, Trash2, ChevronUp, ChevronDown,
    Eye, EyeOff, Image as ImageIcon, ExternalLink
} from "lucide-react";
import { supabase } from "../lib/supabase";

const DEFAULT_LINKS = [
    { name: "Home", href: "#home", is_visible: true, sort_order: 1 },
    { name: "About", href: "#about", is_visible: true, sort_order: 2 },
    { name: "Skills", href: "#skills", is_visible: true, sort_order: 3 },
    { name: "Experience", href: "#experience", is_visible: true, sort_order: 4 },
    { name: "Projects", href: "#projects", is_visible: true, sort_order: 5 },
    { name: "Education", href: "#education", is_visible: true, sort_order: 6 },
    { name: "Certifications", href: "#certifications", is_visible: true, sort_order: 7 },
    { name: "Contact", href: "#contact", is_visible: true, sort_order: 8 },
];

export default function NavigationAdmin() {
    const [recordId, setRecordId] = useState(null);
    const [links, setLinks] = useState(DEFAULT_LINKS);
    const [cta, setCta] = useState({
        label: "Let's Talk",
        href: "#contact",
        is_visible: true,
    });
    const [logoMediaId, setLogoMediaId] = useState("");
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");
        setNotice("");

        try {
            const [sectionResult, mediaResult] = await Promise.all([
                supabase
                    .from("portfolio_sections")
                    .select("id, content")
                    .eq("section_key", "navigation")
                    .maybeSingle(),
                supabase
                    .from("media_assets")
                    .select("id, file_name, original_name, file_path, bucket_name")
                    .order("uploaded_at", { ascending: false }),
            ]);

            if (sectionResult.error) throw sectionResult.error;
            if (mediaResult.error) throw mediaResult.error;
            if (!sectionResult.data) {
                throw new Error("The navigation record was not found in Supabase.");
            }

            const content = sectionResult.data.content || {};
            setRecordId(sectionResult.data.id);
            setLinks(
                Array.isArray(content.links)
                    ? [...content.links].sort(
                        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
                    )
                    : DEFAULT_LINKS
            );
            setCta({
                label: content.cta?.label || "Let's Talk",
                href: content.cta?.href || "#contact",
                is_visible: content.cta?.is_visible !== false,
            });
            setLogoMediaId(content.logo_media_id || "");
            setMedia(mediaResult.data || []);
        } catch (err) {
            setError(err.message || "Could not load navigation settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateLink = (index, field, value) => {
        setLinks(current =>
            current.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            )
        );
    };

    const addLink = () => {
        setLinks(current => [
            ...current,
            {
                name: "New Link",
                href: "#home",
                is_visible: true,
                sort_order: current.length + 1,
            },
        ]);
    };

    const deleteLink = (index) => {
        setLinks(current =>
            current
                .filter((_, i) => i !== index)
                .map((link, i) => ({ ...link, sort_order: i + 1 }))
        );
    };

    const moveLink = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= links.length) return;

        setLinks(current => {
            const updated = [...current];
            [updated[index], updated[target]] = [updated[target], updated[index]];
            return updated.map((link, i) => ({
                ...link,
                sort_order: i + 1,
            }));
        });
    };

    const saveSettings = async () => {
        if (!recordId) return;

        if (links.some(link => !link.name.trim() || !link.href.trim())) {
            setError("Every navigation link needs a name and destination.");
            return;
        }

        if (cta.is_visible && (!cta.label.trim() || !cta.href.trim())) {
            setError("The call-to-action needs a label and destination.");
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");

        const content = {
            logo_media_id: logoMediaId || null,
            links: links.map((link, index) => ({
                name: link.name.trim(),
                href: link.href.trim(),
                is_visible: link.is_visible !== false,
                sort_order: index + 1,
            })),
            cta: {
                label: cta.label.trim(),
                href: cta.href.trim(),
                is_visible: cta.is_visible !== false,
            },
        };

        try {
            const { error: saveError } = await supabase
                .from("portfolio_sections")
                .update({
                    content,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", recordId);

            if (saveError) throw saveError;
            setNotice("Navigation settings saved successfully.");
        } catch (err) {
            setError(err.message || "Could not save navigation settings.");
        } finally {
            setSaving(false);
        }
    };

    const getMediaUrl = (asset) => {
        if (!asset?.file_path) return "";
        const { data } = supabase.storage
            .from(asset.bucket_name || "portfolio-media")
            .getPublicUrl(asset.file_path);
        return data?.publicUrl || "";
    };

    const selectedLogo = media.find(item => item.id === logoMediaId);

    if (loading) {
        return (
            <div className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-8 text-center text-slate-400">
                Loading navigation settings...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Navigation Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your website menu, logo and call-to-action button.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {notice && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {notice}
                </div>
            )}

            {/* LOGO */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <ImageIcon className="text-violet-400" size={20} />
                    <div>
                        <h2 className="font-semibold text-white">Navbar Logo</h2>
                        <p className="text-xs text-slate-400">
                            Choose a logo from your Media Library.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Select logo
                        </label>
                        <select
                            value={logoMediaId}
                            onChange={e => setLogoMediaId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0b0f18] p-3 text-sm text-white outline-none focus:border-violet-500"
                        >
                            <option value="">Use existing default logo</option>
                            {media.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.original_name || asset.file_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex min-h-24 items-center justify-center rounded-xl border border-white/10 bg-[#0b0f18] p-4">
                        {selectedLogo ? (
                            <img
                                src={getMediaUrl(selectedLogo)}
                                alt="Selected navbar logo"
                                className="max-h-16 max-w-full object-contain"
                            />
                        ) : (
                            <p className="text-xs text-slate-500">
                                Current default logo will be used.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* NAVIGATION LINKS */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-white">Navigation Links</h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Edit labels, destinations, visibility and order.
                        </p>
                    </div>
                    <button
                        onClick={addLink}
                        className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 hover:bg-violet-500/20"
                    >
                        <Plus size={16} /> Add Link
                    </button>
                </div>

                <div className="space-y-3">
                    {links.map((link, index) => (
                        <div
                            key={`${index}-${link.name}`}
                            className="rounded-xl border border-white/[0.07] bg-[#0b0f18] p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">
                                    LINK {index + 1}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveLink(index, -1)}
                                        disabled={index === 0}
                                        title="Move up"
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 disabled:opacity-25"
                                    >
                                        <ChevronUp size={17} />
                                    </button>
                                    <button
                                        onClick={() => moveLink(index, 1)}
                                        disabled={index === links.length - 1}
                                        title="Move down"
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 disabled:opacity-25"
                                    >
                                        <ChevronDown size={17} />
                                    </button>
                                    <button
                                        onClick={() => updateLink(index, "is_visible", !link.is_visible)}
                                        title={link.is_visible ? "Hide link" : "Show link"}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                                    >
                                        {link.is_visible
                                            ? <Eye size={17} />
                                            : <EyeOff size={17} />}
                                    </button>
                                    <button
                                        onClick={() => deleteLink(index)}
                                        title="Delete link"
                                        className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs text-slate-400">
                                        Link label
                                    </label>
                                    <input
                                        value={link.name}
                                        onChange={e => updateLink(index, "name", e.target.value)}
                                        placeholder="e.g. About"
                                        className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs text-slate-400">
                                        Destination
                                    </label>
                                    <input
                                        value={link.href}
                                        onChange={e => updateLink(index, "href", e.target.value)}
                                        placeholder="e.g. #about"
                                        className="w-full rounded-lg border border-white/10 bg-[#11151f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <p className={`mt-3 text-xs ${link.is_visible ? "text-emerald-400" : "text-slate-500"}`}>
                                {link.is_visible ? "Visible on website" : "Hidden from website"}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="font-semibold text-white">Call-to-Action Button</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Manage the button displayed at the right of your navbar.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm text-slate-300">
                            Button label
                        </label>
                        <input
                            value={cta.label}
                            onChange={e => setCta(current => ({ ...current, label: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-[#0b0f18] p-3 text-sm text-white outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-slate-300">
                            Button destination
                        </label>
                        <input
                            value={cta.href}
                            onChange={e => setCta(current => ({ ...current, href: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-[#0b0f18] p-3 text-sm text-white outline-none focus:border-violet-500"
                        />
                    </div>
                </div>

                <button
                    onClick={() => setCta(current => ({
                        ...current,
                        is_visible: !current.is_visible,
                    }))}
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        cta.is_visible
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-slate-400"
                    }`}
                >
                    {cta.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    {cta.is_visible ? "Button visible" : "Button hidden"}
                </button>
            </section>

            <div className="flex justify-end">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Navigation Settings"}
                </button>
            </div>
        </div>
    );
}
