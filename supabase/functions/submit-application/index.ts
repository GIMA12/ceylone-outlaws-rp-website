import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplicationData {
  discordUsername: string;
  discordId: string;
  age: string;
  timezone: string;
  characterName: string;
  characterBackstory: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    if (!botToken) {
      console.error('Missing DISCORD_BOT_TOKEN');
      throw new Error('Server configuration error');
    }

    const data: ApplicationData = await req.json();
    console.log('Received application:', { 
      discordUsername: data.discordUsername,
      characterName: data.characterName 
    });

    // Validate required fields
    if (!data.discordUsername || !data.discordId || !data.age || 
        !data.timezone || !data.characterName || !data.characterBackstory) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate backstory if too long for Discord embed
    const backstory = data.characterBackstory.length > 1000 
      ? data.characterBackstory.substring(0, 997) + '...' 
      : data.characterBackstory;

    const timestamp = new Date().toISOString();

    // Create professional Discord embed
    const embed = {
      title: '📜 New Whitelist Application',
      description: `A new application has been submitted and requires review.`,
      color: 0xD4AF37, // Gold color for pending
      thumbnail: {
        url: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' // User icon
      },
      fields: [
        {
          name: '👤 Discord Username',
          value: `\`${data.discordUsername}\``,
          inline: true
        },
        {
          name: '🆔 Discord ID',
          value: `\`${data.discordId}\``,
          inline: true
        },
        {
          name: '📅 Age',
          value: data.age,
          inline: true
        },
        {
          name: '🌍 Timezone',
          value: data.timezone,
          inline: true
        },
        {
          name: '\u200B', // Spacer
          value: '\u200B',
          inline: true
        },
        {
          name: '⏰ Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
          inline: true
        },
        {
          name: '🤠 Character Name',
          value: `**${data.characterName}**`,
          inline: false
        },
        {
          name: '📖 Character Backstory',
          value: backstory,
          inline: false
        }
      ],
      footer: {
        text: '⏳ Status: Pending Review',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png'
      },
      timestamp: timestamp
    };

    // Interactive buttons - ONLY works with Bot API, not webhooks
    const components = [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 3, // Success (green)
            label: 'Accept',
            emoji: { name: '✅' },
            custom_id: `accept_${data.discordId}_${data.discordUsername.replace(/_/g, '-')}`
          },
          {
            type: 2, // Button
            style: 4, // Danger (red)
            label: 'Decline',
            emoji: { name: '❌' },
            custom_id: `decline_${data.discordId}_${data.discordUsername.replace(/_/g, '-')}`
          }
        ]
      }
    ];

    // Extract channel ID from webhook URL
    // Webhook URL format: https://discord.com/api/webhooks/{webhook_id}/{token}
    // We need to get the channel ID from the webhook
    let channelId: string | null = null;

    if (webhookUrl) {
      const webhookMatch = webhookUrl.match(/\/webhooks\/(\d+)\/([^/]+)/);
      if (webhookMatch) {
        // Get webhook info to find channel ID
        const webhookInfoResponse = await fetch(webhookUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (webhookInfoResponse.ok) {
          const webhookInfo = await webhookInfoResponse.json();
          channelId = webhookInfo.channel_id;
          console.log('Extracted channel ID from webhook:', channelId);
        }
      }
    }

    if (!channelId) {
      throw new Error('Could not determine channel ID. Please check DISCORD_WEBHOOK_URL.');
    }

    // Send message via Bot API (supports interactive buttons)
    console.log('Sending application via Bot API to channel:', channelId);
    
    const botPayload = {
      embeds: [embed],
      components: components
    };

    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botPayload),
      }
    );

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord Bot API error:', errorText);
      throw new Error(`Discord API error: ${discordResponse.status} - ${errorText}`);
    }

    const discordResult = await discordResponse.json();
    console.log('Discord message sent successfully:', discordResult.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application submitted successfully',
        messageId: discordResult.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing application:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit application';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
