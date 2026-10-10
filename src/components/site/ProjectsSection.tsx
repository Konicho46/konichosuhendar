import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import type { Project, ProjectCategory } from "@/lib/portfolio";

export function ProjectsSection({ projects, categories }: { projects: Project[]; categories: ProjectCategory[] }) {
  const [filter, setFilter] = useState("All");
  const options = Array.from(new Set([...categories.map((category) => category.name), ...projects.flatMap((project) => [project.category, ...project.tags])])).filter(Boolean);
  const visible = projects.filter((project) => filter === "All" || project.category === filter || project.tags.includes(filter));

  return (
    <section id="project" aria-labelledby="project-title" className="portfolio-section border-t border-border py-16 md:py-24">
      <div className="portfolio-shell max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div><h2 id="project-title" className="display text-3xl sm:text-5xl">Project</h2><p className="mono-label mt-3 text-muted-foreground">{visible.length} projects</p></div>
          <select aria-label="Filter projects by category" value={filter} onChange={(event) => setFilter(event.target.value)} className="max-w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="All">All projects</option>
            {options.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        {visible.length ? <div className="project-masonry columns-1 gap-5 md:columns-2 lg:columns-3">
          {visible.map((project, index) => <div key={project.id} className="mb-5 break-inside-avoid"><ProjectCard project={project} large={index % 3 === 1} priority={index < 3} /></div>)}
        </div> : <p className="py-16 text-muted-foreground">No projects in this category yet.</p>}
      </div>
    </section>
  );
}