import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/about", label: "About" },
  { to: "/work", label: "Project" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="site-shell pt-3 md:pt-4">
        <div
          className={`relative flex items-center justify-between rounded-full border border-border bg-background/85 pl-5 pr-2 backdrop-blur-md transition-all duration-500 ease-out ${
            scrolled ? "h-14 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.85)]" : "h-16"
          }`}
        >
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              scrolled
                ? "pointer-events-none max-w-0 opacity-0"
                : "max-w-xs opacity-100"
            }`}
          >
            <Link to="/" className="display whitespace-nowrap text-lg uppercase">
              Nathanael Suhendar
              <span className="text-accent">.</span>
            </Link>
          </div>

          <nav className="mono-label absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-accent [&.active]:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="mono-label hidden items-center rounded-full bg-accent px-5 py-2.5 text-accent-foreground transition-colors hover:bg-foreground hover:text-foreground md:inline-flex"
            >
              Reach Me
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="px-3 pt-2 md:hidden">
          <div className="site-shell rounded-3xl border border-border bg-background/95 pt-2 backdrop-blur-md">
            <div className="flex flex-col px-5 py-3">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="mono-label border-b border-dashed border-border py-4 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mono-label my-4 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-accent-foreground transition-colors hover:bg-foreground hover:text-foreground"
              >
                Reach Me
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
