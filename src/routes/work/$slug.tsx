import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { publishedProjectsQuery, projectSectionsQuery, type Project } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

const projectBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Project | null;
    },
  });

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(projectBySlugQuery(params.slug));
    if (!project) throw notFound();
    const [all, sections] = await Promise.all([
      context.queryClient.ensureQueryData(publishedProjectsQuery),
      context.queryClient.ensureQueryData(projectSectionsQuery(project.id)),
    ]);
    return { title: project.title, summary: project.summary, project, all, sections };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Case study"} — Nathanael Suhendar` },
      { name: "description", content: loaderData?.summary ?? "A product design case study." },
      { property: "og:title", content: `${loaderData?.title ?? "Case study"} — Nathanael Suhendar` },
      { property: "og:description", content: loaderData?.summary ?? "" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      ...((loaderData?.project.hero_image_url ?? loaderData?.project.thumbnail_url)?.startsWith("https://") ? [
        { property: "og:image", content: loaderData?.project.hero_image_url ?? loaderData?.project.thumbnail_url ?? "" },
        { name: "twitter:image", content: loaderData?.project.hero_image_url ?? loaderData?.project.thumbnail_url ?? "" },
      ] : []),
    ],
  }),
  component: ProjectDetail,
});

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-sm">{value}</dd>
    </div>
  );
}

function Block({ heading, body }: { heading: string; body: string }) {
  const items = body.split("\n").map((item) => item.trim()).filter(Boolean);
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[1fr_1.6fr]">
      <h2 className="display text-2xl">{heading}</h2>
      {items.length ? (
      <ul className="max-w-2xl space-y-3">
        {items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-lg leading-relaxed"><span className="text-accent" aria-hidden="true">—</span><span>{item}</span></li>)}
      </ul>
      ) : <p className="text-muted-foreground">Details coming soon.</p>}
    </section>
  );
}

function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  if (!images.length) return null;
  const go = (index: number) => {
    const next = (index + images.length) % images.length;
    setActive(next);
    track.current?.children.item(next)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  return <Reveal className="border-t border-dashed border-border py-12">
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div><h2 className="eyebrow">Case study images</h2><p className="mt-2 text-sm text-muted-foreground">{active + 1} / {images.length}</p></div>
      {images.length > 1 && <div className="flex gap-2"><Button type="button" variant="outline" size="icon" aria-label="Previous image" onClick={() => go(active - 1)}><ChevronLeft /></Button><Button type="button" variant="outline" size="icon" aria-label="Next image" onClick={() => go(active + 1)}><ChevronRight /></Button></div>}
    </div>
    <div ref={track} tabIndex={0} aria-label="Case study image slider" onKeyDown={(event) => { if (event.key === "ArrowLeft") go(active - 1); if (event.key === "ArrowRight") go(active + 1); }} onScroll={(event) => { const element = event.currentTarget; if (element.clientWidth) setActive(Math.round(element.scrollLeft / element.clientWidth)); }} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {images.map((src, index) => <div key={`${src}-${index}`} className="aspect-[16/10] min-w-full snap-start bg-secondary"><img src={src} alt={`${title} case study ${index + 1}`} loading="lazy" className="h-full w-full object-contain" /></div>)}
    </div>
  </Reveal>;
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data: project = null } = useQuery({
    ...projectBySlugQuery(slug),
    initialData: loaderData.project,
  });
  const { data: all = [] } = useQuery({
    ...publishedProjectsQuery,
    initialData: loaderData.all,
  });
  const { data: sections = [] } = useQuery({
    ...projectSectionsQuery(project?.id ?? ""),
    enabled: Boolean(project?.id),
    initialData: loaderData.sections,
  });

  if (!project) return null;

  const ordered = [...all].sort((a, b) => a.sort_order - b.sort_order);
  const index = ordered.findIndex((p) => p.id === project.id);
  const prev = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const sliderImages = [...sections].sort((a, b) => a.sort_order - b.sort_order).flatMap((section) => section.images).filter(Boolean);

  return (
    <PublicLayout>
      <article>
        <header className="portfolio-shell pb-8 pt-10 lg:pt-12">
          <Button asChild variant="outline" size="lg"><Link to="/" hash="project"><ArrowLeft /> Back to Home</Link></Button>
          <p className="mono-label mt-8 text-accent">Project / {project.year}</p>
          <h1 className="display rise mt-4 max-w-5xl break-words text-3xl leading-tight sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>
          <p className="rise mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        </header>

        <Tabs key={project.id} defaultValue="overview" className="portfolio-shell pb-8">
          <div className="max-w-full overflow-x-auto border-b border-border" data-lenis-prevent>
            <TabsList aria-label="Case study stages" className="h-auto min-w-full justify-start gap-1 rounded-none bg-transparent p-0">
              {([
                ["overview", "Overview"], ["problem", "Problem"], ["goals", "Goals"],
                ["research", "Research & Discovery"], ["process", "Design Process"], ["outcome", "Outcome & Impact"],
              ] as const).map(([value, label]) => <TabsTrigger key={value} value={value} className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-4 text-xs data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none sm:text-sm">{label}</TabsTrigger>)}
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-0 min-h-64">
          <Block heading="Overview" body={project.description} />
          <div className="aspect-[16/9] overflow-hidden border border-dashed border-border bg-secondary">
            {project.hero_image_url ?? project.thumbnail_url ? (
              <img
                src={project.hero_image_url ?? project.thumbnail_url ?? ""}
                alt={`${project.title} hero`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-muted" aria-hidden="true" />
            )}
          </div>
           <dl className="grid grid-cols-2 gap-8 border-t border-dashed border-border py-12 md:grid-cols-4">
            <Meta label="Role" value={project.role} />
            <Meta label="Client" value={project.client} />
            <Meta label="Category" value={project.category} />
            <Meta label="Year" value={project.year} />
          </dl>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="mono-label border border-border px-3 py-1.5 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          </TabsContent>
          <TabsContent value="problem" className="mt-0 min-h-64"><Block heading="Problem" body={project.problem} /></TabsContent>
          <TabsContent value="goals" className="mt-0 min-h-64"><Block heading="Goals" body={project.goals} /></TabsContent>
          <TabsContent value="research" className="mt-0 min-h-64"><Block heading="Research & Discovery" body={project.research} /></TabsContent>
          <TabsContent value="process" className="mt-0 min-h-64"><Block heading="Design Process" body={project.design_process} /><ImageSlider images={sliderImages} title={project.title} /></TabsContent>
          <TabsContent value="outcome" className="mt-0 min-h-64"><Block heading="Outcome & Impact" body={project.outcome} /></TabsContent>
        </Tabs>

        <nav className="portfolio-shell flex items-stretch justify-between gap-6 border-t border-dashed border-border py-14">
          {prev ? (
            <Link to="/work/$slug" params={{ slug: prev.slug }} className="group max-w-xs">
              <span className="eyebrow flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="display mt-2 block text-2xl group-hover:text-accent">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/work/$slug"
              params={{ slug: next.slug }}
              className="group max-w-xs text-right"
            >
              <span className="eyebrow flex items-center justify-end gap-2">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="display mt-2 block text-2xl group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </PublicLayout>
  );
}
