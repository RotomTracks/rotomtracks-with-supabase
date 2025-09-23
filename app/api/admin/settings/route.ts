import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching settings:', settingsError);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return default settings if none exist
    const defaultSettings = {
      site_name: 'RotomTracks',
      site_description: 'Plataforma de gestión de torneos Pokémon',
      maintenance_mode: false,
      allow_registration: true,
      require_email_verification: true,
      max_tournaments_per_user: 10,
      auto_approve_organizers: false,
      enable_notifications: true,
      enable_analytics: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: settings || defaultSettings
    });

  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      siteName,
      siteDescription,
      maintenanceMode,
      allowRegistration,
      requireEmailVerification,
      maxTournamentsPerUser,
      autoApproveOrganizers,
      enableNotifications,
      enableAnalytics
    } = body;

    // Validate input
    if (!siteName || typeof siteName !== 'string') {
      return NextResponse.json({ error: 'Invalid site name' }, { status: 400 });
    }

    if (maxTournamentsPerUser < 1 || maxTournamentsPerUser > 100) {
      return NextResponse.json({ error: 'Invalid max tournaments per user' }, { status: 400 });
    }

    // Prepare settings data
    const settingsData = {
      site_name: siteName,
      site_description: siteDescription,
      maintenance_mode: Boolean(maintenanceMode),
      allow_registration: Boolean(allowRegistration),
      require_email_verification: Boolean(requireEmailVerification),
      max_tournaments_per_user: Number(maxTournamentsPerUser),
      auto_approve_organizers: Boolean(autoApproveOrganizers),
      enable_notifications: Boolean(enableNotifications),
      enable_analytics: Boolean(enableAnalytics),
      updated_at: new Date().toISOString()
    };

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('admin_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('admin_settings')
        .insert([{
          ...settingsData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving settings:', result.error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
