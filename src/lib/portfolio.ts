import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type ProjectSection = Tables<"project_sections">;
export type Experience = Tables<"experiences">;
export type Skill = Tables<"skills">;
export type Profile = Tables<"profile">;
export type SocialLink = Tables<"social_links">;
export type SiteSettings = Tables<"site_settings">;

export const CATEGORIES = [
  "Product Design",
  "UI/UX Design",
  "Web",
  "Mobile",
  "SaaS",
  "ERP",
  "Dashboard",
] as const;

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

export const publishedProjectsQuery = queryOptions({
  queryKey: ["projects", "published"],
  queryFn: () =>
    unwrap<Project[]>(
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
    ),
});

export const allProjectsQuery = queryOptions({
  queryKey: ["projects", "all"],
  queryFn: () =>
    unwrap<Project[]>(
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
    ),
});

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["project", id],
    queryFn: () => unwrap<Project>(supabase.from("projects").select("*").eq("id", id).single()),
  });

export const projectSectionsQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["project-sections", projectId],
    queryFn: () =>
      unwrap<ProjectSection[]>(
        supabase
          .from("project_sections")
          .select("*")
          .eq("project_id", projectId)
          .order("sort_order", { ascending: true }),
      ),
  });

export const experiencesQuery = queryOptions({
  queryKey: ["experiences"],
  queryFn: () =>
    unwrap<Experience[]>(
      supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
    ),
});

export const skillsQuery = queryOptions({
  queryKey: ["skills"],
  queryFn: () =>
    unwrap<Skill[]>(supabase.from("skills").select("*").order("sort_order", { ascending: true })),
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: () => unwrap<Profile>(supabase.from("profile").select("*").limit(1).maybeSingle()),
});

export const socialLinksQuery = queryOptions({
  queryKey: ["social-links"],
  queryFn: () =>
    unwrap<SocialLink[]>(
      supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
    ),
});

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () =>
    unwrap<SiteSettings>(supabase.from("site_settings").select("*").limit(1).maybeSingle()),
});

/** Uploads an image to the portfolio bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const signed = await supabase.storage
    .from("portfolio")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signed.error) throw new Error(signed.error.message);
  return signed.data.signedUrl;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
