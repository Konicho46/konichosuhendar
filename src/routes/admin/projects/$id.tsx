import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell, btnGhost } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { projectQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/admin/projects/$id")({
  head: () => ({
    meta: [
      { title: "Edit Project — Portfolio CMS" },
      { name: "description", content: "Edit a portfolio project." },
      { property: "og:title", content: "Edit Project — Portfolio CMS" },
      { property: "og:description", content: "Edit a portfolio project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const { data: project, isLoading, error } = useQuery(projectQuery(id));

  if (isLoading) {
    return (
      <AdminShell title="Edit project">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (error || !project) {
    return (
      <AdminShell title="Project not found">
        <p className="text-sm text-muted-foreground">
          This project no longer exists or you don't have access to it.
        </p>
        <Link to="/admin/projects" className={`${btnGhost} mt-6`}>
          Back to projects
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={project.title}
      description={`/work/${project.slug}`}
      actions={
        <Link to="/work/$slug" params={{ slug: project.slug }} className={btnGhost}>
          View live
        </Link>
      }
    >
      <ProjectForm project={project} />
    </AdminShell>
  );
}
