import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return new Response(JSON.stringify({ error: 'Missing code or userId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key for elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the PostgreSQL function that handles the transaction
    const { data, error } = await supabaseAdmin.rpc('redeem_gift_code_transaction', {
      p_code: code,
      p_user_id: userId
    });

    if (error) {
      console.error('RPC Error:', error);
      // Translate specific PostgreSQL function errors to user-friendly messages
      let errorMessage = 'Failed to redeem code. Please try again.';
      if (error.message.includes('Code not found or already used')) {
        errorMessage = 'Invalid or already used gift code.';
      } else if (error.message.includes('User profile not found')) {
        errorMessage = 'User profile not found. Please log in again.';
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // The RPC function returns the new credit balance
    return new Response(JSON.stringify({ success: true, newCredits: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Request Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});