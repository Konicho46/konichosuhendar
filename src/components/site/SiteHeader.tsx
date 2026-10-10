import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { hash: "about", label: "About Us" },
  { hash: "project", label: "Project" },
  { hash: "experience", label: "Experience" },
  { hash: "contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useRouterState({ select: (state) => state.location });

  const goToSection = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setOpen(false);
    if (location.pathname !== "/" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(hash);
    if (!section) return;
    event.preventDefault();
    window.history.replaceState(window.history.state, "", `/#${hash}`);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 104, behavior: reduceMotion ? "instant" : "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="portfolio-shell pt-3 md:pt-4">
        <div
          className={`relative flex items-center justify-between rounded-full border border-border bg-background/85 pl-5 pr-2 backdrop-blur-md transition-all duration-500 ease-out ${
             scrolled ? "h-14 shadow-[var(--floating-nav-shadow)]" : "h-16"
          }`}
        >
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              scrolled
                ? "pointer-events-none max-w-0 opacity-0"
                : "max-w-xs opacity-100 lg:max-w-0 xl:max-w-xs"
            }`}
          >
            <Link to="/" tabIndex={scrolled ? -1 : undefined} aria-hidden={scrolled || undefined} className="display whitespace-nowrap text-sm">
              Nathanael Suhendar
              <span className="text-accent">.</span>
            </Link>
          </div>

          <nav aria-label="Main navigation" className="mono-label absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.hash}
                to="/"
                hash={item.hash}
                onClick={(event) => goToSection(event, item.hash)}
                className="whitespace-nowrap text-muted-foreground transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
               variant="ghost"
               size="icon"
               className="h-10 w-10 rounded-full lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="absolute left-0 right-0 px-5 pt-2 lg:hidden">
          <div className="mx-auto max-w-6xl rounded-md border border-border bg-background/95 pt-2 backdrop-blur-md">
            <div className="flex flex-col px-5 py-3">
              {nav.map((item) => (
                <Link
                  key={item.hash}
                  to="/"
                  hash={item.hash}
                  onClick={(event) => goToSection(event, item.hash)}
                  className="mono-label border-b border-dashed border-border py-4 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
