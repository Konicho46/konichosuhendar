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
      <div className="mono-label flex items-center justify-between gap-4 px-4 py-3 text-accent">
        <span>{project.year}</span>
        <span className="truncate">{project.category}</span>
      </div>
      <div className="px-4 pb-4">
        <h3 className="display text-xl leading-tight transition-colors group-hover:text-accent group-focus-visible:text-accent sm:text-2xl">{project.title}</h3>
      </div>
      <div className={cn("relative overflow-hidden bg-secondary", large ? "aspect-[4/3]" : "aspect-[4/5]")}>
        {project.thumbnail_url ?? project.hero_image_url ? (
          <img
            src={project.thumbnail_url ?? project.hero_image_url ?? ""}
            alt={`${project.title} cover`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full scale-[1.03] object-cover grayscale transition-all duration-700 ease-out group-hover:scale-100 group-hover:grayscale-0 group-focus-visible:scale-100 group-focus-visible:grayscale-0"
          />
        ) : (
          <div className="h-full w-full bg-secondary" aria-hidden="true">
            <div className="h-full w-full animate-pulse bg-muted" />
          </div>
        )}
      </div>
      <div className="project-card-summary overflow-hidden px-4">
        <div className="min-h-0">
          <p className="pt-4 text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
          <p className="mono-label py-4 text-accent">Read more →</p>
        </div>
      </div>
    </Link>
  );
}
