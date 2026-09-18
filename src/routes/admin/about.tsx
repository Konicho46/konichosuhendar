import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, btnGhost, btnPrimary, inputClass } from "@/components/admin/AdminShell";
import {
  profileQuery,
  socialLinksQuery,
  uploadImage,
  type Profile,
  type SocialLink,
} from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/about")({
  component: AboutAdmin,
});

function AboutAdmin() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const { data: socials } = useQuery(socialLinksQuery);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && !draft) setDraft(profile);
  }, [profile, draft]);

  const save = useMutation({
    mutationFn: async (values: Profile) => {
      const { error } = await supabase
        .from("profile")
        .update({
          name: values.name,
          headline: values.headline,
          intro: values.intro,
          bio: values.bio,
          philosophy: values.philosophy,
          profile_image_url: values.profile_image_url,
          email: values.email,
          location: values.location,
        })
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const invalidateSocials = () =>
    queryClient.invalidateQueries({ queryKey: ["social-links"] });

  const addSocial = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("social_links")
        .insert({ label: "New link", url: "https://", sort_order: (socials?.length ?? 0) + 1 });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidateSocials,
    onError: (error: Error) => toast.error(error.message),
  });

  const saveSocial = useMutation({
    mutationFn: async (link: SocialLink) => {
      const { error } = await supabase
        .from("social_links")
        .update({ label: link.label, url: link.url, sort_order: link.sort_order })
        .eq("id", link.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidateSocials();
      toast.success("Link saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeSocial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidateSocials,
    onError: (error: Error) => toast.error(error.message),
  });

  async function onImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    setUploading(true);
    try {
      setDraft({ ...draft, profile_image_url: await uploadImage(file) });
      toast.success("Image uploaded — remember to save");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (!draft) {
    return (
      <AdminShell title="About">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="About"
      description="Your profile, story and social links."
      actions={
        <button type="button" className={btnPrimary} onClick={() => save.mutate(draft)}>
          Save profile
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Name</span>
            <input
              className={`${inputClass} mt-2`}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Headline</span>
            <input
              className={`${inputClass} mt-2`}
              value={draft.headline}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Email</span>
            <input
              className={`${inputClass} mt-2`}
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="eyebrow">Location</span>
            <input
              className={`${inputClass} mt-2`}
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
          </label>
        </div>

        <div>
          <span className="eyebrow">Profile image</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {draft.profile_image_url && (
              <img
                src={draft.profile_image_url}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <label className={`${btnGhost} cursor-pointer`}>
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
          </div>
          <input
            className={`${inputClass} mt-3`}
            placeholder="…or paste an image URL"
            value={draft.profile_image_url ?? ""}
            onChange={(e) => setDraft({ ...draft, profile_image_url: e.target.value || null })}
          />
        </div>

        <label className="block">
          <span className="eyebrow">Short intro (home page)</span>
          <textarea
            className={`${inputClass} mt-2 min-h-24`}
            value={draft.intro}
            onChange={(e) => setDraft({ ...draft, intro: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Bio</span>
          <textarea
            className={`${inputClass} mt-2 min-h-32`}
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Design philosophy</span>
          <textarea
            className={`${inputClass} mt-2 min-h-24`}
            value={draft.philosophy}
            onChange={(e) => setDraft({ ...draft, philosophy: e.target.value })}
          />
        </label>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl">Social links</h2>
            <button type="button" className={btnGhost} onClick={() => addSocial.mutate()}>
              <Plus className="h-4 w-4" /> Add link
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(socials ?? []).map((link) => (
              <SocialRow
                key={link.id}
                link={link}
                onSave={(next) => saveSocial.mutate(next)}
                onDelete={() => removeSocial.mutate(link.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function SocialRow({
  link,
  onSave,
  onDelete,
}: {
  link: SocialLink;
  onSave: (link: SocialLink) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(link);
  return (
    <div className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border p-4 sm:grid-cols-[minmax(8rem,.6fr)_minmax(0,1.4fr)_auto_auto]">
      <label className="min-w-0">
        <span className="eyebrow">Label</span>
        <input
          className={`${inputClass} mt-2`}
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
      </label>
      <label className="min-w-0">
        <span className="eyebrow">URL</span>
        <input
          className={`${inputClass} mt-2`}
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
      </label>
      <button type="button" className={btnPrimary} onClick={() => onSave(draft)}>
        Save
      </button>
      <button
        type="button"
        aria-label="Delete link"
        onClick={onDelete}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
