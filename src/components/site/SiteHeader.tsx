import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/about", label: "01 About" },
  { to: "/work", label: "02 Project" },
  { to: "/contact", label: "03 Contact" },
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
    <header
      className={`sticky top-0 z-40 border-b border-dashed border-border bg-background/90 backdrop-blur-md transition-all duration-500 ease-out ${
        scrolled ? "shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : ""
      }`}
    >
      <div
        className={`site-shell flex items-center justify-between transition-[height] duration-500 ease-out ${
          scrolled ? "h-14 md:h-16" : "h-[4.5rem]"
        }`}
      >
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            scrolled
              ? "pointer-events-none max-w-0 opacity-0 md:-translate-y-1"
              : "max-w-xs opacity-100"
          }`}
        >
          <Link to="/" className="display whitespace-nowrap text-lg uppercase">
            Nathanael Suhendar
            <span className="text-accent">.</span>
          </Link>
        </div>

        <nav className="mono-label hidden items-center gap-10 md:flex">
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

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:border-accent hover:text-accent md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-dashed border-border bg-background md:hidden">
          <div className="site-shell flex flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="mono-label border-b border-border py-4 last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
