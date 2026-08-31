import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, btnPrimary, inputClass } from "@/components/admin/AdminShell";
import { settingsQuery, type SiteSettings } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(settingsQuery);
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);

  useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  const { data: messages } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: messagesOpen,
  });

  const save = useMutation({
    mutationFn: async (values: SiteSettings) => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          seo_title: values.seo_title,
          seo_description: values.seo_description,
          contact_email: values.contact_email,
        })
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!draft) {
    return (
      <AdminShell title="Settings">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Settings"
      description="SEO defaults, contact details and inbox."
      actions={
        <button type="button" className={btnPrimary} onClick={() => save.mutate(draft)}>
          Save settings
        </button>
      }
    >
      <div className="space-y-6">
        <label className="block">
          <span className="eyebrow">SEO title</span>
          <input
            className={`${inputClass} mt-2`}
            value={draft.seo_title}
            onChange={(e) => setDraft({ ...draft, seo_title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">SEO description</span>
          <textarea
            className={`${inputClass} mt-2 min-h-24`}
            value={draft.seo_description}
            onChange={(e) => setDraft({ ...draft, seo_description: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Contact email</span>
          <input
            className={`${inputClass} mt-2`}
            value={draft.contact_email}
            onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })}
          />
        </label>

        <section className="rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="display text-2xl">Inbox</h2>
              <p className="text-sm text-muted-foreground">Messages from your contact form.</p>
            </div>
            <button
              type="button"
              className="link-underline text-sm"
              onClick={() => setMessagesOpen((open) => !open)}
            >
              {messagesOpen ? "Hide" : "Show messages"}
            </button>
          </div>

          {messagesOpen && (
            <ul className="mt-5 space-y-4">
              {(messages ?? []).map((message) => (
                <li key={message.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{message.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{message.email}</p>
                  <p className="mt-3 whitespace-pre-line text-sm">{message.message}</p>
                </li>
              ))}
              {(messages ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">No messages yet.</li>
              )}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
