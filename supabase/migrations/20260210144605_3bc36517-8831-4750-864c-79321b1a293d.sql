
-- The previous policies with trailing spaces were already dropped, and new ones partially created
-- Just need to fix the duplicate by using a different name
DROP POLICY IF EXISTS "Anyone can insert scan history" ON public.scan_history;
CREATE POLICY "Public insert scan history" ON public.scan_history FOR INSERT WITH CHECK (true);
