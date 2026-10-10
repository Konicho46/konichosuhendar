import { Link } from "@tanstack/react-router";
import type { Project } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  large = false,
  priority = false,
}: {
  project: Project;
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      className="group block overflow-hidden rounded-md border border-border transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`${project.title} — view case study`}
    >
      <div className="mono-label flex items-center justify-between gap-3 px-3 py-2 text-accent">
        <span>{project.year}</span>
        <span className="truncate">{project.category}</span>
      </div>
      <div className="px-3 pb-3">
        <h3 className="display text-lg leading-tight">{project.title}</h3>
      </div>
      <div className={cn("relative overflow-hidden bg-secondary", large ? "aspect-[3/2]" : "aspect-square")}>
        {project.thumbnail_url ?? project.hero_image_url ? (
          <img
            src={project.thumbnail_url ?? project.hero_image_url ?? ""}
            alt={`${project.title} cover`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0 group-focus-visible:grayscale-0 motion-reduce:transition-none"
          />
        ) : (
          <div className="h-full w-full bg-secondary" aria-hidden="true">
            <div className="h-full w-full animate-pulse bg-muted" />
          </div>
        )}
      </div>
    </Link>
  );
}
