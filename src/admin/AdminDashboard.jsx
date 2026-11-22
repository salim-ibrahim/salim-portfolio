
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FolderKanban,
    Layers3,
    Image,
    FileEdit,
    ArrowUpRight,
    RefreshCw,
    ExternalLink,
    House,
    UserRound,
    Wrench,
    BriefcaseBusiness,
    GraduationCap,
    Award,
    Mail,
    Menu,
    Settings,
    Clock3,
    CheckCircle2,
    FileClock,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const contentTables = [
    "portfolio_sections",
    "projects",
    "experiences",
    "education",
    "certifications",
    "skills",
    "skill_groups",
];

const quickActions = [
    {
        label: "Manage Home",
        description: "Update your homepage content",
        href: "/admin/home",
        icon: House,
    },
    {
        label: "Manage About",
        description: "Edit your profile and biography",
        href: "/admin/about",
        icon: UserRound,
    },
    {
        label: "Manage Skills",
        description: "Update skills and tools",
        href: "/admin/skills",
        icon: Wrench,
    },
    {
        label: "Manage Experience",
        description: "Update professional experience",
        href: "/admin/experience",
        icon: BriefcaseBusiness,
    },
    {
        label: "Manage Projects",
        description: "Add or edit portfolio projects",
        href: "/admin/projects",
        icon: FolderKanban,
    },
    {
        label: "Manage Education",
        description: "Update academic qualifications",
        href: "/admin/education",
        icon: GraduationCap,
    },
    {
        label: "Manage Certifications",
        description: "Manage professional certifications",
        href: "/admin/certifications",
        icon: Award,
    },
    {
        label: "Manage Contact",
        description: "Update contact details and links",
        href: "/admin/contact",
        icon: Mail,
    },
    {
        label: "Navigation",
        description: "Manage website menu and CTA",
        href: "/admin/navigation",
        icon: Menu,
    },
    {
        label: "Media Library",
        description: "Manage images, videos and documents",
        href: "/admin/media",
        icon: Image,
    },
    {
        label: "Site Settings",
        description: "Manage website identity and metadata",
        href: "/admin/settings",
        icon: Settings,
    },
];

async function getCount(table, unpublishedOnly = false) {
    let query = supabase
        .from(table)
        .select("id", { count: "exact", head: true });

    if (unpublishedOnly) {
        query = query.eq("is_published", false);
    }

    const { count, error } = await query;

    if (error) throw error;

    return count ?? 0;
}

async function loadRecentActivity() {
    const [projects, experiences, education, certifications] =
        await Promise.all([
            supabase
                .from("projects")
                .select("id, title, updated_at, is_published")
                .order("updated_at", { ascending: false })
                .limit(5),

            supabase
                .from("experiences")
                .select("id, role, company, updated_at, is_published")
                .order("updated_at", { ascending: false })
                .limit(5),

            supabase
                .from("education")
                .select(
                    "id, institution, qualification, updated_at, is_published"
                )
                .order("updated_at", { ascending: false })
                .limit(5),

            supabase
                .from("certifications")
                .select("id, title, issuer, updated_at, is_published")
                .order("updated_at", { ascending: false })
                .limit(5),
        ]);

    const results = [projects, experiences, education, certifications];

    const failed = results.find((result) => result.error);
    if (failed) throw failed.error;

    const activity = [
        ...projects.data.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: "Portfolio project",
            type: "project",
            typeLabel: "PROJECT",
            updated_at: item.updated_at,
            is_published: item.is_published,
            href: "/admin/projects",
        })),

        ...experiences.data.map((item) => ({
            id: item.id,
            title: item.role,
            subtitle: item.company,
            type: "experience",
            typeLabel: "EXPERIENCE",
            updated_at: item.updated_at,
            is_published: item.is_published,
            href: "/admin/experience",
        })),

        ...education.data.map((item) => ({
            id: item.id,
            title: item.institution,
            subtitle: item.qualification,
            type: "education",
            typeLabel: "EDUCATION",
            updated_at: item.updated_at,
            is_published: item.is_published,
            href: "/admin/education",
        })),

        ...certifications.data.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.issuer,
            type: "certification",
            typeLabel: "CERTIFICATION",
            updated_at: item.updated_at,
            is_published: item.is_published,
            href: "/admin/certifications",
        })),
    ];

    return activity
        .sort(
            (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
        )
        .slice(0, 5);
}

function formatActivityDate(date) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function AdminDashboard() {
    const [stats, setStats] = useState({
        sections: 0,
        projects: 0,
        media: 0,
        unpublished: 0,
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);
    const [error, setError] = useState("");
    const [activityError, setActivityError] = useState("");

    async function loadDashboard() {
        setLoading(true);
        setActivityLoading(true);
        setError("");
        setActivityError("");

        try {
            const [
                sections,
                projects,
                media,
                draftCounts,
                activity,
            ] = await Promise.all([
                getCount("portfolio_sections"),
                getCount("projects"),
                getCount("media_assets"),
                Promise.all(
                    contentTables.map((table) => getCount(table, true))
                ),
                loadRecentActivity(),
            ]);

            setStats({
                sections,
                projects,
                media,
                unpublished: draftCounts.reduce(
                    (total, count) => total + count,
                    0
                ),
            });

            setRecentActivity(activity);
        } catch (err) {
            console.error("Unable to load dashboard:", err);
            setError("Some dashboard statistics could not be loaded.");
            setActivityError("Unable to load recent activity.");
        } finally {
            setLoading(false);
            setActivityLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    const overviewCards = [
        {
            title: "Portfolio Sections",
            value: stats.sections,
            description: "Managed content areas",
            icon: Layers3,
        },
        {
            title: "Projects",
            value: stats.projects,
            description: "Portfolio projects",
            icon: FolderKanban,
        },
        {
            title: "Media Assets",
            value: stats.media,
            description: "Images, videos and documents",
            icon: Image,
        },
        {
            title: "Unpublished Content",
            value: stats.unpublished,
            description: "Draft records awaiting publication",
            icon: FileEdit,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Welcome back, Salim
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Manage your portfolio content, projects and website
                        settings from one place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={loading}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Statistics
                </button>
            </section>

            {/* Overview cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">
                                    {card.title}
                                </span>

                                <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
                                    <Icon size={19} />
                                </div>
                            </div>

                            <h3 className="mt-5 text-3xl font-semibold text-white">
                                {loading
                                    ? "—"
                                    : card.value.toLocaleString()}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </section>

            {error && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                    {error} Check the browser console for details.
                </div>
            )}

            {/* Recent Activity */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock3 size={19} className="text-violet-400" />
                            <h3 className="text-lg font-semibold text-white">
                                Recent Activity
                            </h3>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                            Your five most recently updated portfolio records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadDashboard}
                        disabled={activityLoading}
                        className="inline-flex w-fit items-center gap-2 text-sm text-violet-400 transition hover:text-violet-300 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={activityLoading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="mt-5 divide-y divide-white/[0.06]">
                    {activityLoading ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                            <RefreshCw size={16} className="animate-spin" />
                            Loading recent activity...
                        </div>
                    ) : activityError ? (
                        <div className="py-8 text-center text-sm text-amber-400">
                            {activityError}
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                            <FileClock
                                size={28}
                                className="text-slate-500"
                            />
                            <p className="mt-3 text-sm text-slate-300">
                                No recent activity yet.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Your content updates will appear here.
                            </p>
                        </div>
                    ) : (
                        recentActivity.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="mt-0.5 rounded-lg bg-violet-500/10 p-2 text-violet-400">
                                        {item.type === "project" && (
                                            <FolderKanban size={17} />
                                        )}
                                        {item.type === "experience" && (
                                            <BriefcaseBusiness size={17} />
                                        )}
                                        {item.type === "education" && (
                                            <GraduationCap size={17} />
                                        )}
                                        {item.type === "certification" && (
                                            <Award size={17} />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium text-slate-200">
                                                {item.title || "Untitled record"}
                                            </p>

                                            <span className="inline-flex shrink-0 items-center rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-violet-300">
                                                {item.typeLabel}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {item.subtitle || "No additional details"}
                                        </p>

                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock3 size={12} />
                                            Updated{" "}
                                            {formatActivityDate(item.updated_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-11 sm:pl-0">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${item.is_published
                                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                                                : "border-amber-400/20 bg-amber-500/10 text-amber-400"
                                            }`}
                                    >
                                        <CheckCircle2 size={12} />
                                        {item.is_published
                                            ? "Published"
                                            : "Draft"}
                                    </span>

                                    <Link
                                        to={item.href}
                                        className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Quick Actions
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        Quickly access all your portfolio management areas.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.href}
                                to={action.href}
                                className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-violet-400/30 hover:bg-violet-500/[0.05]"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                                        <Icon size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            {action.label}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>

                                <ArrowUpRight
                                    size={17}
                                    className="shrink-0 text-slate-500 transition group-hover:text-violet-400"
                                />
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Website Preview */}
            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.10] to-[#11151f] p-6 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Your Public Portfolio
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        Visit your website to see how your portfolio looks to
                        visitors.
                    </p>
                </div>

                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                    View Website
                    <ExternalLink size={16} />
                </a>
            </section>
        </div>
    );
}

export default AdminDashboard;
