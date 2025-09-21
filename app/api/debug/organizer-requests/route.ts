import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test if organizer_requests table exists
    const { data, error } = await supabase
      .from('organizer_requests')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        tableExists: false,
      }, { status: 500 });
    }

    // Test table structure
    const { error: structureError } = await supabase
      .from('organizer_requests')
      .select('*')
      .limit(0);

    return NextResponse.json({
      success: true,
      tableExists: true,
      count: data?.length || 0,
      structure: structureError ? null : 'Table structure accessible',
      error: structureError?.message || null,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tableExists: false,
    }, { status: 500 });
  }
}