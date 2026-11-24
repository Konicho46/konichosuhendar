DROP POLICY IF EXISTS "settings public" ON public.site_settings;
REVOKE SELECT ON public.site_settings FROM PUBLIC, anon;

DROP POLICY IF EXISTS "anyone can send message" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT (name, email, message) ON public.contact_messages TO anon, authenticated;
CREATE POLICY "validated public contact submissions"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  char_length(name) BETWEEN 2 AND 80
  AND name = btrim(name)
  AND char_length(email) BETWEEN 6 AND 160
  AND email = btrim(email)
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  AND char_length(message) BETWEEN 10 AND 2000
  AND message = btrim(message)
);

DROP POLICY IF EXISTS "portfolio images readable" ON storage.objects;
CREATE POLICY "admins read portfolio images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'portfolio'::text AND public.is_admin());