// app/api/profile/route.ts
import { createClient } from '@supabase/supabase-js'; // Import the Supabase client library
import { NextResponse } from 'next/server'; // For Next.js API Routes

// CRITICAL: Initialize Supabase client with SERVICE_ROLE_KEY
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

    // --- CRITICAL: Implement "Read-or-Create" logic ---
    console.log('API Route: Attempting to fetch existing profile for userId:', userId);
    const { data: existingProfile, error: selectError } = await adminClientInstance
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (selectError && selectError.code === 'PGRST116') { // PGRST116 means "no rows found"
        // Profile does not exist, so insert it with default values
        console.log('API Route: Profile not found. Creating new profile with defaults.');
        const { data: newProfileData, error: insertError } = await adminClientInstance
            .from('profiles')
            .insert({
                id: userId,
                email: userEmail,
                credits: 25, // Default initial credits for new users
                current_plan: 'free',
                has_purchased_app: false,
                cloud_sync_enabled: false,
                auto_cloud_sync: false,
                deletion_policy_days: 0,
                created_at: new Date().toISOString()
            })
            .select('*')
            .single();

        if (insertError) {
            console.error('❌ API Route Error inserting new profile:', insertError);
            return NextResponse.json({ error: insertError.message || 'Failed to create new profile' }, { status: 500 });
        }
        console.log('✅ API Route: New profile created successfully. Returning:', newProfileData?.id);
        return NextResponse.json({ success: true, profile: newProfileData }, { status: 200 });

    } else if (selectError) {
        // Other errors during select (e.g., DB connection issue, RLS if admin key fails)
        console.error('❌ API Route Error fetching existing profile:', selectError);
        return NextResponse.json({ error: selectError.message || 'Failed to fetch existing profile' }, { status: 500 });
    } else {
        // Profile exists, return it without modification
        console.log('✅ API Route: Existing profile found. Returning:', existingProfile?.id, 'Credits:', existingProfile?.credits);
        return NextResponse.json({ success: true, profile: existingProfile }, { status: 200 });
    }

  } catch (error: any) {
    console.error('❌ API Route General Error during request processing:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred in API Route' }, { status: 500 });
  }
}