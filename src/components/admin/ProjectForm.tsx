import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { inputClass } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { projectCategoriesQuery, projectSectionsQuery, slugify, uploadImage, type Project, type ProjectSection } from "@/lib/portfolio";
import { moveItem, normalizedOrder } from "@/lib/reorder";
import { supabase } from "@/integrations/supabase/client";

type Draft = Omit<Project, "id" | "created_at" | "updated_at">;
const emptyDraft: Draft = { slug: "", title: "", summary: "", description: "", category: "Product Design", tags: [], year: String(new Date().getFullYear()), client: "", role: "", timeline: "", platform: "", thumbnail_url: null, hero_image_url: null, gallery: [], problem: "", goals: "", research: "", design_process: "", final_design: "", outcome: "", notes: "", featured: false, published: false, sort_order: 0 };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="eyebrow">{label}</span>{hint && <span className="ml-2 text-xs text-muted-foreground">{hint}</span>}<div className="mt-2">{children}</div></label>;
}

function ImagePicker({ value, onChange, label }: { value: string | null; onChange: (url: string | null) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setBusy(true);
    try { onChange(await uploadImage(file)); toast.success("Image uploaded"); } catch (error) { toast.error((error as Error).message); } finally { setBusy(false); }
  }
  return <Field label={label}>
    <div className="flex flex-wrap items-center gap-3">
      {value && <img src={value} alt="Project preview" className="h-20 w-32 rounded-md object-cover" />}
      <Button asChild type="button" variant="outline"><label className="cursor-pointer"><Upload />{busy ? "Uploading…" : value ? "Replace" : "Upload"}<input type="file" accept="image/*" className="hidden" onChange={onFile} /></label></Button>
      {value && <Button type="button" variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
    </div>
    <input className={`${inputClass} mt-3`} placeholder="…or paste an image URL" value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} />
  </Field>;
}

function CategoryPicker({ options, value, onChange }: { options: string[]; value: string[]; onChange: (value: string[]) => void }) {
  const toggle = (name: string) => onChange(value.includes(name) ? value.filter((item) => item !== name) : [...value, name]);
  return <div><span className="eyebrow">Categories</span><Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="mt-2 flex h-auto min-h-10 w-full justify-between whitespace-normal text-left font-normal"><span className="min-w-0">{value.length ? value.join(", ") : "Choose categories"}</span><ChevronDown className="shrink-0" /></Button></PopoverTrigger><PopoverContent align="start" className="max-h-72 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-2">{options.map((name) => <label key={name} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary"><Checkbox checked={value.includes(name)} onCheckedChange={() => toggle(name)} /><span>{name}</span></label>)}</PopoverContent></Popover></div>;
}

export function ProjectForm({ project }: { project?: Project }) {
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(project ? { ...project } : emptyDraft);
  const initialCategories = Array.from(new Set([...(project?.category ? [project.category] : []), ...(project?.tags ?? [])]));
  const [selectedCategories, setSelectedCategories] = useState(initialCategories.length ? initialCategories : [emptyDraft.category]);
  const { data: categories = [] } = useQuery(projectCategoriesQuery);
  const { data: sections = [] } = useQuery({ ...projectSectionsQuery(project?.id ?? ""), enabled: Boolean(project?.id) });
  const orderedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const categoryOptions = Array.from(new Set([...categories.map((item) => item.name), ...selectedCategories]));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = useMutation({ mutationFn: async (publish?: boolean) => {
    const image = draft.hero_image_url ?? draft.thumbnail_url;
    const payload: Draft = { ...draft, slug: draft.slug ? slugify(draft.slug) : slugify(draft.title), category: selectedCategories[0] ?? "Product Design", tags: selectedCategories, thumbnail_url: image, hero_image_url: image, timeline: "", platform: "", gallery: [], final_design: "", notes: "", ...(publish === undefined ? {} : { published: publish }) };
    if (!payload.title) throw new Error("A title is required"); if (!payload.slug) throw new Error("A slug is required"); if (!/^\d{4}$/.test(payload.year)) throw new Error("Year must contain four digits");
    if (project) { const { error } = await supabase.from("projects").update(payload).eq("id", project.id); if (error) throw new Error(error.message); return project.id; }
    const { data, error } = await supabase.from("projects").insert({ ...payload, sort_order: 9999 }).select("id").single(); if (error) throw new Error(error.message); return data.id;
  }, onSuccess: (id) => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast.success("Saved"); if (!project) navigate({ to: "/admin/projects/$id", params: { id } }); }, onError: (error: Error) => toast.error(error.message) });

  const addImage = useMutation({ mutationFn: async () => { if (!project) return; const { error } = await supabase.from("project_sections").insert({ project_id: project.id, heading: "Case study image", section_type: "gallery", images: [], sort_order: orderedSections.length + 1 }); if (error) throw new Error(error.message); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }), onError: (error: Error) => toast.error(error.message) });
  const saveImage = useMutation({ mutationFn: async (section: ProjectSection) => { const { error } = await supabase.from("project_sections").update({ images: section.images, heading: "Case study image", body: "", items: [], caption: "", section_type: "gallery" }).eq("id", section.id); if (error) throw new Error(error.message); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }); toast.success("Image saved"); }, onError: (error: Error) => toast.error(error.message) });
  const deleteImage = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("project_sections").delete().eq("id", id); if (error) throw new Error(error.message); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }), onError: (error: Error) => toast.error(error.message) });
  function moveImage(index: number, direction: -1 | 1) { const next = normalizedOrder(moveItem(orderedSections, index, direction)); Promise.all(next.map(({ id, sort_order }) => supabase.from("project_sections").update({ sort_order }).eq("id", id))).then((results) => { const failed = results.find((result) => result.error); if (failed?.error) toast.error(failed.error.message); else queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }); }); }

  const textarea = `${inputClass} min-h-28 resize-y`;
  return <div className="space-y-10">
    <section className="grid gap-5 sm:grid-cols-2">
      <Field label="Title"><input className={inputClass} value={draft.title} onChange={(event) => set("title", event.target.value)} /></Field>
      <Field label="Slug"><input className={inputClass} value={draft.slug} placeholder={slugify(draft.title)} onChange={(event) => set("slug", event.target.value)} /></Field>
      <CategoryPicker options={categoryOptions} value={selectedCategories} onChange={setSelectedCategories} />
      <Field label="Year"><input type="number" inputMode="numeric" min="1900" max="2999" className={inputClass} value={draft.year} onChange={(event) => set("year", event.target.value.slice(0, 4))} /></Field>
      <Field label="Client / Company"><input className={inputClass} value={draft.client} onChange={(event) => set("client", event.target.value)} /></Field>
      <Field label="Role"><input className={inputClass} value={draft.role} onChange={(event) => set("role", event.target.value)} /></Field>
    </section>
    <ImagePicker label="Project image" value={draft.hero_image_url ?? draft.thumbnail_url} onChange={(url) => { set("hero_image_url", url); set("thumbnail_url", url); }} />
    <section className="space-y-5">
      <Field label="Summary"><textarea className={textarea} value={draft.summary} onChange={(event) => set("summary", event.target.value)} /></Field>
      {([ ["Overview", "description"], ["Problem", "problem"], ["Goals", "goals"], ["Research / Discovery", "research"], ["Design process", "design_process"], ["Outcome / Impact", "outcome"] ] as const).map(([label, key]) => <Field key={key} label={label} hint="one bullet per line"><textarea className={textarea} value={draft[key]} onChange={(event) => set(key, event.target.value)} /></Field>)}
    </section>
    <section className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex flex-wrap gap-6"><label className="flex items-center gap-3 text-sm"><Checkbox checked={draft.featured} onCheckedChange={(checked) => set("featured", checked === true)} />Featured</label><label className="flex items-center gap-3 text-sm"><Checkbox checked={draft.published} onCheckedChange={(checked) => set("published", checked === true)} />Published</label></div>
      <div className="grid grid-cols-1 gap-2 sm:flex"><Button type="button" variant="outline" disabled={save.isPending} onClick={() => save.mutate(false)}>Save as draft</Button><Button type="button" disabled={save.isPending} onClick={() => save.mutate(undefined)}>{save.isPending ? "Saving…" : "Save"}</Button><Button type="button" disabled={save.isPending} onClick={() => save.mutate(true)}>Publish</Button></div>
    </section>
    {project && <section><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="min-w-0"><h2 className="display text-2xl">Case study images</h2><p className="mt-2 text-sm text-muted-foreground">Images appear in this order in the project slider.</p></div><Button type="button" variant="outline" onClick={() => addImage.mutate()}><ImagePlus /> Add image</Button></div>
      {orderedSections.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No slider images yet.</p> : <div className="mt-5 space-y-4">{orderedSections.map((section, index) => <SectionImageEditor key={section.id} section={section} first={index === 0} last={index === orderedSections.length - 1} onMove={(direction) => moveImage(index, direction)} onSave={(next) => saveImage.mutate(next)} onDelete={() => deleteImage.mutate(section.id)} />)}</div>}
    </section>}
  </div>;
}

function SectionImageEditor({ section, first, last, onMove, onSave, onDelete }: { section: ProjectSection; first: boolean; last: boolean; onMove: (direction: -1 | 1) => void; onSave: (section: ProjectSection) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState(section); const value = draft.images[0] ?? null;
  return <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><div className="flex sm:flex-col"><Button type="button" variant="ghost" size="icon" aria-label="Move image up" disabled={first} onClick={() => onMove(-1)}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move image down" disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button></div><ImagePicker label="Slider image" value={value} onChange={(url) => setDraft({ ...draft, images: url ? [url] : [] })} /><div className="flex gap-2 sm:flex-col"><Button type="button" onClick={() => onSave(draft)}>Save</Button><Button type="button" variant="ghost" size="icon" aria-label="Delete image" onClick={onDelete}><Trash2 /></Button></div></div>;
}
