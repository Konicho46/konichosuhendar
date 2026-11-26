import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/experience", label: "Experience" },
  { to: "/admin/skills", label: "Skills & Tools" },
  { to: "/admin/about", label: "About" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="shrink-0 border-b border-border bg-sidebar px-4 py-4 md:flex md:w-60 md:flex-col md:justify-between md:border-b-0 md:border-r md:px-5 md:py-6">
        <div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <Link to="/" className="display block truncate text-lg">Nathanael Suhendar<span className="text-accent">.</span></Link>
              <p className="eyebrow mt-1">CMS</p>
            </div>
            <Button type="button" size="icon" variant="ghost" className="shrink-0 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
          <nav className={`${menuOpen ? "grid" : "hidden"} mt-5 grid-cols-2 gap-1 md:mt-8 md:flex md:flex-col`}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground [&.active]:bg-sidebar-accent [&.active]:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={signOut}
          className={`${menuOpen ? "inline-flex" : "hidden"} mt-4 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex md:mt-8`}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <h1 className="display break-words text-3xl sm:text-4xl">{title}</h1>
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div>}
          </div>
          <div className="mt-7 sm:mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground";

export const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-foreground";
