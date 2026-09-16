export function SiteFooter() {
  const links = [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/nicholassuhendar/" },
    { label: "Behance", url: "https://www.behance.net/nicholasuhendar" },
    { label: "Instagram", url: "https://www.instagram.com/konicho.46/" },
  ];

  return (
    <footer className="border-t border-border/60 py-14">
      <div className="shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Available for select projects</p>
          <a
            href="mailto:nicholas.nathanael46@gmail.com"
            className="display link-underline mt-3 block text-4xl sm:text-5xl"
          >
            nicholas.nathanael46@gmail.com
          </a>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-6 text-sm">
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
          <p className="text-xs text-muted-foreground">
            © 2026 Nathanael Suhendar
          </p>
        </div>
      </div>
    </footer>
  );
}
