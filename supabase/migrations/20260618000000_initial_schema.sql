-- profiles: extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  initials text,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  grade text,
  track text NOT NULL DEFAULT 'abroad',
  goal text,
  target_year integer,
  target_sem text,
  subject_levels jsonb NOT NULL DEFAULT '{}',
  daily_hours text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'ai',
  raw_json jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Planned',
  sort_order integer NOT NULL DEFAULT 0,
  focus_area text,
  bar_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  duration text,
  subject text,
  done boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'ai',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_date date NOT NULL,
  total_tasks integer NOT NULL DEFAULT 0,
  done_tasks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, progress_date)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, progress_date);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY onboarding_select ON public.onboarding_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY onboarding_insert ON public.onboarding_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY onboarding_update ON public.onboarding_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY roadmaps_select ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY roadmaps_insert ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmaps_update ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY roadmaps_delete ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY milestones_select ON public.milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY milestones_insert ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY milestones_update ON public.milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY milestones_delete ON public.milestones FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY daily_tasks_select ON public.daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY daily_tasks_insert ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY daily_tasks_update ON public.daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY daily_tasks_delete ON public.daily_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY daily_progress_select ON public.daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY daily_progress_insert ON public.daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY daily_progress_update ON public.daily_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'ST'), 2))
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    initials = EXCLUDED.initials,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
