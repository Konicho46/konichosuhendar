import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProjectsSection } from "@/components/site/ProjectsSection";
import { ContactSection } from "@/components/site/ContactSection";
import { experiencesQuery, profileQuery, publishedProjectsQuery, skillsQuery, socialLinksQuery, projectCategoriesQuery } from "@/lib/portfolio";

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
    const [projects, profile, experiences, skills, links, categories] = await Promise.all([
      context.queryClient.ensureQueryData(publishedProjectsQuery),
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(experiencesQuery),
      context.queryClient.ensureQueryData(skillsQuery),
      context.queryClient.ensureQueryData(socialLinksQuery),
      context.queryClient.ensureQueryData(projectCategoriesQuery),
    ]);
    return { projects, profile, experiences, skills, links, categories };
  },
  component: Home,
});

function Home() {
  const { projects, profile, experiences, skills, links, categories } = Route.useLoaderData();
  const capabilities = skills.filter((skill) => skill.category !== "Tool");
  const tools = skills.filter((skill) => skill.category === "Tool");

  return (
    <PublicLayout>
      <section id="about" aria-labelledby="about-title" className="portfolio-section portfolio-shell pb-16 pt-16 md:pb-24 md:pt-24">
        <p className="mono-label text-accent">Product designer</p>
        <h1 className="display mt-6 max-w-4xl text-5xl leading-tight sm:text-7xl lg:text-8xl">{profile?.name ?? "Nathanael Suhendar"}<span className="text-accent">.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{profile?.intro}</p>
        <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="about-title" className="display text-2xl sm:text-3xl">About Us</h2>
            <p className="mono-label mt-4 text-muted-foreground">{profile?.location ?? "Sidoarjo, East Java, Indonesia"}</p>
            {profile?.profile_image_url && <img src={profile.profile_image_url} alt={`${profile.name} portrait`} className="mt-6 aspect-[4/5] w-full max-w-60 rounded-md object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{profile?.bio}</p>
            {profile?.philosophy && <p className="display mt-6 max-w-2xl text-xl leading-relaxed sm:text-2xl">{profile.philosophy}</p>}
            {skills.length > 0 && <div className="mt-8">
              <p className="mono-label text-muted-foreground">Capabilities & tools</p>
              <p className="mt-3 text-sm leading-loose">{capabilities.map((skill) => skill.name).join(" / ")}</p>
              <p className="mt-2 text-sm leading-loose text-muted-foreground">{tools.map((tool) => tool.name).join(" / ")}</p>
            </div>}
          </div>
        </div>
      </section>
      <ProjectsSection projects={projects} categories={categories} />
      <section id="experience" aria-labelledby="experience-title" className="portfolio-section border-t border-border py-16 md:py-24">
        <div className="portfolio-shell grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 id="experience-title" className="display text-3xl sm:text-4xl">Experience</h2>
          <ul className="min-w-0 divide-y divide-border">
            {experiences.map((experience) => <li key={experience.id} className="py-6 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 className="display text-xl leading-tight sm:text-2xl">{experience.position}</h3><span className="mono-label text-muted-foreground">{experience.start_date} — {experience.end_date || "Present"}</span></div>
              <p className="mt-2 text-sm text-accent">{experience.company}</p>
              {experience.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{experience.description}</p>}
              {experience.responsibilities.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-4 text-sm text-muted-foreground">{experience.responsibilities.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}
            </li>)}
            {!experiences.length && <li className="text-sm text-muted-foreground">Experience will be added soon.</li>}
          </ul>
        </div>
      </section>
      <ContactSection profile={profile} links={links} />
    </PublicLayout>
  );
}
