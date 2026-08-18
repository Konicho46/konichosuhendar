
DROP POLICY "published projects public" ON public.projects;
CREATE POLICY "published projects visible to visitors" ON public.projects FOR SELECT TO anon USING (published = true);
CREATE POLICY "published or own projects for signed in" ON public.projects FOR SELECT TO authenticated USING (published = true OR public.is_admin());

DROP POLICY "sections of published projects" ON public.project_sections;
CREATE POLICY "sections visible to visitors" ON public.project_sections FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.published));
CREATE POLICY "sections for signed in" ON public.project_sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.published OR public.is_admin())));

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
