ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url text;

-- projects already has grants and RLS; new column inherits table privileges, no new table created.