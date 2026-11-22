import { useEffect, useState } from "react";
import { Save, RefreshCw, ArrowUp } from "lucide-react";
import { supabase } from "../lib/supabase";

const DEFAULT_FOOTER = {
    name: "Salim Ibrahim",
    rights: "All rights reserved.",
    backToTop: "Back to top ↑",
    backToTopLink: "#home",
};

export default function FooterAdmin() {
    const [footer, setFooter] = useState(DEFAULT_FOOTER);
    const [sectionId, setSectionId] = useState(null);
    const [isPublished, setIsPublished] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadFooter();
    }, []);

    async function loadFooter() {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
            .from("portfolio_sections")
            .select("*")
            .eq("section_key", "footer")
            .maybeSingle();

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        if (data) {
            setSectionId(data.id);
            setIsPublished(data.is_published);

            setFooter({
                ...DEFAULT_FOOTER,
                ...(data.content || {}),
            });
        }

        setLoading(false);
    }

    function updateField(field, value) {
        setFooter((current) => ({
            ...current,
            [field]: value,
        }));
        setNotice("");
    }

    async function saveFooter(publish = isPublished) {
        setSaving(true);
        setNotice("");
        setError("");

        const content = {
            name: footer.name.trim(),
            rights: footer.rights.trim(),
            backToTop: footer.backToTop.trim(),
            backToTopLink: footer.backToTopLink.trim(),
        };

        if (!content.name || !content.backToTop || !content.backToTopLink) {
            setError("Please complete the display name, back-to-top label and destination.");
            setSaving(false);
            return;
        }

        const { error } = await supabase
            .from("portfolio_sections")
            .update({
                title: "Footer",
                content,
                is_published: publish,
            })
            .eq("section_key", "footer");

        if (error) {
            setError(error.message);
        } else {
            setIsPublished(publish);
            setNotice(
                publish
                    ? "Footer settings saved and published successfully."
                    : "Footer settings saved as draft."
            );
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 p-8 text-slate-400">
                <RefreshCw size={18} className="animate-spin" />
                Loading footer settings...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-6 text-slate-100">
            <div>
                <p className="text-sm font-medium text-purple-400">Website Content</p>
                <h1 className="mt-1 text-3xl font-bold">Footer Management</h1>
                <p className="mt-2 text-sm text-slate-400">
                    Manage the copyright information and back-to-top link displayed at the bottom of your website.
                </p>
            </div>

            {notice && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    {notice}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div>
                    <h2 className="text-lg font-semibold">Copyright Information</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Customize the copyright statement shown in your footer.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Display name
                    </label>
                    <input
                        value={footer.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Salim Ibrahim"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Copyright text
                    </label>
                    <input
                        value={footer.rights}
                        onChange={(e) => updateField("rights", e.target.value)}
                        placeholder="All rights reserved."
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400"
                    />
                </div>
            </section>

            <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                    <ArrowUp size={20} className="text-purple-400" />
                    <div>
                        <h2 className="text-lg font-semibold">Back to Top Link</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Manage the link that takes visitors back to the top of your website.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Link label
                    </label>
                    <input
                        value={footer.backToTop}
                        onChange={(e) => updateField("backToTop", e.target.value)}
                        placeholder="Back to top ↑"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Link destination
                    </label>
                    <input
                        value={footer.backToTopLink}
                        onChange={(e) => updateField("backToTopLink", e.target.value)}
                        placeholder="#home"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-purple-400"
                    />
                    <p className="text-xs text-slate-500">
                        Example: #home
                    </p>
                </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div>
                    <h2 className="text-lg font-semibold">Live Preview</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Preview of how your footer information will appear.
                    </p>
                </div>

                <div className="rounded-xl border-t border-white/10 py-6">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} {footer.name}. {footer.rights}
                        </p>
                        <a href={footer.backToTopLink} className="transition hover:text-white">
                            {footer.backToTop}
                        </a>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Status:{" "}
                    <span className={isPublished ? "text-emerald-400" : "text-amber-400"}>
                        {isPublished ? "Published" : "Draft"}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => saveFooter(false)}
                        disabled={saving}
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Save Draft
                    </button>

                    <button
                        onClick={() => saveFooter(true)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:opacity-50"
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save & Publish"}
                    </button>
                </div>
            </div>
        </div>
    );
}
