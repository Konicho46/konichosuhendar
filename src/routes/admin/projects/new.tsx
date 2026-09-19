import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const Route = createFileRoute("/admin/projects/new")({
  head: () => ({
    meta: [
      { title: "New Project — Portfolio CMS" },
      { name: "description", content: "Create a new portfolio project." },
      { property: "og:title", content: "New Project — Portfolio CMS" },
      { property: "og:description", content: "Create a new portfolio project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewProject,
});

function NewProject() {
  return (
    <AdminShell title="New project" description="Save the project first, then add slider images.">
      <ProjectForm />
    </AdminShell>
  );
}
