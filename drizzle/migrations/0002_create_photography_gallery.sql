CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  storage_path text NOT NULL,
  category text NOT NULL CHECK (category IN ('Nature', 'Landscape', 'Event', 'Portrait', 'Object')),
  title text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery photos public read" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage gallery photos" ON public.gallery_photos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER gallery_photos_updated BEFORE UPDATE ON public.gallery_photos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();