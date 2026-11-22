import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";
import { skillsData } from "../data/skills";

const defaults = [
    { title: skillsData.technical.title, group_key: "technical", skills: skillsData.technical.skills },
    { title: skillsData.professional.title, group_key: "professional", skills: skillsData.professional.skills },
    { title: skillsData.soft.title, group_key: "soft", skills: skillsData.soft.skills },
];

export default function SkillsAdmin() {
    const [groups, setGroups] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [newGroup, setNewGroup] = useState("");
    const [newSkills, setNewSkills] = useState({});

    async function loadData() {
        setLoading(true);
        const [g, s] = await Promise.all([
            supabase.from("skill_groups").select("*").order("sort_order"),
            supabase.from("skills").select("*").order("sort_order"),
        ]);
        if (g.error || s.error) {
            setMessage(g.error?.message || s.error?.message || "Unable to load skills.");
        } else {
            setGroups(g.data || []);
            setSkills(s.data || []);
        }
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    async function importDefaults() {
        if (groups.length || busy) return;
        setBusy(true);
        setMessage("");
        try {
            for (let i = 0; i < defaults.length; i++) {
                const item = defaults[i];
                const { data: group, error } = await supabase
                    .from("skill_groups")
                    .insert({ title: item.title, group_key: item.group_key, sort_order: i, is_published: true })
                    .select().single();
                if (error) throw error;

                const rows = item.skills.map((name, index) => ({
                    group_id: group.id, name, sort_order: index, is_published: true,
                }));
                const { error: skillError } = await supabase.from("skills").insert(rows);
                if (skillError) throw skillError;
            }
            setMessage("Your existing 17 skills have been imported.");
            await loadData();
        } catch (error) {
            setMessage(`Import stopped: ${error.message}. Check the groups already created before retrying.`);
        } finally {
            setBusy(false);
        }
    }

    async function updateGroup(group, changes) {
        const { error } = await supabase.from("skill_groups").update(changes).eq("id", group.id);
        if (error) setMessage(error.message);
        else {
            setGroups((current) => current.map((g) => g.id === group.id ? { ...g, ...changes } : g));
            setMessage("Group updated.");
        }
    }

    async function addGroup() {
        const title = newGroup.trim();
        if (!title) return;
        const key = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        setBusy(true);
        const { error } = await supabase.from("skill_groups").insert({
            title, group_key: key, sort_order: groups.length, is_published: false,
        });
        setBusy(false);
        if (error) setMessage(error.message);
        else { setNewGroup(""); setMessage("Group created as a draft."); await loadData(); }
    }

    async function addSkill(group) {
        const name = (newSkills[group.id] || "").trim();
        if (!name) return;
        const count = skills.filter((s) => s.group_id === group.id).length;
        const { error } = await supabase.from("skills").insert({
            group_id: group.id, name, sort_order: count, is_published: false,
        });
        if (error) setMessage(error.message);
        else {
            setNewSkills((v) => ({ ...v, [group.id]: "" }));
            setMessage("Skill added as a draft.");
            await loadData();
        }
    }

    async function updateSkill(skill, changes) {
        const { error } = await supabase.from("skills").update(changes).eq("id", skill.id);
        if (error) setMessage(error.message);
        else setSkills((current) => current.map((s) => s.id === skill.id ? { ...s, ...changes } : s));
    }

    async function deleteSkill(skill) {
        if (!window.confirm(`Delete "${skill.name}"?`)) return;
        const { error } = await supabase.from("skills").delete().eq("id", skill.id);
        if (error) setMessage(error.message);
        else { setSkills((current) => current.filter((s) => s.id !== skill.id)); setMessage("Skill deleted."); }
    }

    async function moveSkill(groupSkills, index, direction) {
        const otherIndex = index + direction;
        if (otherIndex < 0 || otherIndex >= groupSkills.length) return;
        const first = groupSkills[index];
        const second = groupSkills[otherIndex];
        const { error } = await Promise.all([
            supabase.from("skills").update({ sort_order: second.sort_order }).eq("id", first.id),
            supabase.from("skills").update({ sort_order: first.sort_order }).eq("id", second.id),
        ]).then((results) => ({ error: results.find((r) => r.error)?.error }));
        if (error) setMessage(error.message);
        else await loadData();
    }

    async function moveGroup(index, direction) {
        const otherIndex = index + direction;
        if (otherIndex < 0 || otherIndex >= groups.length) return;
        const first = groups[index];
        const second = groups[otherIndex];
        const results = await Promise.all([
            supabase.from("skill_groups").update({ sort_order: second.sort_order }).eq("id", first.id),
            supabase.from("skill_groups").update({ sort_order: first.sort_order }).eq("id", second.id),
        ]);
        const error = results.find((r) => r.error)?.error;
        if (error) setMessage(error.message);
        else await loadData();
    }

    if (loading) return <div className="p-8 text-white/70">Loading Skills...</div>;

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-6 text-white">
            <div>
                <h1 className="text-3xl font-bold">Skills Management</h1>
                <p className="mt-2 text-sm text-white/60">Manage the three skill lanes displayed on your public portfolio.</p>
            </div>

            {message && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{message}</div>}

            {groups.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h2 className="font-semibold">Import existing portfolio skills</h2>
                    <p className="my-2 text-sm text-white/60">This imports your current three groups and all 17 skills. It is available only while no skill groups exist in the database.</p>
                    <button onClick={importDefaults} disabled={busy} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#A678B9] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                        <Upload size={16} /> {busy ? "Importing..." : "Import existing 17 skills"}
                    </button>
                </div>
            )}

            {groups.map((group, index) => {
                const groupSkills = skills.filter((s) => s.group_id === group.id).sort((a, b) => a.sort_order - b.sort_order);
                return (
                    <section key={group.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                value={group.title}
                                onChange={(e) => setGroups((v) => v.map((g) => g.id === group.id ? { ...g, title: e.target.value } : g))}
                                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-lg font-semibold"
                            />
                            <button onClick={() => updateGroup(group, { title: group.title })} title="Save group title" className="rounded-lg bg-white/10 p-2"><Save size={17} /></button>
                            <button onClick={() => moveGroup(index, -1)} disabled={index === 0} className="rounded-lg bg-white/10 p-2 disabled:opacity-30"><ChevronUp size={17} /></button>
                            <button onClick={() => moveGroup(index, 1)} disabled={index === groups.length - 1} className="rounded-lg bg-white/10 p-2 disabled:opacity-30"><ChevronDown size={17} /></button>
                            <button onClick={() => updateGroup(group, { is_published: !group.is_published })} className={`rounded-full px-3 py-2 text-xs font-semibold ${group.is_published ? "bg-green-500/15 text-green-300" : "bg-white/10 text-white/60"}`}>
                                {group.is_published ? "Published" : "Draft"}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-white/40">Key: {group.group_key} ? {groupSkills.length} skills</p>

                        <div className="mt-4 space-y-2">
                            {groupSkills.map((skill, i) => (
                                <div key={skill.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-black/20 p-2">
                                    <input
                                        value={skill.name}
                                        onChange={(e) => setSkills((v) => v.map((s) => s.id === skill.id ? { ...s, name: e.target.value } : s))}
                                        onBlur={() => updateSkill(skill, { name: skill.name })}
                                        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm outline-none"
                                    />
                                    <button onClick={() => moveSkill(groupSkills, i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-20"><ChevronUp size={16} /></button>
                                    <button onClick={() => moveSkill(groupSkills, i, 1)} disabled={i === groupSkills.length - 1} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-20"><ChevronDown size={16} /></button>
                                    <button onClick={() => updateSkill(skill, { is_published: !skill.is_published })} className={`rounded-full px-2.5 py-1 text-xs ${skill.is_published ? "bg-green-500/15 text-green-300" : "bg-white/10 text-white/60"}`}>
                                        {skill.is_published ? "Live" : "Draft"}
                                    </button>
                                    <button onClick={() => deleteSkill(skill)} className="rounded-lg p-1.5 text-red-300 hover:bg-red-500/10"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <input
                                value={newSkills[group.id] || ""}
                                onChange={(e) => setNewSkills((v) => ({ ...v, [group.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && addSkill(group)}
                                placeholder="Add a skill..."
                                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                            />
                            <button onClick={() => addSkill(group)} className="inline-flex items-center gap-2 rounded-xl bg-[#A678B9] px-4 py-2 text-sm font-semibold"><Plus size={16} /> Add</button>
                        </div>
                    </section>
                );
            })}

            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGroup()} placeholder="New skill group title..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm" />
                <button onClick={addGroup} disabled={busy || !newGroup.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#A678B9] px-4 py-2 text-sm font-semibold disabled:opacity-40"><Plus size={16} /> Add group</button>
            </div>
        </div>
    );
}
