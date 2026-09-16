import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
  const rest = projects.filter((p) => !p.featured).slice(0, 2);
  const capabilities = skills.filter((s) => s.category !== "Tool");
  const tools = skills.filter((s) => s.category === "Tool");

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="shell pb-20 pt-20 sm:pt-28 lg:pb-28 lg:pt-36">
        <p className="eyebrow rise">{profile?.location ?? "Sidoarjo, East Java, Indonesia"}</p>
        <h1
          className="display rise mt-6 text-[clamp(3rem,11vw,9rem)]"
          style={{ animationDelay: "80ms" }}
        >
          {profile?.name ?? "Nathanael Suhendar"}
        </h1>
        <div
          className="rise mt-8 flex flex-col gap-10 border-t border-border pt-8 md:flex-row md:items-start md:justify-between"
          style={{ animationDelay: "160ms" }}
        >
          <p className="text-xl sm:text-2xl">{profile?.headline ?? "UI/UX & Product Designer"}</p>
          <div className="max-w-md">
            <p className="text-base leading-relaxed text-muted-foreground">
              {profile?.intro ??
                "I design digital products that feel obvious to use and quietly delightful to live with."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/work"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
              >
                View My Work
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-foreground/25 px-6 py-3 text-sm transition-colors duration-300 hover:border-foreground"
              >
                Let's Talk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="shell border-t border-border py-20 lg:py-28">
        <Reveal className="flex items-baseline justify-between">
          <h2 className="display text-4xl sm:text-5xl">Selected work</h2>
          <Link to="/work" className="link-underline text-sm text-muted-foreground">
            All projects
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-16 lg:grid-cols-2">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={i * 90}>
              <ProjectCard project={project} large priority={i === 0} />
            </Reveal>
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-16 grid gap-16 lg:grid-cols-2">
            {rest.map((project, i) => (
              <Reveal key={project.id} delay={i * 90}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section className="shell border-t border-border py-20 lg:py-28">
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

      {/* Experience */}
      <section className="shell border-t border-border py-20 lg:py-28">
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

      {/* Capabilities & tools */}
      <section className="shell border-t border-border py-20 lg:py-28">
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
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Contact CTA */}
      <section className="shell border-t border-border py-24 text-center lg:py-32">
        <Reveal>
          <p className="eyebrow">Next project</p>
          <h2 className="display mx-auto mt-6 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)]">
            Let's make something worth using.
          </h2>
          <Link
            to="/contact"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
