import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
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
      className="group block"
      aria-label={`${project.title} — view case study`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-secondary",
          large ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        {project.thumbnail_url ?? project.hero_image_url ? (
          <img
            src={project.thumbnail_url ?? project.hero_image_url ?? ""}
            alt={`${project.title} cover`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-secondary" aria-hidden="true">
            <div className="h-full w-full animate-pulse bg-muted" />
          </div>
        )}
        {project.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] tracking-wide text-foreground">
            Featured
          </span>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className="display text-2xl sm:text-3xl">{project.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-1">
              {project.category}
            </span>
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1 text-sm text-muted-foreground">
          <span>{project.year}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
