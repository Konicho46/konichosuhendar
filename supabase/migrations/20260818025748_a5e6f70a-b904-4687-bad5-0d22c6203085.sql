
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.bootstrap_admin();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Product Design',
  tags text[] NOT NULL DEFAULT '{}',
  year text NOT NULL DEFAULT '',
  client text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  timeline text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  thumbnail_url text,
  hero_image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  problem text NOT NULL DEFAULT '',
  goals text NOT NULL DEFAULT '',
  research text NOT NULL DEFAULT '',
  design_process text NOT NULL DEFAULT '',
  final_design text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published projects public" ON public.projects FOR SELECT USING (published = true OR public.is_admin());
CREATE POLICY "admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.project_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  heading text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  section_type text NOT NULL DEFAULT 'text',
  images text[] NOT NULL DEFAULT '{}',
  items text[] NOT NULL DEFAULT '{}',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_sections TO authenticated;
GRANT ALL ON public.project_sections TO service_role;
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections of published projects" ON public.project_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.published OR public.is_admin())));
CREATE POLICY "admins manage sections" ON public.project_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER sections_updated BEFORE UPDATE ON public.project_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  position text NOT NULL,
  start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  responsibilities text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences public" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "admins manage experiences" ON public.experiences FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Capability',
  level text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills public" ON public.skills FOR SELECT USING (true);
CREATE POLICY "admins manage skills" ON public.skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER skills_updated BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'NaelSuhendar',
  headline text NOT NULL DEFAULT 'UI/UX & Product Designer',
  intro text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  philosophy text NOT NULL DEFAULT '',
  profile_image_url text,
  email text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile public" ON public.profile FOR SELECT USING (true);
CREATE POLICY "admins manage profile" ON public.profile FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER profile_updated BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social public" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "admins manage social" ON public.social_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER social_updated BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_title text NOT NULL DEFAULT 'NaelSuhendar — UI/UX & Product Designer',
  seo_description text NOT NULL DEFAULT 'Portfolio of NaelSuhendar, UI/UX and product designer.',
  contact_email text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "portfolio images readable" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "admins upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "admins update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "admins delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin());

INSERT INTO public.profile (name, headline, intro, bio, philosophy, email, location) VALUES (
 'NaelSuhendar','UI/UX & Product Designer',
 'I design digital products that feel obvious to use and quietly delightful to live with.',
 'I am a product designer focused on complex systems — ERP platforms, SaaS dashboards and mobile products. I care about clarity, rhythm and the small details that make software feel human.',
 'Good design is not decoration. It is the shortest distance between a person and their intention — drawn with care.',
 'hello@naelsuhendar.com','Jakarta, Indonesia');

INSERT INTO public.site_settings (contact_email) VALUES ('hello@naelsuhendar.com');

INSERT INTO public.social_links (label, url, sort_order) VALUES
 ('LinkedIn','https://linkedin.com/in/naelsuhendar',1),
 ('Instagram','https://instagram.com/naelsuhendar',2),
 ('Dribbble','https://dribbble.com/naelsuhendar',3);

INSERT INTO public.experiences (company, position, start_date, end_date, description, responsibilities, sort_order) VALUES
 ('Interacc','Lead Product Designer','2023','Present','Leading end-to-end design of an ERP platform used by operations teams.',ARRAY['Design system ownership','Complex data workflows','User research & testing'],1),
 ('Northlight Studio','Senior UI/UX Designer','2021','2023','Designed SaaS dashboards and mobile products for early-stage startups.',ARRAY['Product discovery','Interaction design','Prototyping'],2),
 ('Freelance','Product Designer','2019','2021','Partnered with founders to shape and ship first versions of their products.',ARRAY['Brand & UI direction','Web design','Design handoff'],3);

INSERT INTO public.skills (name, category, level, sort_order) VALUES
 ('Product Design','Capability','Expert',1),
 ('Interaction Design','Capability','Expert',2),
 ('Design Systems','Capability','Expert',3),
 ('User Research','Capability','Advanced',4),
 ('Prototyping','Capability','Advanced',5),
 ('Information Architecture','Capability','Advanced',6),
 ('Figma','Tool','Expert',7),
 ('Framer','Tool','Advanced',8),
 ('Webflow','Tool','Intermediate',9),
 ('After Effects','Tool','Intermediate',10),
 ('Notion','Tool','Advanced',11);

INSERT INTO public.projects (slug,title,summary,description,category,tags,year,client,role,timeline,platform,problem,goals,research,design_process,final_design,outcome,featured,published,sort_order) VALUES
 ('interacc','Interacc ERP','A modular ERP platform that turns dense operational data into calm, readable workflows.','Rethinking enterprise resource planning for teams who live inside spreadsheets.','ERP',ARRAY['ERP','Dashboard','SaaS'],'2024','Interacc','Lead Product Designer','8 months','Web',
  'Operations teams juggled six disconnected tools and exported everything to spreadsheets just to answer simple questions.',
  'Unify inventory, finance and logistics into one workspace. Reduce time-to-answer for daily operational questions.',
  'Fourteen contextual interviews across three warehouses, plus a diary study following two operations managers for a week.',
  'Mapped the operational day into five recurring jobs, then designed a single navigational spine with progressive disclosure for depth.',
  'A calm, dense-but-legible interface built on a 12-column grid, a strict type scale and a component library of 84 primitives.',
  'Reduced average task completion time by 41% and removed the spreadsheet export step entirely for daily reporting.',true,true,1),
 ('eco-revive','Eco Revive','A mobile app that makes recycling feel like a habit worth keeping.','Behaviour design for everyday sustainability.','Mobile',ARRAY['Mobile','Product Design','UI/UX'],'2024','Eco Revive','Product Designer','4 months','iOS & Android',
  'People wanted to recycle correctly but could not remember the rules, so they guessed — and guessed wrong.',
  'Make the correct action the easiest action. Build a streak of small wins rather than a lecture.',
  'Survey of 210 respondents and 8 usability sessions on early prototypes.',
  'Camera-first scanning flow, a single decisive answer screen, and a lightweight progress ritual.',
  'A warm, tactile interface with oversized type and one primary action per screen.',
  'Weekly retention rose to 38% after three months in market.',true,true,2),
 ('lumen-analytics','Lumen Analytics','A SaaS analytics dashboard designed for glanceability first, depth second.','Turning a firehose of metrics into a readable story.','SaaS',ARRAY['SaaS','Dashboard','Web'],'2023','Lumen','Senior UI/UX Designer','5 months','Web',
  'The old dashboard showed everything at once, so it effectively showed nothing.',
  'Give each role a default view they can read in ten seconds, with depth one click away.',
  'Analytics of 30 days of in-product behaviour plus 9 stakeholder interviews.',
  'Role-based default layouts, a restrained chart vocabulary and a consistent density scale.',
  'Editorial layout, generous whitespace and a two-tier information hierarchy.',
  'Support tickets about "where do I find" dropped by 63%.',false,true,3),
 ('atlas-web','Atlas','A marketing site and design system for a logistics platform.','Brand, web and system in one coherent voice.','Web',ARRAY['Web','Design Systems','Product Design'],'2023','Atlas','Product Designer','3 months','Web',
  'The brand looked different on every page and every deck.',
  'Create one visual language that scales from marketing to product.',
  'Audit of 40 existing screens and assets.',
  'Built a token-based system, then rebuilt the marketing site on top of it.',
  'A confident editorial site with sharp typography and restrained motion.',
  'Design-to-ship time for new pages dropped from two weeks to two days.',false,true,4);

INSERT INTO public.project_sections (project_id, heading, body, section_type, items, sort_order)
SELECT id,'Key Features','','list',ARRAY['Unified operational workspace','Role-based dashboards','Inline bulk editing','Audit trail on every record'],1 FROM public.projects WHERE slug='interacc';
INSERT INTO public.project_sections (project_id, heading, body, section_type, sort_order)
SELECT id,'Design Decisions','We chose density over decoration. Every pixel of chrome removed was a pixel returned to the data operators actually read.','text',2 FROM public.projects WHERE slug='interacc';
INSERT INTO public.project_sections (project_id, heading, body, section_type, sort_order)
SELECT id,'A note on tone','Sustainability products often shame the user. We designed for encouragement instead — the app never says you were wrong, only what is right next time.','quote',1 FROM public.projects WHERE slug='eco-revive';
