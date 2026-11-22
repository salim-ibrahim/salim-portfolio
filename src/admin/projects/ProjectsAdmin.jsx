import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ProjectOrganization from "./ProjectOrganization";
import ProjectMigration from "./ProjectMigration";
import {
    Plus, Search, Pencil, Trash2, X, Save, RefreshCw,
    FolderKanban, ExternalLink
} from "lucide-react";

const emptyProject = {
    project_key: "",
    title: "",
    category: "",
    subtitle: "",
    description: "",
    technologies: "",
    icon: "",
    project_number: "",
    github_url: "",
    live_url: "",
    data_source_label: "",
    data_source_url: "",
    content_blocks: "[]",
    is_featured: false,
    is_published: false,
    sort_order: 0,
    category_ids: [],
    placement_ids: [],
};

function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function ProjectsAdmin() {
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [placements, setPlacements] = useState([]);
    const [form, setForm] = useState(emptyProject);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showOrganization, setShowOrganization] = useState(false);
    const [showMigration, setShowMigration] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [
                projectsResult,
                categoriesResult,
                placementsResult,
            ] = await Promise.all([
                supabase.from("projects").select("*").order("sort_order"),
                supabase.from("project_categories").select("*").order("sort_order"),
                supabase.from("project_placements").select("*").order("sort_order"),
            ]);

            if (projectsResult.error) throw projectsResult.error;
            if (categoriesResult.error) throw categoriesResult.error;
            if (placementsResult.error) throw placementsResult.error;

            const projectRows = projectsResult.data || [];
            setCategories(categoriesResult.data || []);
            setPlacements(placementsResult.data || []);

            if (projectRows.length) {
                const ids = projectRows.map((project) => project.id);

                const [categoryAssignments, placementAssignments] = await Promise.all([
                    supabase
                        .from("project_category_assignments")
                        .select("project_id, category_id")
                        .in("project_id", ids),
                    supabase
                        .from("project_placement_assignments")
                        .select("project_id, placement_id, sort_order")
                        .in("project_id", ids),
                ]);

                if (categoryAssignments.error) throw categoryAssignments.error;
                if (placementAssignments.error) throw placementAssignments.error;

                const categoryMap = {};
                const placementMap = {};

                (categoryAssignments.data || []).forEach((item) => {
                    categoryMap[item.project_id] ||= [];
                    categoryMap[item.project_id].push(item.category_id);
                });

                (placementAssignments.data || []).forEach((item) => {
                    placementMap[item.project_id] ||= [];
                    placementMap[item.project_id].push(item.placement_id);
                });

                setProjects(projectRows.map((project) => ({
                    ...project,
                    category_ids: categoryMap[project.id] || [],
                    placement_ids: placementMap[project.id] || [],
                })));
            } else {
                setProjects([]);
            }
        } catch (err) {
            setError(err.message || "Unable to load projects.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function openNewProject() {
        setEditingId(null);
        setForm({ ...emptyProject });
        setError("");
        setNotice("");
        setShowEditor(true);
    }

    function openEditProject(project) {
        setEditingId(project.id);
        setForm({
            ...emptyProject,
            ...project,
            project_key: project.project_key ?? "",
            title: project.title ?? "",
            category: project.category ?? "",
            subtitle: project.subtitle ?? "",
            description: project.description ?? "",
            technologies: Array.isArray(project.technologies)
                ? project.technologies.join("\n")
                : "",
            icon: project.icon ?? "",
            project_number: project.project_number ?? "",
            github_url: project.github_url ?? "",
            live_url: project.live_url ?? "",
            data_source_label: project.data_source_label ?? "",
            data_source_url: project.data_source_url ?? "",
            content_blocks: JSON.stringify(project.content_blocks || [], null, 2),
            category_ids: project.category_ids || [],
            placement_ids: project.placement_ids || [],
        });
        setError("");
        setNotice("");
        setShowEditor(true);
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function toggleAssignment(field, id) {
        setForm((current) => ({
            ...current,
            [field]: current[field].includes(id)
                ? current[field].filter((item) => item !== id)
                : [...current[field], id],
        }));
    }

    async function saveProject(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const blocks = JSON.parse(form.content_blocks || "[]");

            if (!Array.isArray(blocks)) {
                throw new Error("Project content must be a JSON array.");
            }

            const cleanText = (value) => String(value ?? "").trim();

            const projectData = {
                project_key: cleanText(form.project_key) || slugify(form.title),
                title: cleanText(form.title),
                category: cleanText(form.category) || null,
                subtitle: cleanText(form.subtitle) || null,
                description: cleanText(form.description) || null,
                technologies: String(form.technologies ?? "")
                    .split("\n")
                    .map(cleanText)
                    .filter(Boolean),
                icon: cleanText(form.icon) || null,
                project_number: form.project_number === ""
                    ? null
                    : Number(form.project_number),
                github_url: cleanText(form.github_url) || null,
                live_url: cleanText(form.live_url) || null,
                data_source_label: cleanText(form.data_source_label) || null,
                data_source_url: cleanText(form.data_source_url) || null,
                content_blocks: blocks,
                is_featured: form.is_featured,
                is_published: form.is_published,
                sort_order: Number(form.sort_order) || 0,
            };

            if (!projectData.title || !projectData.project_key) {
                throw new Error("Project title and project key are required.");
            }

            let projectId = editingId;

            if (editingId) {
                const { error: updateError } = await supabase
                    .from("projects")
                    .update(projectData)
                    .eq("id", editingId);

                if (updateError) throw updateError;
            } else {
                const { data, error: insertError } = await supabase
                    .from("projects")
                    .insert(projectData)
                    .select("id")
                    .single();

                if (insertError) throw insertError;
                projectId = data.id;
            }

            const { error: removeCategoriesError } = await supabase
                .from("project_category_assignments")
                .delete()
                .eq("project_id", projectId);

            if (removeCategoriesError) throw removeCategoriesError;

            const { error: removePlacementsError } = await supabase
                .from("project_placement_assignments")
                .delete()
                .eq("project_id", projectId);

            if (removePlacementsError) throw removePlacementsError;

            if (form.category_ids.length) {
                const { error: categoryError } = await supabase
                    .from("project_category_assignments")
                    .insert(form.category_ids.map((categoryId) => ({
                        project_id: projectId,
                        category_id: categoryId,
                    })));

                if (categoryError) throw categoryError;
            }

            if (form.placement_ids.length) {
                const { error: placementError } = await supabase
                    .from("project_placement_assignments")
                    .insert(form.placement_ids.map((placementId, index) => ({
                        project_id: projectId,
                        placement_id: placementId,
                        sort_order: index,
                    })));

                if (placementError) throw placementError;
            }

            setShowEditor(false);
            setNotice(editingId ? "Project updated successfully." : "Project created successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Unable to save project.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteProject(project) {
        if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

        setError("");
        setNotice("");

        const { error: deleteError } = await supabase
            .from("projects")
            .delete()
            .eq("id", project.id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        setNotice("Project deleted.");
        await loadData();
    }

    const filteredProjects = projects.filter((project) =>
        `${project.title} ${project.category || ""} ${project.project_key}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const inputClass = "w-full rounded-lg border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400";
    const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

    return (
        <div className="space-y-6">
            {showMigration && (
                <ProjectMigration onComplete={async () => {
                    await loadData();
                    setShowMigration(false);
                }} />
            )}
            {showOrganization && (
                <ProjectOrganization onClose={() => {
                    setShowOrganization(false);
                    loadData();
                }} />
            )}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <FolderKanban className="text-amber-400" size={25} />
                        <h1 className="text-2xl font-semibold text-white">Projects</h1>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                        Create, edit and organize the projects displayed in your portfolio.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShowOrganization(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-amber-400 hover:text-amber-300"
                    >
                        <FolderKanban size={17} /> Manage categories &amp; placements
                    </button>
                    <button
                        onClick={() => setShowMigration((value) => !value)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/40 px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-400/10"
                    >
                        <RefreshCw size={17} /> Import existing projects
                    </button>
                    <button
                        onClick={openNewProject}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300"
                    >
                        <Plus size={17} /> Add project
                    </button>
                </div>
            </div>

            {notice && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {notice}
                </div>
            )}

            {error && !showEditor && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search projects..."
                        className={`${inputClass} pl-10`}
                    />
                </div>
                <button
                    onClick={loadData}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    ["Total projects", projects.length],
                    ["Published", projects.filter((item) => item.is_published).length],
                    ["Drafts", projects.filter((item) => !item.is_published).length],
                    ["Featured", projects.filter((item) => item.is_featured).length],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-[#11151f] p-4">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#11151f]">
                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-400">Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-10 text-center">
                        <FolderKanban className="mx-auto mb-3 text-slate-600" size={34} />
                        <p className="font-medium text-white">No projects found</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Add your first project or adjust your search.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Project</th>
                                    <th className="px-4 py-4">Category</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Order</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-white/[0.02]">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-white">{project.title}</p>
                                            <p className="mt-1 text-xs text-slate-500">{project.project_key}</p>
                                            {project.is_featured && (
                                                <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                                                    Featured
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-slate-400">{project.category || "Ã¢â‚¬â€"}</td>
                                        <td className="px-4 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs ${
                                                project.is_published
                                                    ? "bg-emerald-400/10 text-emerald-300"
                                                    : "bg-slate-400/10 text-slate-400"
                                            }`}>
                                                {project.is_published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-400">{project.sort_order}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                {project.live_url && (
                                                    <a
                                                        href={project.live_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                        title="Open live project"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => openEditProject(project)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-amber-300"
                                                    title="Edit project"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProject(project)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                                                    title="Delete project"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showEditor && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6">
                    <div className="mx-auto my-4 max-w-4xl rounded-2xl border border-white/10 bg-[#11151f] shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#11151f] px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {editingId ? "Edit project" : "Create project"}
                                </h2>
                                <p className="text-xs text-slate-500">Project details and portfolio content</p>
                            </div>
                            <button
                                onClick={() => setShowEditor(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={saveProject} className="space-y-6 p-5">
                            {error && (
                                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Project title *</label>
                                    <input required value={form.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Project key / slug</label>
                                    <input
                                        value={form.project_key}
                                        onChange={(e) => updateField("project_key", e.target.value)}
                                        placeholder={slugify(form.title) || "project-name"}
                                        className={inputClass}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Leave blank to generate from the title.</p>
                                </div>

                                <div>
                                    <label className={labelClass}>Category label</label>
                                    <input value={form.category || ""} onChange={(e) => updateField("category", e.target.value)} className={inputClass} />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Subtitle</label>
                                    <input value={form.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} className={inputClass} />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea rows={4} value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>GitHub URL</label>
                                    <input type="url" value={form.github_url || ""} onChange={(e) => updateField("github_url", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Live URL</label>
                                    <input type="url" value={form.live_url || ""} onChange={(e) => updateField("live_url", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Data source label</label>
                                    <input value={form.data_source_label || ""} onChange={(e) => updateField("data_source_label", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Data source URL</label>
                                    <input type="url" value={form.data_source_url || ""} onChange={(e) => updateField("data_source_url", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Icon name (Lucide)</label>
                                    <input value={form.icon || ""} onChange={(e) => updateField("icon", e.target.value)} className={inputClass} placeholder="chart-no-axes-combined" />
                                </div>

                                <div>
                                    <label className={labelClass}>Project number</label>
                                    <input type="number" value={form.project_number} onChange={(e) => updateField("project_number", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Display order</label>
                                    <input type="number" value={form.sort_order} onChange={(e) => updateField("sort_order", e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Technologies (one per line)</label>
                                    <textarea rows={5} value={form.technologies} onChange={(e) => updateField("technologies", e.target.value)} className={inputClass} placeholder={"React\nPython\nSQL"} />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 font-medium text-white">Project categories</h3>
                                    <div className="space-y-2 rounded-lg border border-white/10 p-3">
                                        {categories.length === 0 ? (
                                            <p className="text-xs text-slate-500">No categories have been created yet.</p>
                                        ) : categories.map((category) => (
                                            <label key={category.id} className="flex items-center gap-2 text-sm text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={form.category_ids.includes(category.id)}
                                                    onChange={() => toggleAssignment("category_ids", category.id)}
                                                    className="accent-amber-400"
                                                />
                                                {category.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-medium text-white">Display placements</h3>
                                    <div className="space-y-2 rounded-lg border border-white/10 p-3">
                                        {placements.length === 0 ? (
                                            <p className="text-xs text-slate-500">No placements have been created yet.</p>
                                        ) : placements.map((placement) => (
                                            <label key={placement.id} className="flex items-center gap-2 text-sm text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={form.placement_ids.includes(placement.id)}
                                                    onChange={() => toggleAssignment("placement_ids", placement.id)}
                                                    className="accent-amber-400"
                                                />
                                                {placement.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Detailed project content (JSON array)</label>
                                <textarea
                                    rows={14}
                                    spellCheck={false}
                                    value={form.content_blocks}
                                    onChange={(e) => updateField("content_blocks", e.target.value)}
                                    className={`${inputClass} font-mono text-xs leading-6`}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    This stores your detailed project sections, media references, tables and other structured content.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-5 rounded-lg border border-white/10 p-4">
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField("is_featured", e.target.checked)} className="accent-amber-400" />
                                    Featured project
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input type="checkbox" checked={form.is_published} onChange={(e) => updateField("is_published", e.target.checked)} className="accent-amber-400" />
                                    Published
                                </label>
                            </div>

                            <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-5 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setShowEditor(false)}
                                    className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectsAdmin;



