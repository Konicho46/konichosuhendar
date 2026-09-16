import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Reveal } from "@/components/site/Reveal";
import { experiencesQuery, profileQuery, skillsQuery } from "@/lib/portfolio";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nathanael Suhendar" },
      {
        name: "description",
        content:
          "The design philosophy, experience, skills and tools behind Nathanael Suhendar's design practice.",
      },
      { property: "og:title", content: "About — Nathanael Suhendar" },
      {
        property: "og:description",
        content: "Design philosophy, experience and capabilities of Nathanael Suhendar.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    const [profile, experiences, skills] = await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(experiencesQuery),
      context.queryClient.ensureQueryData(skillsQuery),
    ]);
    return { profile, experiences, skills };
  },
  component: About,
});

function About() {
  const { profile, experiences, skills } = Route.useLoaderData();

  const capabilities = skills.filter((s) => s.category !== "Tool");
  const tools = skills.filter((s) => s.category === "Tool");

  return (
    <PublicLayout>
      <section className="shell pb-16 pt-20 lg:pt-28">
        <p className="eyebrow rise">About</p>
        <h1 className="display rise mt-5 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)]">
          {profile?.intro ?? "I design digital products that feel obvious to use."}
        </h1>
      </section>

      <section className="shell grid gap-12 border-t border-border py-16 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
            {profile?.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={`${profile.name} portrait`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="display text-6xl text-muted-foreground/40">
                  {(profile?.name ?? "N").charAt(0)}
                </span>
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={80} className="flex flex-col justify-center">
          <p className="text-lg leading-relaxed">{profile?.bio}</p>
          <p className="display mt-10 text-3xl leading-tight">{profile?.philosophy}</p>
          <p className="mt-8 text-sm text-muted-foreground">{profile?.location}</p>
        </Reveal>
      </section>

      <section className="shell grid gap-12 border-t border-border py-16 md:grid-cols-[1fr_1.4fr] lg:py-24">
        <p className="eyebrow">Career timeline</p>
        <ul className="divide-y divide-border">
          {experiences.map((exp, i) => (
            <Reveal as="li" key={exp.id} delay={i * 70} className="py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="display text-3xl">{exp.position}</h2>
                <span className="text-sm text-muted-foreground">
                  {exp.start_date} — {exp.end_date}
                </span>
              </div>
              <p className="mt-1 text-sm text-accent">{exp.company}</p>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                {exp.description}
              </p>
              {exp.responsibilities.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {exp.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="shell grid gap-12 border-t border-border py-16 md:grid-cols-[1fr_1.4fr] lg:py-24">
        <p className="eyebrow">Capabilities & tools</p>
        <div>
          <ul className="divide-y divide-border">
            {capabilities.map((skill) => (
              <li key={skill.id} className="flex items-baseline justify-between py-4">
                <span className="display text-2xl">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.level}</span>
              </li>
            ))}
          </ul>
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
      </section>

      <section className="shell border-t border-border py-24 text-center">
        <Reveal>
          <h2 className="display mx-auto max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)]">
            Have a product that deserves better?
          </h2>
          <Link
            to="/contact"
            className="mt-10 inline-flex rounded-full bg-primary px-8 py-4 text-sm text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Let's Talk
          </Link>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
