import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProject,
});

function NewProject() {
  return (
    <AdminShell title="New project" description="Save the basics first, then add case-study sections.">
      <ProjectForm />
    </AdminShell>
  );
}
