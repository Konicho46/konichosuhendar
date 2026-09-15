import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/projects", label: "Projects" },
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

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex shrink-0 flex-col justify-between border-b border-border bg-sidebar px-5 py-6 md:w-60 md:border-b-0 md:border-r">
        <div>
          <Link to="/" className="display text-lg">
            Nathanael Suhendar<span className="text-accent">.</span>
          </Link>
          <p className="eyebrow mt-1">CMS</p>
          <nav className="mt-8 flex flex-wrap gap-1 md:flex-col">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
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
          className="mt-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="display text-4xl">{title}</h1>
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions}
          </div>
          <div className="mt-10">{children}</div>
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
