import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { projectCategoriesQuery, publishedProjectsQuery } from "@/lib/portfolio";
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
  loader: async ({ context }) => {
    const [projects, categories] = await Promise.all([
      context.queryClient.ensureQueryData(publishedProjectsQuery),
      context.queryClient.ensureQueryData(projectCategoriesQuery),
    ]);
    return { projects, categories };
  },
  component: Work,
});

function Work() {
  const { projects, categories: masterCategories } = Route.useLoaderData();
  const [filter, setFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set([...masterCategories.map((item) => item.name), ...projects.flatMap((project) => [project.category, ...project.tags])]))],
    [masterCategories, projects],
  );

  const categoryCounts = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category,
          category === "All"
            ? projects.length
            : projects.filter((project) =>
                project.category === category || project.tags.includes(category),
              ).length,
        ]),
      ),
    [categories, projects],
  );

  const visible = useMemo(() => {
    const list = projects;
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
      <section className="site-shell pb-10 pt-20 lg:pb-16 lg:pt-28">
        <p className="mono-label rise text-accent">Project index</p>
        <h1 className="display rise mt-5 text-[clamp(3rem,9vw,8rem)] uppercase">Project</h1>
        <p className="rise mt-6 max-w-lg text-muted-foreground">
          Case studies from complex systems, consumer mobile and everything in between.
        </p>
      </section>

      <div className="sticky top-16 z-30 max-w-full overflow-hidden border-y border-border/70 bg-background/95 backdrop-blur-md lg:hidden">
        <div
          className="flex w-full max-w-full gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Filter projects by category"
        >
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={filter === category ? "default" : "outline"}
              size="sm"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
              className="shrink-0 rounded-none shadow-none"
            >
              {category}
              <span className="text-[10px] opacity-65">{categoryCounts.get(category)}</span>
            </Button>
          ))}
        </div>
      </div>

      <section className="site-shell grid items-start gap-12 pb-28 pt-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:pt-0 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-16">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 lg:block">
          <p className="eyebrow mb-5">Work index</p>
          <nav className="space-y-1" aria-label="Filter projects by category">
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant="ghost"
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
                className={cn(
                  "grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] justify-start rounded-none border-b border-dashed border-border px-3 py-3 text-left shadow-none",
                  filter === category
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="min-w-0 truncate">{category}</span>
                <span className="shrink-0 text-xs opacity-60">{categoryCounts.get(category)}</span>
              </Button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-5">
            <div className="min-w-0">
              <p className="eyebrow">Showing</p>
              <h2 className="display mt-2 truncate text-3xl sm:text-4xl">{filter === "All" ? "All projects" : filter}</h2>
            </div>
            <p className="shrink-0 text-sm text-muted-foreground">
              {visible.length} {visible.length === 1 ? "project" : "projects"}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="border border-dashed border-border py-24 text-center">
              <p className="display text-3xl">Nothing here yet</p>
              <p className="mt-3 text-sm text-muted-foreground">
                No projects match this category — try another filter.
              </p>
            </div>
          ) : (
            <div className="grid border-l border-t border-dashed border-border md:grid-cols-2 xl:grid-cols-3">
              {visible.map((project, i) => (
                <Reveal key={project.id} delay={(i % 2) * 90}>
                  <ProjectCard project={project} priority={i < 2} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
