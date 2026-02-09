
-- Create scan_history table for storing analysis results
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  issues_count INTEGER NOT NULL DEFAULT 0,
  fixes_count INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  pages_crawled INTEGER,
  elements_checked INTEGER,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required for public tool)
CREATE POLICY "Anyone can insert scan history"
ON public.scan_history
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read scan history
CREATE POLICY "Anyone can read scan history"
ON public.scan_history
FOR SELECT
USING (true);

-- Index for fast lookups by URL
CREATE INDEX idx_scan_history_url ON public.scan_history(url);
CREATE INDEX idx_scan_history_created_at ON public.scan_history(created_at DESC);
