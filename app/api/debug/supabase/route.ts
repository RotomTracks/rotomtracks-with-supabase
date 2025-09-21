import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('tournaments')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        queryResult: data,
      },
      auth: {
        error: authError?.message || null,
        hasUser: !!user,
        userId: user?.id || null,
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}