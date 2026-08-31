import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnGhost, btnPrimary, inputClass } from "@/components/admin/AdminShell";
import { experiencesQuery, type Experience } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/experience")({
  component: ExperienceAdmin,
});

function ExperienceAdmin() {
  const queryClient = useQueryClient();
  const { data: experiences, isLoading } = useQuery(experiencesQuery);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["experiences"] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("experiences").insert({
        company: "New company",
        position: "Role",
        sort_order: (experiences?.length ?? 0) + 1,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: async (item: Experience) => {
      const { error } = await supabase
        .from("experiences")
        .update({
          company: item.company,
          position: item.position,
          start_date: item.start_date,
          end_date: item.end_date,
          description: item.description,
          responsibilities: item.responsibilities,
          sort_order: item.sort_order,
        })
        .eq("id", item.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Experience saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="Experience"
      description="Your career timeline, shown on the home and about pages."
      actions={
        <button type="button" className={btnPrimary} onClick={() => add.mutate()}>
          <Plus className="h-4 w-4" /> Add role
        </button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-5">
          {(experiences ?? []).map((item) => (
            <ExperienceCard
              key={item.id}
              item={item}
              onSave={(next) => save.mutate(next)}
              onDelete={() => remove.mutate(item.id)}
            />
          ))}
          {(experiences ?? []).length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No roles added yet.
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function ExperienceCard({
  item,
  onSave,
  onDelete,
}: {
  item: Experience;
  onSave: (item: Experience) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(item);

  return (
    <div className="space-y-4 rounded-2xl border border-border p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Company</span>
          <input
            className={`${inputClass} mt-2`}
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Position</span>
          <input
            className={`${inputClass} mt-2`}
            value={draft.position}
            onChange={(e) => setDraft({ ...draft, position: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Start</span>
          <input
            className={`${inputClass} mt-2`}
            placeholder="2022"
            value={draft.start_date}
            onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">End</span>
          <input
            className={`${inputClass} mt-2`}
            placeholder="Present"
            value={draft.end_date}
            onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow">Description</span>
        <textarea
          className={`${inputClass} mt-2 min-h-20`}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="eyebrow">Responsibilities (one per line)</span>
        <textarea
          className={`${inputClass} mt-2 min-h-24`}
          value={draft.responsibilities.join("\n")}
          onChange={(e) =>
            setDraft({ ...draft, responsibilities: e.target.value.split("\n").filter(Boolean) })
          }
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Order
          <input
            type="number"
            className={`${inputClass} w-20`}
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </label>
        <div className="ml-auto flex gap-3">
          <button type="button" className={btnGhost} onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button type="button" className={btnPrimary} onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
