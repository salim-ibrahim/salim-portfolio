
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
    LayoutDashboard,
    House,
    UserRound,
    Wrench,
    BriefcaseBusiness,
    FolderKanban,
    GraduationCap,
    Award,
    Contact,
    Menu,
    X,
    ExternalLink,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Image,
    Globe,
    ChevronRight,
    LogOut,
    Activity,
} from "lucide-react";

const navigationGroups = [
    {
        title: "GENERAL",
        items: [
            {
                name: "Overview",
                path: "/admin",
                icon: LayoutDashboard,
                end: true,
            },
        ],
    },
    {
        title: "PORTFOLIO CONTENT",
        items: [
            { name: "Home", path: "/admin/home", icon: House },
            { name: "About", path: "/admin/about", icon: UserRound },
            { name: "Skills", path: "/admin/skills", icon: Wrench },
            {
                name: "Experience",
                path: "/admin/experience",
                icon: BriefcaseBusiness,
            },
            { name: "Projects", path: "/admin/projects", icon: FolderKanban },
            {
                name: "Education",
                path: "/admin/education",
                icon: GraduationCap,
            },
            {
                name: "Certifications",
                path: "/admin/certifications",
                icon: Award,
            },
            { name: "Contact", path: "/admin/contact", icon: Contact },
        ],
    },
    {
        title: "WEBSITE MANAGEMENT",
        items: [
            { name: "Navigation", path: "/admin/navigation", icon: Globe },
            { name: "Footer", path: "/admin/footer", icon: PanelLeftClose },
            { name: "Media Library", path: "/admin/media", icon: Image },
        ],
    },
];

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(`Logout failed: ${error.message}`);
            return;
        }

        navigate("/admin/login", { replace: true });
    }

    const currentPage =
        navigationGroups
            .flatMap((group) => group.items)
            .find((item) =>
                item.end
                    ? location.pathname === item.path
                    : location.pathname === item.path
            )?.name || "Settings";

    return (
        <div className="admin-shell min-h-screen bg-[#0b0d12] text-slate-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col
                    border-r border-white/[0.07]
                    bg-[#10131b]
                    transition-all duration-300
                    ${sidebarCollapsed ? "w-[84px]" : "w-[260px]"}
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Brand */}
                <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-lg font-bold text-violet-400">
                            S
                        </div>

                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-bold tracking-wide text-white">
                                    SALIM IBRAHIM
                                </h2>
                                <p className="mt-0.5 text-[10px] tracking-[0.18em] text-slate-500">
                                    PORTFOLIO ADMIN
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                    {navigationGroups.map((group) => (
                        <div key={group.title}>
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-600">
                                    {group.title}
                                </p>
                            )}

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.end}
                                            onClick={() => setSidebarOpen(false)}
                                            title={
                                                sidebarCollapsed
                                                    ? item.name
                                                    : undefined
                                            }
                                            className={({ isActive }) => `
                                                group flex items-center gap-3
                                                rounded-xl px-3 py-2.5
                                                text-[13px] font-medium
                                                transition-all duration-200
                                                ${isActive
                                                    ? "bg-violet-500/15 text-violet-300"
                                                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                                                }
                                                ${sidebarCollapsed ? "justify-center" : ""}
                                            `}
                                        >
                                            <Icon
                                                size={18}
                                                className="shrink-0"
                                            />

                                            {!sidebarCollapsed && (
                                                <span className="truncate">
                                                    {item.name}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Settings */}
                    {/* System */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-600">
                                SYSTEM
                            </p>
                        )}

                        <div className="space-y-1">
                            <NavLink
                                to="/admin/activity"
                                title={sidebarCollapsed ? "Activity History" : undefined}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-3 py-2.5
                text-[13px] font-medium transition
                ${isActive
                                        ? "bg-violet-500/15 text-violet-300"
                                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                                    }
                ${sidebarCollapsed ? "justify-center" : ""}
            `}
                            >
                                <Activity size={18} />
                                {!sidebarCollapsed && "Activity History"}
                            </NavLink>

                            <NavLink
                                to="/admin/settings"
                                title={sidebarCollapsed ? "Settings" : undefined}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                flex items-center gap-3 rounded-xl px-3 py-2.5
                text-[13px] font-medium transition
                ${isActive
                                        ? "bg-violet-500/15 text-violet-300"
                                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                                    }
                ${sidebarCollapsed ? "justify-center" : ""}
            `}
                            >
                                <Settings size={18} />
                                {!sidebarCollapsed && "Settings"}
                            </NavLink>
                        </div>
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="border-t border-white/[0.07] p-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white ${sidebarCollapsed ? "justify-center" : ""
                            }`}
                    >
                        <ExternalLink size={17} />
                        {!sidebarCollapsed && "View Public Website"}
                    </a>

                    <button
                        type="button"
                        onClick={() =>
                            setSidebarCollapsed((previous) => !previous)
                        }
                        className="mt-2 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white lg:flex"
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen size={17} />
                        ) : (
                            <>
                                <PanelLeftClose size={17} />
                                Collapse Sidebar
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div
                className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[84px]" : "lg:ml-[260px]"
                    }`}
            >
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#0b0d12]/95 px-5 backdrop-blur-xl sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-semibold text-slate-200">
                                Salim Ibrahim
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Administrator
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/15 text-sm font-semibold text-violet-300">
                            S
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Sign out"
                            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-semibold text-slate-200">
                                Salim Ibrahim
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Administrator
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/15 text-sm font-semibold text-violet-300">
                            S
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
