import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { inputClass, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import {
  CATEGORIES,
  projectSectionsQuery,
  slugify,
  uploadImage,
  type Project,
  type ProjectSection,
} from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

type Draft = Omit<Project, "id" | "created_at" | "updated_at">;

const emptyDraft: Draft = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  category: "Product Design",
  tags: [],
  year: String(new Date().getFullYear()),
  client: "",
  role: "",
  timeline: "",
  platform: "",
  thumbnail_url: null,
  hero_image_url: null,
  gallery: [],
  problem: "",
  goals: "",
  research: "",
  design_process: "",
  final_design: "",
  outcome: "",
  notes: "",
  featured: false,
  published: false,
  sort_order: 0,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <img src={value} alt="" className="h-16 w-24 rounded-lg object-cover" />
        )}
        <label className={`${btnGhost} cursor-pointer`}>
          <Upload className="h-4 w-4" />
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {value && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input
        className={`${inputClass} mt-3`}
        placeholder="…or paste an image URL"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </Field>
  );
}

export function ProjectForm({ project }: { project?: Project }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(project ? { ...project } : emptyDraft);
  const [tagInput, setTagInput] = useState((project?.tags ?? []).join(", "));
  const [galleryInput, setGalleryInput] = useState((project?.gallery ?? []).join("\n"));

  const { data: sections } = useQuery({
    ...projectSectionsQuery(project?.id ?? ""),
    enabled: Boolean(project?.id),
  });

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const save = useMutation({
    mutationFn: async (publish?: boolean) => {
      const payload: Draft = {
        ...draft,
        slug: draft.slug ? slugify(draft.slug) : slugify(draft.title),
        tags: tagInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        gallery: galleryInput
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        ...(publish === undefined ? {} : { published: publish }),
      };
      if (!payload.title) throw new Error("A title is required");
      if (!payload.slug) throw new Error("A slug is required");

      if (project) {
        const { error } = await supabase.from("projects").update(payload).eq("id", project.id);
        if (error) throw new Error(error.message);
        return project.id;
      }
      const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data.id as string;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Saved");
      if (!project) navigate({ to: "/admin/projects/$id", params: { id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addSection = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const { error } = await supabase.from("project_sections").insert({
        project_id: project.id,
        heading: "New section",
        sort_order: (sections?.length ?? 0) + 1,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const saveSection = useMutation({
    mutationFn: async (section: ProjectSection) => {
      const { error } = await supabase
        .from("project_sections")
        .update({
          heading: section.heading,
          body: section.body,
          section_type: section.section_type,
          items: section.items,
          images: section.images,
          caption: section.caption,
          sort_order: section.sort_order,
        })
        .eq("id", section.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] });
      toast.success("Section saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_sections").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["project-sections", project?.id ?? ""] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const textarea = `${inputClass} min-h-28 resize-y`;

  return (
    <div className="space-y-10">
      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Title">
          <input
            className={inputClass}
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Slug">
          <input
            className={inputClass}
            value={draft.slug}
            placeholder={slugify(draft.title)}
            onChange={(e) => set("slug", e.target.value)}
          />
        </Field>
        <Field label="Category">
          <select
            className={inputClass}
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tags (comma separated)">
          <input
            className={inputClass}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </Field>
        <Field label="Year">
          <input
            className={inputClass}
            value={draft.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </Field>
        <Field label="Client / Company">
          <input
            className={inputClass}
            value={draft.client}
            onChange={(e) => set("client", e.target.value)}
          />
        </Field>
        <Field label="Role">
          <input
            className={inputClass}
            value={draft.role}
            onChange={(e) => set("role", e.target.value)}
          />
        </Field>
        <Field label="Timeline">
          <input
            className={inputClass}
            value={draft.timeline}
            onChange={(e) => set("timeline", e.target.value)}
          />
        </Field>
        <Field label="Platform">
          <input
            className={inputClass}
            value={draft.platform}
            onChange={(e) => set("platform", e.target.value)}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            className={inputClass}
            value={draft.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <ImagePicker
          label="Thumbnail"
          value={draft.thumbnail_url}
          onChange={(url) => set("thumbnail_url", url)}
        />
        <ImagePicker
          label="Hero image"
          value={draft.hero_image_url}
          onChange={(url) => set("hero_image_url", url)}
        />
      </section>

      <Field label="Gallery image URLs (one per line)">
        <textarea
          className={textarea}
          value={galleryInput}
          onChange={(e) => setGalleryInput(e.target.value)}
        />
      </Field>

      <section className="space-y-5">
        <Field label="Summary">
          <textarea
            className={textarea}
            value={draft.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </Field>
        <Field label="Overview">
          <textarea
            className={textarea}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Problem">
          <textarea
            className={textarea}
            value={draft.problem}
            onChange={(e) => set("problem", e.target.value)}
          />
        </Field>
        <Field label="Goals">
          <textarea
            className={textarea}
            value={draft.goals}
            onChange={(e) => set("goals", e.target.value)}
          />
        </Field>
        <Field label="Research / Discovery">
          <textarea
            className={textarea}
            value={draft.research}
            onChange={(e) => set("research", e.target.value)}
          />
        </Field>
        <Field label="Design process">
          <textarea
            className={textarea}
            value={draft.design_process}
            onChange={(e) => set("design_process", e.target.value)}
          />
        </Field>
        <Field label="Final design">
          <textarea
            className={textarea}
            value={draft.final_design}
            onChange={(e) => set("final_design", e.target.value)}
          />
        </Field>
        <Field label="Outcome / Impact">
          <textarea
            className={textarea}
            value={draft.outcome}
            onChange={(e) => set("outcome", e.target.value)}
          />
        </Field>
        <Field label="Additional notes">
          <textarea
            className={textarea}
            value={draft.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </section>

      <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-border p-5">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Published
        </label>
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            className={btnGhost}
            disabled={save.isPending}
            onClick={() => save.mutate(false)}
          >
            Save as draft
          </button>
          <button
            type="button"
            className={btnPrimary}
            disabled={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className={btnPrimary}
            disabled={save.isPending}
            onClick={() => save.mutate(true)}
          >
            Publish
          </button>
        </div>
      </section>

      {project && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl">Case study sections</h2>
            <button type="button" className={btnGhost} onClick={() => addSection.mutate()}>
              <Plus className="h-4 w-4" /> Add section
            </button>
          </div>

          {(sections ?? []).length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No extra sections yet. Add headings, rich text, lists, quotes or image galleries.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {(sections ?? []).map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onSave={(next) => saveSection.mutate(next)}
                  onDelete={() => deleteSection.mutate(section.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onSave,
  onDelete,
}: {
  section: ProjectSection;
  onSave: (section: ProjectSection) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(section);

  return (
    <div className="space-y-4 rounded-2xl border border-border p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Heading">
          <input
            className={inputClass}
            value={draft.heading}
            onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
          />
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={draft.section_type}
            onChange={(e) => setDraft({ ...draft, section_type: e.target.value })}
          >
            <option value="text">Rich text</option>
            <option value="list">List</option>
            <option value="quote">Quote</option>
            <option value="gallery">Image gallery</option>
          </select>
        </Field>
        <Field label="Order">
          <input
            type="number"
            className={inputClass}
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </Field>
      </div>

      {draft.section_type === "list" ? (
        <Field label="List items (one per line)">
          <textarea
            className={`${inputClass} min-h-24`}
            value={draft.items.join("\n")}
            onChange={(e) =>
              setDraft({ ...draft, items: e.target.value.split("\n").filter(Boolean) })
            }
          />
        </Field>
      ) : (
        <Field label="Body">
          <textarea
            className={`${inputClass} min-h-24`}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          />
        </Field>
      )}

      <Field label="Image URLs (one per line)">
        <textarea
          className={`${inputClass} min-h-20`}
          value={draft.images.join("\n")}
          onChange={(e) =>
            setDraft({ ...draft, images: e.target.value.split("\n").filter(Boolean) })
          }
        />
      </Field>

      <Field label="Caption">
        <input
          className={inputClass}
          value={draft.caption}
          onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
        />
      </Field>

      <div className="flex justify-end gap-3">
        <button type="button" className={btnGhost} onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Delete
        </button>
        <button type="button" className={btnPrimary} onClick={() => onSave(draft)}>
          Save section
        </button>
      </div>
    </div>
  );
}
