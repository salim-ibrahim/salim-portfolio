
import { useEffect, useState } from "react";
import {
    Activity,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 20;

const CONTENT_TYPES = [
    ["portfolio_sections", "Portfolio Sections"],
    ["projects", "Projects"],
    ["experiences", "Experience"],
    ["education", "Education"],
    ["certifications", "Certifications"],
    ["skills", "Skills"],
    ["skill_groups", "Skill Groups"],
    ["contact_links", "Contact Links"],
    ["contact_profile", "Contact Profile"],
    ["home_settings", "Home Settings"],
    ["about_settings", "About Settings"],
    ["footer_settings", "Footer Settings"],
    ["media_assets", "Media Library"],
    ["project_categories", "Project Categories"],
    ["project_category_assignments", "Project Category Assignments"],
    ["project_placements", "Project Placements"],
    ["project_placement_assignments", "Project Placement Assignments"],
];

const ACTION_STYLES = {
    created: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    updated: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    deleted: "bg-red-500/10 text-red-400 border-red-500/20",
    published: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    unpublished: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function formatAction(action) {
    return action?.charAt(0).toUpperCase() + action?.slice(1);
}

function formatContentType(type) {
    const knownType = CONTENT_TYPES.find(([value]) => value === type);

    if (knownType) return knownType[1];

    return (type || "Activity")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
    if (!value) return "Unknown date";

    return new Date(value).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ActivityHistory() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadActivities() {
            setLoading(true);
            setError("");

            try {
                let query = supabase
                    .from("activity_logs")
                    .select("*", { count: "exact" })
                    .order("performed_at", { ascending: false })
                    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

                if (searchTerm) {
                    query = query.ilike("content_title", `%${searchTerm}%`);
                }

                if (actionFilter) {
                    query = query.eq("action", actionFilter);
                }

                if (typeFilter) {
                    query = query.eq("content_type", typeFilter);
                }

                const { data, count, error: queryError } = await query;

                if (queryError) throw queryError;

                if (!cancelled) {
                    setActivities(data || []);
                    setTotalCount(count || 0);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load activity history.");
                    setActivities([]);
                    setTotalCount(0);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        }

        loadActivities();

        return () => {
            cancelled = true;
        };
    }, [page, searchTerm, actionFilter, typeFilter, refreshing]);

    function handleSearch(event) {
        event.preventDefault();
        setPage(0);
        setSearchTerm(searchInput.trim());
    }

    function handleActionChange(event) {
        setActionFilter(event.target.value);
        setPage(0);
    }

    function handleTypeChange(event) {
        setTypeFilter(event.target.value);
        setPage(0);
    }

    function handleRefresh() {
        setRefreshing(true);
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const firstItem = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
    const lastItem = Math.min((page + 1) * PAGE_SIZE, totalCount);

    return (
        <div className="space-y-7">
            {/* Page heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-400">
                        <Activity size={15} />
                        SYSTEM
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Activity History
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Track changes made across your portfolio website.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#10131b] p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        <Clock size={21} />
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Recorded activities
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white">
                            {totalCount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#10131b] p-5">
                <div className="mb-4 flex items-center gap-2">
                    <Filter size={16} className="text-violet-400" />
                    <h2 className="text-sm font-semibold text-white">
                        Search and filter
                    </h2>
                </div>

                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_190px_220px_auto]"
                >
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search activity by title..."
                            className="w-full rounded-xl border border-white/10 bg-[#0b0d12] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
                        />
                    </div>

                    <select
                        value={actionFilter}
                        onChange={handleActionChange}
                        className="rounded-xl border border-white/10 bg-[#0b0d12] px-3 py-3 text-sm text-slate-300 outline-none focus:border-violet-500/50"
                    >
                        <option value="">All actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={handleTypeChange}
                        className="rounded-xl border border-white/10 bg-[#0b0d12] px-3 py-3 text-sm text-slate-300 outline-none focus:border-violet-500/50"
                    >
                        <option value="">All content types</option>
                        {CONTENT_TYPES.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                        <Search size={16} />
                        Search
                    </button>
                </form>
            </div>

            {/* Activity list */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10131b]">
                <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-semibold text-white">
                        Recorded activity
                    </h2>

                    <p className="text-xs text-slate-500">
                        {loading
                            ? "Loading activity..."
                            : totalCount === 0
                                ? "No records found"
                                : `Showing ${firstItem}–${lastItem} of ${totalCount.toLocaleString()}`}
                    </p>
                </div>

                {error && (
                    <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        <p className="font-semibold">Unable to load activity</p>
                        <p className="mt-1">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-16 animate-pulse rounded-xl bg-white/[0.03]"
                            />
                        ))}
                    </div>
                ) : activities.length > 0 ? (
                    <div className="divide-y divide-white/[0.06]">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex flex-col gap-3 px-5 py-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div className="flex min-w-0 gap-3">
                                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
                                        <Activity size={17} />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${ACTION_STYLES[activity.action] ||
                                                    "border-white/10 bg-white/5 text-slate-400"
                                                    }`}
                                            >
                                                {formatAction(activity.action)}
                                            </span>

                                            <span className="text-[11px] text-slate-500">
                                                {formatContentType(activity.content_type)}
                                            </span>
                                        </div>

                                        <p className="break-words text-sm font-semibold text-slate-100">
                                            {activity.content_title}
                                        </p>

                                        {activity.description && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 pl-12 sm:pl-0 sm:text-right">
                                    <p className="text-xs text-slate-400">
                                        {formatDate(activity.performed_at)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-600">
                                        {activity.performed_by
                                            ? "Administrator"
                                            : "System / SQL"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !error ? (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
                            <Activity size={22} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                            No activity found
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                            Activity will appear here when changes are made to
                            your portfolio content. Try changing your filters
                            or search terms.
                        </p>
                    </div>
                ) : null}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Page {page + 1} of {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((current) => current - 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((current) => current + 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
