import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user or sign in if exists
    let userId: string;

    // Try to create the user first
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (signUpError) {
      // If user already exists, get their ID
      if (signUpError.message.includes('already been registered') || signUpError.message.includes('already exists')) {
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listing users:', listError);
          return new Response(
            JSON.stringify({ error: 'Failed to find user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const existingUser = users.users.find(u => u.email === email);
        if (!existingUser) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        userId = existingUser.id;
        console.log(`Found existing user: ${userId}`);
      } else {
        console.error('Error creating user:', signUpError);
        return new Response(
          JSON.stringify({ error: signUpError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      userId = signUpData.user.id;
      console.log(`Created new user: ${userId}`);
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleCheckError) {
      console.error('Error checking role:', roleCheckError);
    }

    if (!existingRole) {
      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error adding admin role:', roleError);
        return new Response(
          JSON.stringify({ error: 'Failed to add admin role: ' + roleError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Added admin role to user: ${userId}`);
    } else {
      console.log(`User ${userId} already has admin role`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created/updated successfully',
        userId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Setup admin error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
