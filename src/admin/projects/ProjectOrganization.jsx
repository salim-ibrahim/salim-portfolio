import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
    ArrowLeft, Plus, Pencil, Trash2, X, Save,
    FolderOpen, LayoutGrid, RefreshCw
} from "lucide-react";

const blankForm = {
    name: "",
    slug: "",
    placement_key: "",
    description: "",
    sort_order: 0,
    is_active: true,
};

function slugify(value) {
    return value.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function ProjectOrganization({ onClose }) {
    const [tab, setTab] = useState("categories");
    const [categories, setCategories] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [form, setForm] = useState(blankForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const isCategory = tab === "categories";
    const table = isCategory ? "project_categories" : "project_placements";
    const rows = isCategory ? categories : placements;

    async function loadData() {
        setLoading(true);
        setError("");

        const [categoryResult, placementResult] = await Promise.all([
            supabase.from("project_categories").select("*").order("sort_order"),
            supabase.from("project_placements").select("*").order("sort_order"),
        ]);

        if (categoryResult.error || placementResult.error) {
            setError(
                categoryResult.error?.message ||
                placementResult.error?.message
            );
        } else {
            setCategories(categoryResult.data || []);
            setPlacements(placementResult.data || []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    function openNew() {
        setEditingId(null);
        setForm({ ...blankForm });
        setError("");
        setNotice("");
        setShowForm(true);
    }

    function openEdit(item) {
        setEditingId(item.id);
        setForm({
            ...blankForm,
            ...item,
        });
        setError("");
        setNotice("");
        setShowForm(true);
    }

    function updateField(field, value) {
        setForm(current => ({ ...current, [field]: value }));
    }

    async function saveItem(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");

        const name = form.name.trim();
        const keyField = isCategory ? "slug" : "placement_key";
        const key = form[keyField].trim() || slugify(name);

        if (!name || !key) {
            setError("Name and identifier are required.");
            setSaving(false);
            return;
        }

        const payload = {
            name,
            [keyField]: key,
            description: form.description.trim() || null,
            sort_order: Number(form.sort_order) || 0,
            is_active: form.is_active,
        };

        const result = editingId
            ? await supabase.from(table).update(payload).eq("id", editingId)
            : await supabase.from(table).insert(payload);

        if (result.error) {
            setError(result.error.message);
            setSaving(false);
            return;
        }

        setNotice(editingId ? "Updated successfully." : "Created successfully.");
        setShowForm(false);
        setEditingId(null);
        await loadData();
        setSaving(false);
    }

    async function deleteItem(item) {
        const type = isCategory ? "category" : "placement";

        if (!window.confirm(
            `Delete "${item.name}"? Its project assignments will also be removed. Projects themselves will not be deleted.`
        )) return;

        setError("");
        setNotice("");

        const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq("id", item.id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        setNotice(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
        await loadData();
    }

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400";
    const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 p-3 backdrop-blur-sm sm:p-6">
            <div className="mx-auto my-4 max-w-5xl rounded-2xl border border-white/10 bg-[#11151f] shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                            title="Back to projects"
                        >
                            <ArrowLeft size={19} />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Project organization
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Manage project categories and display placements.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    {notice && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                            {notice}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setTab("categories");
                                    setShowForm(false);
                                    setError("");
                                    setNotice("");
                                }}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                                    isCategory
                                        ? "bg-amber-400 font-semibold text-black"
                                        : "border border-white/10 text-slate-300 hover:bg-white/5"
                                }`}
                            >
                                <FolderOpen size={16} /> Categories
                                <span>({categories.length})</span>
                            </button>
                            <button
                                onClick={() => {
                                    setTab("placements");
                                    setShowForm(false);
                                    setError("");
                                    setNotice("");
                                }}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                                    !isCategory
                                        ? "bg-amber-400 font-semibold text-black"
                                        : "border border-white/10 text-slate-300 hover:bg-white/5"
                                }`}
                            >
                                <LayoutGrid size={16} /> Placements
                                <span>({placements.length})</span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={loadData}
                                className="rounded-lg border border-white/10 p-2.5 text-slate-300 hover:bg-white/5"
                                title="Refresh"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <button
                                onClick={openNew}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300"
                            >
                                <Plus size={16} /> Add {isCategory ? "category" : "placement"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#0b0e14] p-4">
                        <h3 className="font-medium text-white">
                            {isCategory ? "Project categories" : "Display placements"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {isCategory
                                ? "Categories classify projects by their subject or discipline. A project can belong to multiple categories."
                                : "Placements determine where projects appear in your portfolio. A project can appear in more than one placement."
                            }
                        </p>
                    </div>

                    {showForm && (
                        <form
                            onSubmit={saveItem}
                            className="space-y-4 rounded-xl border border-amber-400/20 bg-white/[0.02] p-5"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">
                                    {editingId ? "Edit" : "Create"} {isCategory ? "category" : "placement"}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Name *</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => {
                                            const name = e.target.value;
                                            setForm(current => ({
                                                ...current,
                                                name,
                                                [isCategory ? "slug" : "placement_key"]:
                                                    editingId
                                                        ? current[isCategory ? "slug" : "placement_key"]
                                                        : slugify(name),
                                            }));
                                        }}
                                        className={inputClass}
                                        placeholder={isCategory ? "Data Analytics" : "Featured Projects"}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        {isCategory ? "Category slug *" : "Placement key *"}
                                    </label>
                                    <input
                                        required
                                        value={form[isCategory ? "slug" : "placement_key"]}
                                        onChange={e => updateField(
                                            isCategory ? "slug" : "placement_key",
                                            slugify(e.target.value)
                                        )}
                                        className={inputClass}
                                        placeholder="generated-identifier"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        rows={3}
                                        value={form.description || ""}
                                        onChange={e => updateField("description", e.target.value)}
                                        className={inputClass}
                                        placeholder="Describe how this category or placement is used..."
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Display order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => updateField("sort_order", e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={e => updateField("is_active", e.target.checked)}
                                    className="accent-amber-400"
                                />
                                Active and available for use
                            </label>

                            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-hidden rounded-xl border border-white/10">
                        {loading ? (
                            <p className="p-8 text-center text-sm text-slate-400">
                                Loading organization settings...
                            </p>
                        ) : rows.length === 0 ? (
                            <div className="p-10 text-center">
                                {isCategory
                                    ? <FolderOpen className="mx-auto mb-3 text-slate-600" size={32} />
                                    : <LayoutGrid className="mx-auto mb-3 text-slate-600" size={32} />
                                }
                                <p className="font-medium text-white">
                                    No {isCategory ? "categories" : "placements"} created yet
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add your first {isCategory ? "category" : "placement"} to organize projects.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {rows.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-white/[0.02]"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-white">{item.name}</p>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                                    item.is_active
                                                        ? "bg-emerald-400/10 text-emerald-300"
                                                        : "bg-slate-400/10 text-slate-400"
                                                }`}>
                                                    {item.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {isCategory ? item.slug : item.placement_key}
                                                {" · Order "}{item.sort_order}
                                            </p>
                                            {item.description && (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-amber-300"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteItem(item)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}