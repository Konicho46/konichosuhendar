import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { Profile, SocialLink } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell me your name").max(80),
  email: z.string().trim().email("That email doesn't look right").max(160),
  message: z.string().trim().min(10, "A little more detail helps").max(2000),
});

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactSection({ profile, links }: { profile: Profile | null; links: SocialLink[] }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("sent");
    setValues({ name: "", email: "", message: "" });
  }

  const field =
    "w-full border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent";

  return (
    <section id="contact" aria-labelledby="contact-title" className="portfolio-section border-t border-border py-16 md:py-24">
      <div className="portfolio-shell grid gap-12 md:grid-cols-2">
        <div>
          <p className="mono-label rise text-accent">Contact</p>
          <h2 id="contact-title" className="display mt-5 text-3xl leading-tight sm:text-4xl">
            Let's talk about your product.
          </h2>
          <p className="rise mt-6 max-w-sm leading-relaxed text-muted-foreground">
            Whether it's a new product, a redesign or a design system that needs order — I'd love to
            hear the details.
          </p>

          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${profile?.email ?? ""}`} className="link-underline break-all text-base">
                  {profile?.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Elsewhere</dt>
              <dd className="mt-2 flex flex-wrap gap-5">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={onSubmit} noValidate className="min-w-0">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="eyebrow">
                Name
              </label>
              <input
                id="name"
                className={`${field} mt-2`}
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                placeholder="Your name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="mt-2 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="eyebrow">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`${field} mt-2`}
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="mt-2 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className="eyebrow">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className={`${field} mt-2 resize-none`}
                value={values.message}
                onChange={(e) => setValues({ ...values, message: e.target.value })}
                placeholder="What are you working on?"
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <p className="mt-2 text-xs text-destructive">{errors.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={status === "sending"}
            className="mono-label mt-8 w-full border border-accent bg-accent px-6 py-3.5 text-accent-foreground transition-colors hover:bg-foreground disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>

          {status === "sent" && (
            <p className="mt-4 text-sm text-accent">
              Thank you — your message landed. I'll reply within a couple of days.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-destructive">
              Something went wrong. Please email me directly instead.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
