
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id text NOT NULL,
  persona_name text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  avg_score numeric NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.training_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.training_sessions FOR INSERT WITH CHECK (true);
