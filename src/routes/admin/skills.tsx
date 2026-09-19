import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inputClass } from "@/components/admin/AdminShell";
import { skillsQuery, type Skill } from "@/lib/portfolio";
import { moveItem, normalizedOrder } from "@/lib/reorder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/skills")({
  head: () => ({ meta: [{ title: "Skills & Tools — Portfolio CMS" }, { name: "description", content: "Manage portfolio skills and tools." }, { property: "og:title", content: "Skills & Tools — Portfolio CMS" }, { property: "og:description", content: "Manage portfolio skills and tools." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SkillsAdmin,
});

type Group = "Capability" | "Tool";

function SkillsAdmin() {
  const queryClient = useQueryClient(); const { data = [], isLoading } = useQuery(skillsQuery); const [tab, setTab] = useState<Group>("Capability");
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["skills"] });
  const visible = data.filter((item) => item.category === tab).sort((a, b) => a.sort_order - b.sort_order);
  const add = useMutation({ mutationFn: async (category: Group) => { const { error } = await supabase.from("skills").insert({ name: category === "Tool" ? "New tool" : "New skill", category, sort_order: visible.length + 1 }); if (error) throw new Error(error.message); }, onSuccess: invalidate, onError: (error: Error) => toast.error(error.message) });
  const save = useMutation({ mutationFn: async (skill: Skill) => { const { error } = await supabase.from("skills").update({ name: skill.name, level: skill.level }).eq("id", skill.id); if (error) throw new Error(error.message); }, onSuccess: () => { invalidate(); toast.success("Saved"); }, onError: (error: Error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("skills").delete().eq("id", id); if (error) throw new Error(error.message); }, onSuccess: invalidate, onError: (error: Error) => toast.error(error.message) });
  function move(index: number, direction: -1 | 1) { const ordered = normalizedOrder(moveItem(visible, index, direction)); Promise.all(ordered.map(({ id, sort_order }) => supabase.from("skills").update({ sort_order }).eq("id", id))).then((results) => { const failed = results.find((result) => result.error); if (failed?.error) toast.error(failed.error.message); else invalidate(); }); }

  const content = (group: Group) => { const list = data.filter((item) => item.category === group).sort((a, b) => a.sort_order - b.sort_order); return <div className="space-y-3">{list.map((skill, index) => <SkillRow key={skill.id} skill={skill} first={index === 0} last={index === list.length - 1} onMove={(direction) => move(index, direction)} onSave={(next) => save.mutate(next)} onDelete={() => remove.mutate(skill.id)} />)}{list.length === 0 && <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No {group === "Tool" ? "tools" : "skills"} added yet.</p>}</div>; };
  return <AdminShell title="Skills & Tools" description="Manage skills and tools separately, without manual order numbers." actions={<Button type="button" onClick={() => add.mutate(tab)}><Plus /> Add {tab === "Tool" ? "tool" : "skill"}</Button>}>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : <Tabs value={tab} onValueChange={(value) => setTab(value as Group)}><TabsList className="mb-5 grid w-full grid-cols-2 sm:w-72"><TabsTrigger value="Capability">Skills</TabsTrigger><TabsTrigger value="Tool">Tools</TabsTrigger></TabsList><TabsContent value="Capability">{content("Capability")}</TabsContent><TabsContent value="Tool">{content("Tool")}</TabsContent></Tabs>}
  </AdminShell>;
}

function SkillRow({ skill, first, last, onMove, onSave, onDelete }: { skill: Skill; first: boolean; last: boolean; onMove: (direction: -1 | 1) => void; onSave: (skill: Skill) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState(skill);
  return <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border p-4 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,.5fr)_auto_auto] sm:items-end">
    <div className="flex sm:flex-col"><Button type="button" variant="ghost" size="icon" aria-label="Move up" disabled={first} onClick={() => onMove(-1)}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move down" disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button></div>
    <label className="min-w-0"><span className="eyebrow">Name</span><input className={`${inputClass} mt-2`} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
    <label className="col-start-2 sm:col-auto"><span className="eyebrow">Level</span><input className={`${inputClass} mt-2`} placeholder="Advanced" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })} /></label>
    <Button type="button" className="col-start-2 sm:col-auto" onClick={() => onSave(draft)}>Save</Button>
    <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${skill.name}`} onClick={onDelete}><Trash2 /></Button>
  </div>;
}
