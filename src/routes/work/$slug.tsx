import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Reveal } from "@/components/site/Reveal";
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
  if (!body) return null;
  return (
    <Reveal className="grid gap-6 border-t border-border py-12 md:grid-cols-[1fr_1.6fr]">
      <h2 className="eyebrow pt-1">{heading}</h2>
      <p className="max-w-2xl text-lg leading-relaxed">{body}</p>
    </Reveal>
  );
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

  return (
    <PublicLayout>
      <article>
        <header className="shell pb-12 pt-16 lg:pt-24">
          <Link
            to="/work"
            className="link-underline inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Work
          </Link>
          <h1 className="display rise mt-8 max-w-5xl text-[clamp(2.8rem,9vw,7rem)]">
            {project.title}
          </h1>
          <p className="rise mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        </header>

        <div className="shell">
          <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-secondary">
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
        </div>

        <div className="shell">
          <dl className="grid grid-cols-2 gap-8 border-t border-border py-12 md:grid-cols-3 lg:grid-cols-6">
            <Meta label="Role" value={project.role} />
            <Meta label="Client" value={project.client} />
            <Meta label="Timeline" value={project.timeline} />
            <Meta label="Platform" value={project.platform} />
            <Meta label="Category" value={project.category} />
            <Meta label="Year" value={project.year} />
          </dl>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Block heading="Overview" body={project.description} />
          <Block heading="Problem" body={project.problem} />
          <Block heading="Goals" body={project.goals} />
          <Block heading="Research & Discovery" body={project.research} />
          <Block heading="Design Process" body={project.design_process} />
          <Block heading="Final Design" body={project.final_design} />
          <Block heading="Outcome & Impact" body={project.outcome} />

          {sections.map((section) => (
            <Reveal
              key={section.id}
              className="grid gap-6 border-t border-border py-12 md:grid-cols-[1fr_1.6fr]"
            >
              <h2 className="eyebrow pt-1">{section.heading}</h2>
              <div className="max-w-2xl">
                {section.section_type === "quote" ? (
                  <blockquote className="display text-3xl leading-tight">{section.body}</blockquote>
                ) : section.section_type === "list" ? (
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-lg">
                        <span className="text-accent">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  section.body && <p className="text-lg leading-relaxed">{section.body}</p>
                )}

                {section.images.length > 0 && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {section.images.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt={section.caption || section.heading}
                        loading="lazy"
                        className="w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                )}
                {section.caption && (
                  <p className="mt-3 text-xs text-muted-foreground">{section.caption}</p>
                )}
              </div>
            </Reveal>
          ))}

          {project.gallery.length > 0 && (
            <Reveal className="border-t border-border py-12">
              <h2 className="eyebrow">Gallery</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {project.gallery.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${project.title} detail`}
                    loading="lazy"
                    className="w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </Reveal>
          )}

          <Block heading="Additional Notes" body={project.notes} />
        </div>

        <nav className="shell flex items-stretch justify-between gap-6 border-t border-border py-14">
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
