import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { password } = await req.json();

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = password === adminPassword;

    if (isValid) {
      // Generate a simple session token (valid for 1 hour)
      const token = btoa(JSON.stringify({
        exp: Date.now() + (60 * 60 * 1000), // 1 hour
        valid: true
      }));

      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid password' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error verifying admin:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});