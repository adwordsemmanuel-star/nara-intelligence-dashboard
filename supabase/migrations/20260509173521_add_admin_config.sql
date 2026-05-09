-- Create admin_config table
CREATE TABLE IF NOT EXISTS public.admin_config (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_config' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.admin_config FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_config' AND policyname = 'Allow service_role full access'
    ) THEN
        CREATE POLICY "Allow service_role full access" ON public.admin_config USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Insert default operational_mode
INSERT INTO public.admin_config (key, value)
VALUES ('operational_mode', '{"mode": "intelligent", "manual_number": "521"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
