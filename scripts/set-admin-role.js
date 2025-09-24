#!/usr/bin/env node

/**
 * Script to set admin role for a user
 * Usage: node scripts/set-admin-role.js <user-email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVER_AUTH || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_DATABASE_URL');
  console.error('   - SERVER_AUTH');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole(userEmail) {
  console.log(`🔍 Looking for user with email: ${userEmail}`);
  
  try {
    // First, get the user from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return false;
    }
    
    const user = authUsers.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ User with email ${userEmail} not found in auth.users`);
      return false;
    }
    
    console.log(`✅ Found user: ${user.id} (${user.email})`);
    
    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching user profile:', profileError.message);
      return false;
    }
    
    if (!profile) {
      console.log('📝 Creating user profile...');
      
      // Create user profile with admin role
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          user_role: 'admin',
          first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Admin',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating user profile:', createError.message);
        return false;
      }
      
      console.log('✅ User profile created with admin role');
      return true;
    } else {
      console.log('📝 Updating existing user profile...');
      
      // Update existing profile to admin role
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          user_role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating user profile:', updateError.message);
        return false;
      }
      
      console.log('✅ User profile updated to admin role');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.error('❌ Please provide a user email');
    console.error('Usage: node scripts/set-admin-role.js <user-email>');
    process.exit(1);
  }
  
  console.log('🚀 Setting admin role for user...\n');
  
  const success = await setAdminRole(userEmail);
  
  if (success) {
    console.log('\n🎉 Admin role set successfully!');
    console.log('You can now access the admin panel.');
  } else {
    console.log('\n❌ Failed to set admin role');
    process.exit(1);
  }
}

main().catch(console.error);
