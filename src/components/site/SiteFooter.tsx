export function SiteFooter() {
  const links = [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/nicholassuhendar/" },
    { label: "Behance", url: "https://www.behance.net/nicholasuhendar" },
    { label: "Instagram", url: "https://www.instagram.com/konicho.46/" },
  ];

  return (
    <footer className="border-t border-dashed border-border py-10">
      <div className="site-shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono-label text-accent">Available for select projects</p>
          <a
            href="mailto:nicholas.nathanael46@gmail.com"
            className="display link-underline mt-3 block break-all text-xl uppercase leading-tight sm:text-4xl"
          >
            nicholas.nathanael46@gmail.com
          </a>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="mono-label flex flex-wrap gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="mono-label text-muted-foreground">
            © 2026 Nathanael Suhendar
          </p>
        </div>
      </div>
    </footer>
  );
}
