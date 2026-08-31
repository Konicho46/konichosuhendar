import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnPrimary, inputClass } from "@/components/admin/AdminShell";
import { skillsQuery, type Skill } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/skills")({
  component: SkillsAdmin,
});

function SkillsAdmin() {
  const queryClient = useQueryClient();
  const { data: skills, isLoading } = useQuery(skillsQuery);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["skills"] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("skills")
        .insert({ name: "New skill", sort_order: (skills?.length ?? 0) + 1 });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: async (skill: Skill) => {
      const { error } = await supabase
        .from("skills")
        .update({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          sort_order: skill.sort_order,
        })
        .eq("id", skill.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Skill saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="Skills & Tools"
      description="Capabilities and tools listed on the about page."
      actions={
        <button type="button" className={btnPrimary} onClick={() => add.mutate()}>
          <Plus className="h-4 w-4" /> Add skill
        </button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {(skills ?? []).map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              onSave={(next) => save.mutate(next)}
              onDelete={() => remove.mutate(skill.id)}
            />
          ))}
          {(skills ?? []).length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No skills added yet.
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function SkillRow({
  skill,
  onSave,
  onDelete,
}: {
  skill: Skill;
  onSave: (skill: Skill) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(skill);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border p-4">
      <label className="min-w-40 flex-1">
        <span className="eyebrow">Name</span>
        <input
          className={`${inputClass} mt-2`}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </label>
      <label className="min-w-36">
        <span className="eyebrow">Category</span>
        <select
          className={`${inputClass} mt-2`}
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        >
          <option value="Capability">Capability</option>
          <option value="Tool">Tool</option>
        </select>
      </label>
      <label className="min-w-28">
        <span className="eyebrow">Level</span>
        <input
          className={`${inputClass} mt-2`}
          placeholder="Advanced"
          value={draft.level}
          onChange={(e) => setDraft({ ...draft, level: e.target.value })}
        />
      </label>
      <label className="w-20">
        <span className="eyebrow">Order</span>
        <input
          type="number"
          className={`${inputClass} mt-2`}
          value={draft.sort_order}
          onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
        />
      </label>
      <button type="button" className={btnPrimary} onClick={() => onSave(draft)}>
        Save
      </button>
      <button
        type="button"
        aria-label="Delete skill"
        onClick={onDelete}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
