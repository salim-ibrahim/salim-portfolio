import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Save, RefreshCw, Image, Plus, Trash2, ChevronUp, ChevronDown,
    ExternalLink, Eye, EyeOff
} from "lucide-react";

const emptyLink = {
    id: null,
    name: "",
    href: "",
    media_id: "",
    icon: "",
    sort_order: 0,
    is_enabled: true,
};

export default function ContactAdmin() {
    const [profile, setProfile] = useState({
        id: null,
        name: "Salim Ibrahim",
        profile_media_id: "231f27c2-d67e-40eb-85e6-e3fcb21b93f1",
        is_published: true,
    });
    const [links, setLinks] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingLink, setSavingLink] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");
        setNotice("");

        try {
            const [profileResult, linksResult, mediaResult] = await Promise.all([
                supabase.from("contact_profile")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(1),
                supabase.from("contact_links")
                    .select("*")
                    .order("sort_order", { ascending: true }),
                supabase.from("media_assets")
                    .select("id, original_name, file_name, file_path, bucket_name, mime_type")
                    .order("original_name"),
            ]);

            if (profileResult.error) throw profileResult.error;
            if (linksResult.error) throw linksResult.error;
            if (mediaResult.error) throw mediaResult.error;

            const record = profileResult.data?.[0];

            if (record) {
                setProfile({
                    ...record,
                    profile_media_id: record.profile_media_id || "",
                });
            }

            setLinks((linksResult.data || []).map((item) => ({
                ...item,
                media_id: item.media_id || "",
                icon: item.icon || "",
            })));

            setMedia(mediaResult.data || []);
        } catch (err) {
            setError(err.message || "Unable to load Contact settings.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const imageOptions = media.filter((item) =>
        item.mime_type?.startsWith("image/")
    );

    function imageUrl(mediaId) {
        const item = media.find((asset) => asset.id === mediaId);
        if (!item) return "";

        return supabase.storage
            .from(item.bucket_name || "portfolio-media")
            .getPublicUrl(item.file_path).data.publicUrl;
    }

    function updateLink(index, field, value) {
        setLinks((current) => current.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    }

    function addLink() {
        setLinks((current) => [
            ...current,
            { ...emptyLink, sort_order: current.length + 1 },
        ]);
    }

    async function saveProfile() {
        setSavingProfile(true);
        setError("");
        setNotice("");

        try {
            const payload = {
                name: profile.name.trim(),
                profile_media_id: profile.profile_media_id || null,
                is_published: profile.is_published,
            };

            if (!payload.name) {
                throw new Error("Please enter your name.");
            }

            let result;

            if (profile.id) {
                result = await supabase.from("contact_profile")
                    .update(payload)
                    .eq("id", profile.id)
                    .select()
                    .single();
            } else {
                result = await supabase.from("contact_profile")
                    .insert(payload)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            setProfile({
                ...result.data,
                profile_media_id: result.data.profile_media_id || "",
            });
            setNotice("Contact profile saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save Contact profile.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function saveLink(index) {
        const link = links[index];
        setSavingLink(index);
        setError("");
        setNotice("");

        try {
            const payload = {
                name: String(link.name || "").trim(),
                href: String(link.href || "").trim(),
                media_id: link.media_id || null,
                icon: String(link.icon || "").trim() || null,
                sort_order: index + 1,
                is_enabled: Boolean(link.is_enabled),
            };

            if (!payload.name || !payload.href) {
                throw new Error("Each contact link needs a name and destination URL.");
            }

            let result;

            if (link.id) {
                result = await supabase.from("contact_links")
                    .update(payload)
                    .eq("id", link.id)
                    .select()
                    .single();
            } else {
                result = await supabase.from("contact_links")
                    .insert(payload)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            setLinks((current) => current.map((item, i) =>
                i === index ? {
                    ...result.data,
                    media_id: result.data.media_id || "",
                    icon: result.data.icon || "",
                } : item
            ));

            setNotice(`${payload.name} saved successfully.`);
        } catch (err) {
            setError(err.message || "Unable to save contact link.");
        } finally {
            setSavingLink(null);
        }
    }

    async function deleteLink(index) {
        const link = links[index];

        if (!window.confirm(`Delete ${link.name || "this contact link"}?`)) {
            return;
        }

        setError("");
        setNotice("");

        try {
            if (link.id) {
                const { error: deleteError } = await supabase
                    .from("contact_links")
                    .delete()
                    .eq("id", link.id);

                if (deleteError) throw deleteError;
            }

            setLinks((current) => current.filter((_, i) => i !== index));
            setNotice("Contact link deleted.");
        } catch (err) {
            setError(err.message || "Unable to delete contact link.");
        }
    }

    async function moveLink(index, direction) {
        const nextIndex = index + direction;

        if (nextIndex < 0 || nextIndex >= links.length) return;

        const reordered = [...links];
        [reordered[index], reordered[nextIndex]] =
            [reordered[nextIndex], reordered[index]];

        const updated = reordered.map((item, i) => ({
            ...item,
            sort_order: i + 1,
        }));

        setLinks(updated);
        setError("");
        setNotice("");

        try {
            for (const item of updated) {
                if (!item.id) continue;

                const { error: updateError } = await supabase
                    .from("contact_links")
                    .update({ sort_order: item.sort_order })
                    .eq("id", item.id);

                if (updateError) throw updateError;
            }

            setNotice("Contact link order updated.");
        } catch (err) {
            setError(err.message || "Unable to update link order. Reload to check the saved order.");
        }
    }

    if (loading) {
        return <div className="py-16 text-center text-slate-400">Loading Contact settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Contact Page</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your profile and the contact links displayed on your portfolio.
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

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}
            {notice && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    {notice}
                </div>
            )}

            <section className="space-y-5 rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 md:p-7">
                <div>
                    <h2 className="font-semibold text-white">Contact Profile</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Your name and photograph shown in the Contact section.
                    </p>
                </div>

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-300">Your name</span>
                    <input
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                    />
                </label>

                <label className="block space-y-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Image size={15} /> Profile photograph
                    </span>
                    <select
                        value={profile.profile_media_id || ""}
                        onChange={(e) => setProfile((p) => ({ ...p, profile_media_id: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                    >
                        <option value="">Use existing website image</option>
                        {imageOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.original_name || item.file_name} — {item.file_path}
                            </option>
                        ))}
                    </select>

                    {profile.profile_media_id && imageUrl(profile.profile_media_id) && (
                        <img
                            src={imageUrl(profile.profile_media_id)}
                            alt="Contact profile preview"
                            className="mt-3 h-28 w-28 rounded-full border border-white/10 object-cover"
                        />
                    )}
                    <span className="text-xs text-slate-500">
                        {imageOptions.length} images available in Media Library.
                    </span>
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                        type="checkbox"
                        checked={Boolean(profile.is_published)}
                        onChange={(e) => setProfile((p) => ({ ...p, is_published: e.target.checked }))}
                        className="accent-violet-500"
                    />
                    Show this profile on the public Contact page
                </label>

                <div className="flex justify-end border-t border-white/[0.07] pt-5">
                    <button
                        type="button"
                        disabled={savingProfile}
                        onClick={saveProfile}
                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                        <Save size={16} /> {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-white">Contact Links</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Manage destinations, icons, visibility and display order.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addLink}
                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
                    >
                        <Plus size={16} /> Add Link
                    </button>
                </div>

                {links.length === 0 && (
                    <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">
                        No contact links yet. Select Add Link to create your first one.
                    </p>
                )}

                <div className="space-y-4">
                    {links.map((link, index) => (
                        <div key={link.id || `new-${index}`} className="space-y-4 rounded-xl border border-white/10 bg-[#0b0f18] p-4 md:p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm font-semibold text-slate-300">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-white">
                                        {link.name || "New contact link"}
                                    </span>
                                    {link.is_enabled
                                        ? <span className="text-xs text-emerald-400">Enabled</span>
                                        : <span className="text-xs text-amber-400">Disabled</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        title="Move up"
                                        disabled={index === 0}
                                        onClick={() => moveLink(index, -1)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                                    >
                                        <ChevronUp size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Move down"
                                        disabled={index === links.length - 1}
                                        onClick={() => moveLink(index, 1)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                                    >
                                        <ChevronDown size={17} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete link"
                                        onClick={() => deleteLink(index)}
                                        className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block space-y-2">
                                    <span className="text-sm font-medium text-slate-300">Link name</span>
                                    <input
                                        value={link.name}
                                        onChange={(e) => updateLink(index, "name", e.target.value)}
                                        placeholder="e.g. LinkedIn"
                                        className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-sm font-medium text-slate-300">Destination URL</span>
                                    <input
                                        value={link.href}
                                        onChange={(e) => updateLink(index, "href", e.target.value)}
                                        placeholder="https://... or mailto:..."
                                        className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                </label>
                            </div>

                            <label className="block space-y-2">
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <Image size={15} /> Link image
                                </span>
                                <select
                                    value={link.media_id || ""}
                                    onChange={(e) => updateLink(index, "media_id", e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                                >
                                    <option value="">No image selected</option>
                                    {imageOptions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.original_name || item.file_name} — {item.file_path}
                                        </option>
                                    ))}
                                </select>
                                {link.media_id && imageUrl(link.media_id) && (
                                    <img
                                        src={imageUrl(link.media_id)}
                                        alt={`${link.name} preview`}
                                        className="mt-2 h-12 w-12 rounded-lg border border-white/10 object-cover"
                                    />
                                )}
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm font-medium text-slate-300">Icon name (optional)</span>
                                <input
                                    value={link.icon || ""}
                                    onChange={(e) => updateLink(index, "icon", e.target.value)}
                                    placeholder="e.g. mail, linkedin, github"
                                    className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                                />
                            </label>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(link.is_enabled)}
                                        onChange={(e) => updateLink(index, "is_enabled", e.target.checked)}
                                        className="accent-violet-500"
                                    />
                                    {link.is_enabled ? <Eye size={15} /> : <EyeOff size={15} />}
                                    Visible on public page
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    {link.href && (
                                        <a
                                            href={link.href}
                                            target={link.href.startsWith("http") ? "_blank" : undefined}
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                        >
                                            Preview <ExternalLink size={13} />
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        disabled={savingLink === index}
                                        onClick={() => saveLink(index)}
                                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                                    >
                                        <Save size={15} />
                                        {savingLink === index ? "Saving..." : "Save Link"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
