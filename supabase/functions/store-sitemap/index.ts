import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, filename, domain } = await req.json();

    if (!content || !filename) {
      return new Response(
        JSON.stringify({ success: false, error: 'content and filename are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a path based on domain and timestamp
    const safeDomain = (domain || 'unknown').replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const path = `${safeDomain}/${timestamp}-${filename}`;

    const blob = new Blob([content], { type: 'application/xml' });
    
    const { data, error } = await supabase.storage
      .from('sitemaps')
      .upload(path, blob, {
        contentType: filename.endsWith('.xml') ? 'application/xml' : 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('sitemaps')
      .getPublicUrl(path);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrlData.publicUrl,
        path,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error storing sitemap:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
