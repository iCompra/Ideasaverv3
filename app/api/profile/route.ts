import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from 'next/server'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  console.log('🚀 API Route: /api/profile - POST request received.');
  
  const currentSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`API Route: ENV Check -> SUPABASE_URL: ${currentSupabaseUrl ? 'LOADED' : 'NOT LOADED'}`);
  console.log(`API Route: ENV Check -> SUPABASE_SERVICE_ROLE_KEY: ${currentServiceRoleKey ? 'LOADED (length: ' + currentServiceRoleKey.length + ')' : 'NOT LOADED'}`);
  console.log(`API Route: ENV Check -> Key starts with: ${currentServiceRoleKey ? currentServiceRoleKey.substring(0, 5) + '...' : 'N/A'}`);

  let adminClientInstance;
  try {
      adminClientInstance = createClient(
          currentSupabaseUrl || '', 
          currentServiceRoleKey || '' 
      );
      console.log('API Route: Supabase Admin client initialized successfully.');
  } catch (clientError) {
      console.error('❌ API Route: Error initializing Supabase Admin client:', clientError);
      return NextResponse.json({ error: 'Failed to initialize Supabase client' }, { status: 500 });
  }

  try {
    const { userId, userEmail, ...additionalData } = await request.json();
    console.log('API Route: Request body received - userId:', userId, 'userEmail:', userEmail, 'additionalData:', additionalData);

    if (!userId || !userEmail) {
      console.error('API Route Error: Missing userId or userEmail in request body.');
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    // First, try to fetch the existing profile
    console.log('API Route: Attempting to fetch existing profile for userId:', userId);
    const { data: existingProfile, error: fetchError } = await adminClientInstance
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ API Route Error fetching existing profile:', fetchError);
      return NextResponse.json({ error: fetchError.message || 'Failed to fetch existing profile' }, { status: 500 });
    }

    let profileData;
    let operationType;

    if (existingProfile) {
      // Profile exists - UPDATE with merged data
      operationType = 'UPDATE';
      console.log('API Route: Existing profile found. Merging additionalData with existing profile.');
      console.log('API Route: Existing profile data:', existingProfile);
      
      const updatePayload = {
        ...existingProfile,
        ...additionalData // CRITICAL: This will override existing values only if provided
      };

      console.log('API Route: Update payload:', updatePayload);

      const { data: updatedProfile, error: updateError } = await adminClientInstance
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ API Route Error updating existing profile:', updateError);
        return NextResponse.json({ error: updateError.message || 'Failed to update existing profile' }, { status: 500 });
      }

      profileData = updatedProfile;
    } else {
      // Profile doesn't exist - INSERT with defaults + additionalData
      operationType = 'INSERT';
      console.log('API Route: No existing profile found. Creating new profile with defaults + additionalData.');
      
      const defaultInsertProfile = {
        id: userId,
        email: userEmail,
        credits: 25, 
        current_plan: 'free',
        has_purchased_app: false,
        cloud_sync_enabled: false,
        auto_cloud_sync: false,
        deletion_policy_days: 0,
        plan_selected: false
      };

      const insertPayload = {
        ...defaultInsertProfile,
        ...additionalData // This will override defaults if provided
      };

      console.log('API Route: Insert payload:', insertPayload);

      const { data: insertedProfile, error: insertError } = await adminClientInstance
        .from('profiles')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ API Route Error inserting new profile:', insertError);
        return NextResponse.json({ error: insertError.message || 'Failed to insert new profile' }, { status: 500 });
      }

      profileData = insertedProfile;
    }

    console.log(`✅ API Route: Profile ${operationType} successful. Returning profile:`, profileData?.id, 'Credits:', profileData?.credits, 'Plan Selected:', profileData?.plan_selected);
    return NextResponse.json({ success: true, profile: profileData }, { status: 200 });

  } catch (error: any) {
    console.error('❌ API Route General Error during request processing:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred in API Route' }, { status: 500 });
  }
}