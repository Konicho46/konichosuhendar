import { useQuery } from "@tanstack/react-query";
import { profileQuery, socialLinksQuery } from "@/lib/portfolio";

export function SiteFooter() {
  const { data: profile } = useQuery(profileQuery);
  const { data: links } = useQuery(socialLinksQuery);

  return (
    <footer className="border-t border-border/60 py-14">
      <div className="shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Available for select projects</p>
          <a
            href={`mailto:${profile?.email ?? ""}`}
            className="display link-underline mt-3 block text-4xl sm:text-5xl"
          >
            {profile?.email ?? "nicholas.nathanael46@gmail.com"}
          </a>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-6 text-sm">
            {(links ?? []).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getUTCFullYear()} {profile?.name ?? "Nathanael Suhendar"}
          </p>
        </div>
      </div>
    </footer>
  );
}
