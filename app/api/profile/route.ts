// app/api/profile/route.ts
// This is a Serverless Function (API Route) in Next.js App Router
// It will run on the server, allowing us to use Supabase Service Role Key

import { createClient } from '@supabase/supabase-js'; // Import the Supabase client library
import { NextResponse } from 'next/server'; // For Next.js API Routes

// CRITICAL: Initialize Supabase client with SERVICE_ROLE_KEY
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local for Next.js server environment
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', // Use NEXT_PUBLIC for URL as it's client-exposed
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Use direct env for SERVICE_ROLE_KEY as it's server-only
);

export async function POST(request: Request) {
  console.log('🚀 API Route: /api/profile - POST request received.');
  
  // CRITICAL DIAGNOSIS: Log the environment variable value for verification
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`API Route: ENV Check -> SUPABASE_URL: ${supabaseUrl ? 'LOADED' : 'NOT LOADED'}`);
  console.log(`API Route: ENV Check -> SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'LOADED (length: ' + serviceRoleKey.length + ')' : 'NOT LOADED'}`);
  console.log(`API Route: ENV Check -> Key starts with: ${serviceRoleKey ? serviceRoleKey.substring(0, 5) + '...' : 'N/A'}`); // Log first 5 chars for verification

  // CRITICAL DIAGNOSIS: Try-catch for client creation
  let adminClientInstance;
  try {
      adminClientInstance = createClient(
          supabaseUrl || '', 
          serviceRoleKey || '' 
      );
      console.log('API Route: Supabase Admin client initialized successfully.');
  } catch (clientError) {
      console.error('❌ API Route: Error initializing Supabase Admin client:', clientError);
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
  }

  try {
    const { userId, userEmail } = await request.json();
    console.log('API Route: Request body received - userId:', userId, 'userEmail:', userEmail);

    if (!userId || !userEmail) {
      console.error('API Route Error: Missing userId or userEmail in request body.');
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    console.log('API Route: Attempting profile upsert with userId:', userId);
    const { data: profileData, error: upsertError } = await adminClientInstance // Use the initialized instance
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        credits: 25, 
        current_plan: 'free',
        has_purchased_app: false,
        cloud_sync_enabled: false,
        auto_cloud_sync: false,
        deletion_policy_days: 0,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' }) 
      .select('*') 
      .single(); 

    if (upsertError) {
      console.error('❌ API Route Error upserting profile in Supabase (from DB response):', upsertError);
      return NextResponse.json({ error: upsertError.message || 'Failed to upsert profile in DB' }, { status: 500 });
    }

    console.log('✅ API Route: Profile upsert successful. Returning profile:', profileData?.id);
    return NextResponse.json({ success: true, profile: profileData }, { status: 200 });

  } catch (error: any) {
    console.error('❌ API Route General Error during request processing:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}