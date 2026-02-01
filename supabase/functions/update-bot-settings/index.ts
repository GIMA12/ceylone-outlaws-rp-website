import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotSettings {
  embedColors: {
    pending: string;
    accepted: string;
    declined: string;
  };
  messages: {
    applicationTitle: string;
    acceptedTitle: string;
    declinedTitle: string;
    acceptedMessage: string;
    declinedMessage: string;
  };
  channels: {
    webhookUrl: string;
    resultsChannelId: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Supabase auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified for user:', userId);

    if (req.method === 'GET') {
      // Return current settings from environment
      const settings: BotSettings = {
        embedColors: {
          pending: Deno.env.get('EMBED_COLOR_PENDING') || '#D4AF37',
          accepted: Deno.env.get('EMBED_COLOR_ACCEPTED') || '#00FF00',
          declined: Deno.env.get('EMBED_COLOR_DECLINED') || '#FF0000',
        },
        messages: {
          applicationTitle: Deno.env.get('MSG_APPLICATION_TITLE') || '📜 New Whitelist Application',
          acceptedTitle: Deno.env.get('MSG_ACCEPTED_TITLE') || '✅ Application Accepted',
          declinedTitle: Deno.env.get('MSG_DECLINED_TITLE') || '❌ Application Declined',
          acceptedMessage: Deno.env.get('MSG_ACCEPTED_TEXT') || 'Welcome to the server! Your whitelist application has been approved.',
          declinedMessage: Deno.env.get('MSG_DECLINED_TEXT') || 'Unfortunately, your whitelist application was not approved at this time.',
        },
        channels: {
          webhookUrl: Deno.env.get('DISCORD_WEBHOOK_URL') ? '••••••••' : '', // Don't expose full URL
          resultsChannelId: Deno.env.get('DISCORD_RESULTS_CHANNEL_ID') || '',
        },
      };

      return new Response(
        JSON.stringify({ settings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { settings }: { settings: Partial<BotSettings> } = await req.json();
      
      console.log('Updating bot settings:', settings);
      
      // Validate webhook URL if provided
      if (settings.channels?.webhookUrl && settings.channels.webhookUrl !== '••••••••') {
        const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        if (!webhookRegex.test(settings.channels.webhookUrl)) {
          return new Response(
            JSON.stringify({ error: 'Invalid Discord webhook URL format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Validate channel ID if provided
      if (settings.channels?.resultsChannelId) {
        if (!/^\d{17,20}$/.test(settings.channels.resultsChannelId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid Discord channel ID format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Settings validated. Note: To persist these settings, they need to be saved to the database or secrets.',
          note: 'Contact the developer to enable persistent settings storage.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error handling bot settings:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});