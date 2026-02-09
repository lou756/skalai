import { supabase } from '@/integrations/supabase/client';
import type { SEOAnalysisResult } from './seo';

export async function saveAnalysis(result: SEOAnalysisResult): Promise<void> {
  try {
    const { error } = await supabase.from('scan_history').insert([{
      url: result.url,
      score: result.score,
      issues_count: result.issues.length,
      fixes_count: result.generatedFixes?.length || 0,
      scan_duration_ms: result.scanMeta?.durationMs || null,
      pages_crawled: result.scanMeta?.pagesCrawled || null,
      elements_checked: result.scanMeta?.elementsChecked || null,
      result_data: JSON.parse(JSON.stringify(result)),
    }]);

    if (error) {
      console.error('Error saving scan history:', error);
    }
  } catch (err) {
    console.error('Error saving analysis:', err);
  }
}

export interface ScanHistoryEntry {
  id: string;
  url: string;
  score: number;
  issues_count: number;
  fixes_count: number;
  scan_duration_ms: number | null;
  pages_crawled: number | null;
  elements_checked: number | null;
  created_at: string;
}

export async function getHistory(limit = 20): Promise<ScanHistoryEntry[]> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('id, url, score, issues_count, fixes_count, scan_duration_ms, pages_crawled, elements_checked, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return (data || []) as ScanHistoryEntry[];
}

export async function getHistoryForUrl(url: string): Promise<ScanHistoryEntry[]> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('id, url, score, issues_count, fixes_count, scan_duration_ms, pages_crawled, elements_checked, created_at')
    .eq('url', url)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching URL history:', error);
    return [];
  }

  return (data || []) as ScanHistoryEntry[];
}

export async function getFullResult(id: string): Promise<SEOAnalysisResult | null> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('result_data')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data.result_data as unknown as SEOAnalysisResult;
}
