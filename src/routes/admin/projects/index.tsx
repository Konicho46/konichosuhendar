import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnPrimary } from "@/components/admin/AdminShell";
import { allProjectsQuery, type Project } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery(allProjectsQuery);
  const list = [...(projects ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Project> }) => {
      const { error } = await supabase.from("projects").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function move(index: number, direction: -1 | 1) {
    const current = list[index];
    const target = list[index + direction];
    if (!current || !target) return;
    patch.mutate({ id: current.id, values: { sort_order: target.sort_order } });
    patch.mutate({ id: target.id, values: { sort_order: current.sort_order } });
  }

  return (
    <AdminShell
      title="Projects"
      description="Create, order, publish and feature your case studies."
      actions={
        <Link to="/admin/projects/new" className={btnPrimary}>
          New project
        </Link>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="display text-2xl">No projects yet</p>
          <Link to="/admin/projects/new" className={`${btnPrimary} mt-6`}>
            Create your first project
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {list.map((project, index) => (
            <li key={project.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === list.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to="/admin/projects/$id"
                  params={{ id: project.id }}
                  className="link-underline text-sm font-medium"
                >
                  {project.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  /work/{project.slug} · {project.category} · {project.year}
                </p>
              </div>

              <button
                type="button"
                aria-label="Toggle featured"
                onClick={() =>
                  patch.mutate({ id: project.id, values: { featured: !project.featured } })
                }
                className={`rounded-full p-2 transition-colors ${
                  project.featured ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-4 w-4" fill={project.featured ? "currentColor" : "none"} />
              </button>

              <button
                type="button"
                onClick={() =>
                  patch.mutate({ id: project.id, values: { published: !project.published } })
                }
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  project.published
                    ? "bg-secondary text-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {project.published ? "Published" : "Draft"}
              </button>

              <button
                type="button"
                aria-label="Delete project"
                onClick={() => {
                  if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                    remove.mutate(project.id);
                  }
                }}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
