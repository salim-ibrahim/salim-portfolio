
import { useEffect, useState } from "react";
import {
    Save,
    RefreshCw,
    Globe,
    Palette,
    Image,
    Eye,
    CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const DEFAULT_SETTINGS = {
    site_title: "Salim Ibrahim | Personal Portfolio",
    meta_description:
        "The personal portfolio of Salim Ibrahim, showcasing projects in data analytics, finance, research and software development.",
    theme_color: "#080c14",
    favicon_url: "/favicon.svg",
    social_image_url: "",
};

export default function AdminSection() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isPublished, setIsPublished] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSettings() {
            setLoading(true);
            setError("");

            try {
                const { data, error } = await supabase
                    .from("portfolio_sections")
                    .select("content, is_published")
                    .eq("section_key", "settings")
                    .maybeSingle();

                if (error) throw error;

                if (data && !cancelled) {
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...(data.content || {}),
                    });
                    setIsPublished(data.is_published);
                }
            } catch (err) {
                console.error("Unable to load site settings:", err);
                if (!cancelled) {
                    setError("Unable to load settings. Please refresh and try again.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    function updateSetting(field, value) {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));
        setNotice("");
    }

    async function saveSettings(publish) {
        setSaving(true);
        setNotice("");
        setError("");

        if (!settings.site_title.trim()) {
            setError("Website title cannot be empty.");
            setSaving(false);
            return;
        }

        if (!settings.meta_description.trim()) {
            setError("Meta description cannot be empty.");
            setSaving(false);
            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(settings.theme_color)) {
            setError("Enter a valid HEX colour, e.g. #080c14.");
            setSaving(false);
            return;
        }

        try {
            const { error } = await supabase
                .from("portfolio_sections")
                .update({
                    title: "Site Settings",
                    content: settings,
                    is_published: publish,
                })
                .eq("section_key", "settings");

            if (error) throw error;

            setIsPublished(publish);
            setNotice(
                publish
                    ? "Site settings published successfully."
                    : "Site settings saved as a draft."
            );
        } catch (err) {
            console.error("Unable to save site settings:", err);
            setError(err.message || "Unable to save settings.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-400">
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Loading site settings...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Site Settings
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your website identity, SEO information and appearance.
                    </p>
                </div>

                <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs ${isPublished
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-400/20 bg-amber-500/10 text-amber-400"
                        }`}
                >
                    {isPublished ? "Published" : "Draft"}
                </span>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {notice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    <CheckCircle2 size={17} />
                    {notice}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-6">
                    {/* Website identity */}
                    <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">
                                    Website Identity
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Your website's title and search description.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Website title
                                </label>
                                <input
                                    value={settings.site_title}
                                    onChange={(e) =>
                                        updateSetting("site_title", e.target.value)
                                    }
                                    placeholder="Your website title"
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Meta description
                                </label>
                                <textarea
                                    value={settings.meta_description}
                                    onChange={(e) =>
                                        updateSetting("meta_description", e.target.value)
                                    }
                                    rows={4}
                                    maxLength={320}
                                    placeholder="Describe your website..."
                                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    {settings.meta_description.length}/320 characters
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">
                                    Website Appearance
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Manage your browser theme colour.
                                </p>
                            </div>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Theme colour
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="color"
                                value={settings.theme_color}
                                onChange={(e) =>
                                    updateSetting("theme_color", e.target.value)
                                }
                                className="h-12 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                            />

                            <input
                                value={settings.theme_color}
                                onChange={(e) =>
                                    updateSetting("theme_color", e.target.value)
                                }
                                placeholder="#080c14"
                                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                            />

                            <div
                                className="h-10 w-10 rounded-xl border border-white/10"
                                style={{ backgroundColor: settings.theme_color }}
                            />
                        </div>
                    </section>

                    {/* Images */}
                    <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-400">
                                <Image size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">
                                    Website Images
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Configure your favicon and social sharing image.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Favicon URL
                                </label>
                                <input
                                    value={settings.favicon_url}
                                    onChange={(e) =>
                                        updateSetting("favicon_url", e.target.value)
                                    }
                                    placeholder="/favicon.svg"
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Example: /favicon.svg or a public Media Library URL.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Social sharing image URL
                                </label>
                                <input
                                    value={settings.social_image_url}
                                    onChange={(e) =>
                                        updateSetting("social_image_url", e.target.value)
                                    }
                                    placeholder="https://example.com/social-image.jpg"
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Image displayed when your website is shared on social platforms.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Preview */}
                <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#11151f] p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Live Preview</h2>
                            <p className="text-xs text-slate-400">
                                Preview your website metadata.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1019]">
                        <div
                            className="h-3"
                            style={{ backgroundColor: settings.theme_color }}
                        />

                        <div className="space-y-4 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                    {settings.favicon_url ? (
                                        <img
                                            src={settings.favicon_url}
                                            alt="Favicon preview"
                                            className="h-7 w-7 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <Globe size={18} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400">
                                        Website identity
                                    </p>
                                    <p className="truncate text-sm font-medium text-white">
                                        {settings.site_title || "Website title"}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <p className="text-sm font-semibold text-blue-300">
                                    {settings.site_title || "Website title"}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    {settings.meta_description || "Your website description will appear here."}
                                </p>
                            </div>

                            {settings.social_image_url && (
                                <div className="overflow-hidden rounded-lg border border-white/10">
                                    <img
                                        src={settings.social_image_url}
                                        alt="Social sharing preview"
                                        className="aspect-[1.91/1] w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <p className="text-xs font-medium text-slate-300">
                            Important
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Saving these settings stores them in Supabase.
                            Public website metadata will be connected separately
                            after the admin settings have been tested.
                        </p>
                    </div>
                </aside>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-3 border-t border-white/[0.07] pt-5 sm:flex-row">
                <button
                    type="button"
                    onClick={() => saveSettings(false)}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                    <Save size={16} />
                    Save Draft
                </button>

                <button
                    type="button"
                    onClick={() => saveSettings(true)}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                    {saving ? (
                        <RefreshCw size={16} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={16} />
                    )}
                    {saving ? "Saving..." : "Save & Publish"}
                </button>
            </div>
        </div>
    );
}
