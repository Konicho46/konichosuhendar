import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell, btnPrimary } from "@/components/admin/AdminShell";
import { allProjectsQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <p className="eyebrow">{label}</p>
      <p className="display mt-3 text-5xl">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { data: projects, isLoading } = useQuery(allProjectsQuery);
  const list = projects ?? [];

  return (
    <AdminShell
      title="Dashboard"
      description="An overview of your portfolio content."
      actions={
        <Link to="/admin/projects/new" className={btnPrimary}>
          New project
        </Link>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total" value={list.length} />
            <Stat label="Published" value={list.filter((p) => p.published).length} />
            <Stat label="Drafts" value={list.filter((p) => !p.published).length} />
            <Stat label="Featured" value={list.filter((p) => p.featured).length} />
          </div>

          <section className="mt-12">
            <h2 className="eyebrow">Recent projects</h2>
            {list.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects yet — create your first case study.
                </p>
                <Link to="/admin/projects/new" className={`${btnPrimary} mt-5`}>
                  New project
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
                {[...list]
                  .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                  .slice(0, 6)
                  .map((project) => (
                    <li key={project.id} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <Link
                          to="/admin/projects/$id"
                          params={{ id: project.id }}
                          className="link-underline text-sm"
                        >
                          {project.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">/work/{project.slug}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          project.published
                            ? "bg-secondary text-foreground"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
