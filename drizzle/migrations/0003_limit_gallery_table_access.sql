REVOKE ALL ON TABLE public.gallery_photos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gallery_photos TO authenticated;
GRANT ALL ON TABLE public.gallery_photos TO service_role;