import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { publishedProjectsQuery } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Work — Nathanael Suhendar" },
      {
        name: "description",
        content:
          "Selected UI/UX and product design projects by Nathanael Suhendar across mobile and web.",
      },
      { property: "og:title", content: "Work — Nathanael Suhendar" },
      { property: "og:description", content: "Product design case studies: ERP, SaaS, mobile, web." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedProjectsQuery),
  component: Work,
});

function Work() {
  const { data: projects, isLoading } = useQuery(publishedProjectsQuery);
  const [filter, setFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((projects ?? []).map((p) => p.category)))],
    [projects],
  );

  const visible = useMemo(() => {
    const list = projects ?? [];
    const filtered =
      filter === "All"
        ? list
        : list.filter((p) => p.category === filter || p.tags.includes(filter));
    return [...filtered].sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order,
    );
  }, [projects, filter]);

  return (
    <PublicLayout>
      <section className="shell pb-16 pt-20 lg:pt-28">
        <p className="eyebrow rise">Portfolio</p>
        <h1 className="display rise mt-5 text-[clamp(3rem,9vw,7rem)]">Work</h1>
        <p className="rise mt-6 max-w-lg text-muted-foreground">
          Case studies from complex systems, consumer mobile and everything in between.
        </p>

        <div className="mt-12 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all duration-300",
                filter === category
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="shell pb-28">
        {isLoading ? (
          <div className="grid gap-16 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-secondary" />
                <div className="mt-5 h-6 w-1/2 rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="display text-3xl">Nothing here yet</p>
            <p className="mt-3 text-sm text-muted-foreground">
              No projects match this category — try another filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-2">
            {visible.map((project, i) => (
              <Reveal key={project.id} delay={(i % 2) * 90}>
                <ProjectCard project={project} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
