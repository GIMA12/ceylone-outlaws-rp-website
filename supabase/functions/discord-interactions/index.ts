import nacl from "https://esm.sh/tweetnacl@1.0.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Verify Discord signature using Ed25519
function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    const message = new TextEncoder().encode(timestamp + body);
    const sig = hexToUint8Array(signature);
    const pubKey = hexToUint8Array(publicKey);

    return nacl.sign.detached.verify(message, sig, pubKey);
  } catch (error: unknown) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Fetch bot settings from database
async function getBotSettings(): Promise<Record<string, string>> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('bot_settings')
    .select('setting_key, setting_value');
  
  if (error) {
    console.error('Error fetching bot settings:', error);
    return {};
  }
  
  const settings: Record<string, string> = {};
  data?.forEach(s => {
    settings[s.setting_key] = s.setting_value || '';
  });
  
  return settings;
}

// Process button interaction asynchronously (after responding)
async function processButtonInteraction(
  interaction: Record<string, unknown>,
  botToken: string,
  resultsChannelId: string
) {
  try {
    const customId = (interaction.data as Record<string, unknown>).custom_id as string;
    console.log('Processing button interaction:', customId);

    // Parse custom_id: format is "accept_discordId_username" or "decline_discordId_username"
    const parts = customId.split('_');
    const action = parts[0]; // 'accept' or 'decline'
    const discordId = parts[1];

    const isAccepted = action === 'accept';
    const member = interaction.member as Record<string, unknown> | undefined;
    const user = member?.user as Record<string, unknown> | undefined;
    const staffMember = (user?.username as string) || 'Staff';
    const staffId = user?.id as string | undefined;

    // Fetch custom settings from database
    const settings = await getBotSettings();
    
    // Get custom colors (default to green/red)
    const acceptedColor = settings['embed_color_accepted'] 
      ? parseInt(settings['embed_color_accepted'].replace('#', ''), 16) 
      : 0x00FF00;
    const declinedColor = settings['embed_color_declined'] 
      ? parseInt(settings['embed_color_declined'].replace('#', ''), 16) 
      : 0xFF0000;
    
    // Get custom titles and messages
    const acceptedTitle = settings['msg_accepted_title'] || '✅ Application Accepted';
    const declinedTitle = settings['msg_declined_title'] || '❌ Application Declined';
    const acceptedMessage = settings['msg_accepted_text'] || 'Welcome to the server! Your whitelist application has been approved.';
    const declinedMessage = settings['msg_declined_text'] || 'Unfortunately, your whitelist application was not approved at this time.';
    
    // Get custom images
    const acceptedImageUrl = settings['msg_accepted_image'] || '';
    const declinedImageUrl = settings['msg_declined_image'] || '';

    // Get the original embed from the message
    const message = interaction.message as Record<string, unknown> | undefined;
    const embeds = message?.embeds as Record<string, unknown>[] | undefined;
    const originalEmbed = embeds?.[0] || {};

    // Create updated embed with status
    const updatedEmbed = {
      ...originalEmbed,
      color: isAccepted ? acceptedColor : declinedColor,
      footer: {
        text: isAccepted 
          ? `✅ ACCEPTED by ${staffMember}` 
          : `❌ DECLINED by ${staffMember}`,
        icon_url: isAccepted
          ? 'https://cdn-icons-png.flaticon.com/512/845/845646.png'
          : 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png'
      },
      timestamp: new Date().toISOString()
    };

    // Create result embed for results channel
    const resultEmbed: Record<string, unknown> = {
      title: isAccepted ? acceptedTitle : declinedTitle,
      description: isAccepted ? acceptedMessage : declinedMessage,
      color: isAccepted ? acceptedColor : declinedColor,
      fields: [
        {
          name: '👤 Applicant',
          value: `<@${discordId}>`,
          inline: true
        },
        {
          name: '🆔 Discord ID',
          value: `\`${discordId}\``,
          inline: true
        },
        {
          name: '📊 Result',
          value: isAccepted ? '**✅ ACCEPTED**' : '**❌ DECLINED**',
          inline: true
        },
        {
          name: '👮 Reviewed By',
          value: staffId ? `<@${staffId}>` : staffMember,
          inline: true
        },
        {
          name: '⏰ Decision Time',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Whitelist Application Result'
      },
      timestamp: new Date().toISOString()
    };

    // Add image if configured
    const imageUrl = isAccepted ? acceptedImageUrl : declinedImageUrl;
    if (imageUrl) {
      resultEmbed.image = { url: imageUrl };
    } else {
      // Use thumbnail as fallback if no custom image
      resultEmbed.thumbnail = {
        url: isAccepted 
          ? 'https://cdn-icons-png.flaticon.com/512/845/845646.png'
          : 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png'
      };
    }

    const applicationId = interaction.application_id as string;
    const interactionToken = interaction.token as string;

    // Edit the original message via webhook endpoint (deferred response followup)
    const editResponse = await fetch(
      `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [updatedEmbed],
          components: [
            {
              type: 1, // Action Row
              components: [
                {
                  type: 2, // Button
                  style: isAccepted ? 3 : 2, // Success or Secondary
                  label: isAccepted ? 'Accepted' : 'Accept',
                  emoji: { name: '✅' },
                  custom_id: 'accept_disabled',
                  disabled: true
                },
                {
                  type: 2, // Button
                  style: isAccepted ? 2 : 4, // Secondary or Danger
                  label: isAccepted ? 'Decline' : 'Declined',
                  emoji: { name: '❌' },
                  custom_id: 'decline_disabled',
                  disabled: true
                }
              ]
            }
          ]
        }),
      }
    );

    if (!editResponse.ok) {
      const errorText = await editResponse.text();
      console.error('Failed to edit original message:', errorText);
    } else {
      console.log('Original message updated successfully');
    }

    // Send message to results channel
    const channelResponse = await fetch(
      `https://discord.com/api/v10/channels/${resultsChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [resultEmbed],
          content: isAccepted 
            ? `🎉 <@${discordId}> has been **ACCEPTED** to the whitelist!`
            : `😔 <@${discordId}>'s application has been **DECLINED**.`
        }),
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('Failed to send result message:', errorText);
    } else {
      console.log('Result message sent to results channel');
    }
  } catch (error) {
    console.error('Error in async processing:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[discord-interactions] ${requestId} ${req.method} ${req.url}`);

  try {
    const publicKey = Deno.env.get('DISCORD_PUBLIC_KEY');
    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const resultsChannelId = Deno.env.get('DISCORD_RESULTS_CHANNEL_ID');

    if (!publicKey || !botToken || !resultsChannelId) {
      console.error('Missing required environment variables');
      throw new Error('Server configuration error');
    }

    // Get Discord signature headers
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');
    const body = await req.text();

    if (!signature || !timestamp) {
      console.error(`[discord-interactions] ${requestId} missing signature headers`);
      return new Response('Missing signature headers', { status: 401, headers: corsHeaders });
    }

    // Verify signature
    const isValid = verifyDiscordSignature(publicKey, signature, timestamp, body);

    if (!isValid) {
      console.error(`[discord-interactions] ${requestId} invalid signature`, {
        signatureLength: signature.length,
        timestamp,
        bodyLength: body.length,
        publicKeyLength: publicKey.length,
      });
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const interaction = JSON.parse(body);
    console.log('Received interaction:', interaction.type);

    // Handle PING (type 1) - Discord verification
    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle Button interactions (type 3)
    if (interaction.type === 3) {
      console.log(`[discord-interactions] ${requestId} button clicked:`, interaction?.data?.custom_id);

      // Immediately acknowledge the interaction (must be within 3 seconds)
      const ackResponse = new Response(JSON.stringify({ type: 6 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

      // Start background work in a macrotask so it cannot block flushing the ack response.
      const backgroundTask = new Promise<void>((resolve) => {
        setTimeout(() => {
          processButtonInteraction(interaction, botToken, resultsChannelId)
            .catch((err) =>
              console.error(`[discord-interactions] ${requestId} background error:`, err)
            )
            .finally(() => resolve());
        }, 0);
      });

      try {
        // @ts-ignore: EdgeRuntime is provided by the edge runtime environment
        if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
          // @ts-ignore: EdgeRuntime is provided by the edge runtime environment
          EdgeRuntime.waitUntil(backgroundTask);
        } else {
          backgroundTask.catch((err) =>
            console.error(`[discord-interactions] ${requestId} background error:`, err)
          );
        }
      } catch {
        backgroundTask.catch((err) =>
          console.error(`[discord-interactions] ${requestId} background error:`, err)
        );
      }

      return ackResponse;
    }

    // Unknown interaction type
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error handling interaction:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});