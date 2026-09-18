CREATE TABLE public.project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_categories TO authenticated;
GRANT ALL ON public.project_categories TO service_role;

ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories public read"
ON public.project_categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "admins manage categories"
ON public.project_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER project_categories_updated
BEFORE UPDATE ON public.project_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.project_categories (name, sort_order) VALUES
  ('Product Design', 1),
  ('UI/UX Design', 2),
  ('Web', 3),
  ('Mobile', 4),
  ('SaaS', 5),
  ('B2B', 6),
  ('Sales Canvassing', 7),
  ('ERP', 8),
  ('Dashboard', 9)
ON CONFLICT (name) DO NOTHING;