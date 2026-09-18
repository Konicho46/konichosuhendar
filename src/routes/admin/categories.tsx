import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnPrimary, inputClass } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { projectCategoriesQuery, type ProjectCategory } from "@/lib/portfolio";
import { moveItem, normalizedOrder } from "@/lib/reorder";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Portfolio CMS" }, { name: "description", content: "Manage portfolio project categories." }, { property: "og:title", content: "Categories — Portfolio CMS" }, { property: "og:description", content: "Manage portfolio project categories." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(projectCategoriesQuery);
  const list = [...data].sort((a, b) => a.sort_order - b.sort_order);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["project-categories"] });
  const add = useMutation({ mutationFn: async () => { const { error } = await supabase.from("project_categories").insert({ name: `New category ${list.length + 1}`, sort_order: list.length + 1 }); if (error) throw new Error(error.message); }, onSuccess: invalidate, onError: (error: Error) => toast.error(error.message) });
  const save = useMutation({ mutationFn: async (category: ProjectCategory) => { const { error } = await supabase.from("project_categories").update({ name: category.name }).eq("id", category.id); if (error) throw new Error(error.message); }, onSuccess: () => { invalidate(); toast.success("Category saved"); }, onError: (error: Error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("project_categories").delete().eq("id", id); if (error) throw new Error(error.message); }, onSuccess: invalidate, onError: (error: Error) => toast.error(error.message) });
  const reorder = useMutation({ mutationFn: async ({ index, direction }: { index: number; direction: -1 | 1 }) => { const ordered = normalizedOrder(moveItem(list, index, direction)); const results = await Promise.all(ordered.map(({ id, sort_order }) => supabase.from("project_categories").update({ sort_order }).eq("id", id))); const failed = results.find((result) => result.error); if (failed?.error) throw new Error(failed.error.message); }, onSuccess: invalidate, onError: (error: Error) => toast.error(error.message) });

  return <AdminShell title="Categories" description="Options used by project filters and project forms." actions={<button type="button" className={btnPrimary} onClick={() => add.mutate()}><Plus className="h-4 w-4" /> Add category</button>}>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : <div className="space-y-3">{list.map((category, index) => <CategoryRow key={category.id} category={category} first={index === 0} last={index === list.length - 1} onMove={(direction) => reorder.mutate({ index, direction })} onSave={(next) => save.mutate(next)} onDelete={() => remove.mutate(category.id)} />)}</div>}
  </AdminShell>;
}

function CategoryRow({ category, first, last, onMove, onSave, onDelete }: { category: ProjectCategory; first: boolean; last: boolean; onMove: (direction: -1 | 1) => void; onSave: (category: ProjectCategory) => void; onDelete: () => void }) {
  const [name, setName] = useState(category.name);
  return <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-end">
    <div className="flex sm:flex-col"><Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={first} onClick={() => onMove(-1)}><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button></div>
    <label className="min-w-0"><span className="eyebrow">Name</span><input className={`${inputClass} mt-2`} value={name} onChange={(event) => setName(event.target.value)} /></label>
    <Button type="button" className="col-start-2 sm:col-auto" onClick={() => onSave({ ...category, name })}>Save</Button>
    <Button type="button" variant="ghost" size="icon" aria-label="Delete category" onClick={onDelete}><Trash2 /></Button>
  </div>;
}