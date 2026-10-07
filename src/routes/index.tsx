import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import {
  experiencesQuery,
  profileQuery,
  publishedProjectsQuery,
  skillsQuery,
} from "@/lib/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nathanael Suhendar — Product Designer" },
      {
        name: "description",
        content:
          "Portfolio of Nathanael Suhendar, a UI/UX and product designer in Sidoarjo, East Java.",
      },
      { property: "og:title", content: "Nathanael Suhendar — Product Designer" },
      {
        property: "og:description",
        content: "Selected product design work: ERP, SaaS, mobile and web.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    const [projects, profile, experiences, skills] = await Promise.all([
      context.queryClient.ensureQueryData(publishedProjectsQuery),
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(experiencesQuery),
      context.queryClient.ensureQueryData(skillsQuery),
    ]);
    return { projects, profile, experiences, skills };
  },
  component: Home,
});

function Home() {
  const { projects, profile, experiences, skills } = Route.useLoaderData();

  const featured = projects.filter((p) => p.featured).slice(0, 2);
  const selected = [...featured, ...projects.filter((p) => !p.featured)].slice(0, 6);
  const capabilities = skills.filter((s) => s.category !== "Tool");
  const tools = skills.filter((s) => s.category === "Tool");

  return (
    <PublicLayout>
      <section className="site-shell pb-16 pt-20 lg:pb-20 lg:pt-28">
        <p className="mono-label rise text-accent">Product designer / portfolio 2026</p>
        <h1
          className="display rise mt-6 max-w-6xl text-[clamp(3.25rem,10vw,9rem)] uppercase leading-[0.84]"
          style={{ animationDelay: "80ms" }}
        >
          {profile?.name ?? "Nathanael Suhendar"}
        </h1>
        <div
          className="rise mt-10 flex flex-col gap-10 border-t border-dashed border-border pt-8 md:flex-row md:items-end md:justify-between"
          style={{ animationDelay: "160ms" }}
        >
          <div className="max-w-lg">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {profile?.intro ??
                "I design digital products that feel obvious to use and quietly delightful to live with."}
            </p>
          </div>
          <p className="mono-label text-muted-foreground">Located in<br /><span className="text-accent">{profile?.location ?? "Sidoarjo, East Java, Indonesia"}</span></p>
        </div>
      </section>

      <section className="site-shell border-t border-dashed border-border py-14 lg:py-20">
        <Reveal className="flex items-baseline justify-between">
          <h2 className="display text-3xl uppercase sm:text-5xl">Selected work</h2>
          <Link to="/work" className="mono-label text-muted-foreground hover:text-accent">
            All projects →
          </Link>
        </Reveal>
        <div className="mt-10 grid border-l border-t border-dashed border-border sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((project, i) => <Reveal key={project.id} delay={(i % 3) * 70}><ProjectCard project={project} priority={i < 3} /></Reveal>)}
        </div>
      </section>

      {/* About */}
      <section className="site-shell border-t border-dashed border-border py-20 lg:py-28">
        <Reveal className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <p className="eyebrow">About</p>
          <div>
            <p className="display text-3xl leading-tight sm:text-4xl">
              {profile?.philosophy ??
                "Good design is the shortest distance between a person and their intention."}
            </p>
            <p className="mt-8 max-w-xl leading-relaxed text-muted-foreground">{profile?.bio}</p>
            <Link to="/about" className="link-underline mt-8 inline-block text-sm">
              More about me
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="site-shell border-t border-dashed border-border py-20 lg:py-28">
        <Reveal className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <p className="eyebrow">Selected experience</p>
          <ul className="divide-y divide-border">
            {experiences.map((exp) => (
              <li key={exp.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">
                  {exp.start_date} — {exp.end_date}
                </span>
                <span className="text-lg">{exp.position}</span>
                <span className="text-sm text-muted-foreground">{exp.company}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="site-shell border-t border-dashed border-border py-20 lg:py-28">
        <Reveal className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <p className="eyebrow">Capabilities</p>
          <div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {capabilities.map((skill) => (
                <span key={skill.id} className="display text-2xl sm:text-3xl">
                  {skill.name}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span
                  key={tool.id}
                  className="mono-label border border-border px-3 py-1.5 text-muted-foreground"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="site-shell border-t border-dashed border-border py-24 lg:py-32">
        <Reveal>
          <p className="mono-label text-accent">Next project</p>
          <h2 className="display mt-6 max-w-5xl text-[clamp(2.5rem,7vw,6rem)] uppercase">
            Let's make something worth using.
          </h2>
          <Link
            to="/contact"
            className="mono-label mt-10 inline-flex border border-accent bg-accent px-7 py-4 text-accent-foreground transition-colors hover:bg-foreground"
          >
            Start a conversation →
          </Link>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
