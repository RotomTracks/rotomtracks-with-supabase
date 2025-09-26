import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateTDFFile, extractTournamentSummary } from '@/lib/utils/tdf-parser';
import { FILE_UPLOAD_CONFIG } from '@/lib/constants/tournament';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Debes iniciar sesión para subir archivos' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    
    // Verify tournament exists and user has permission
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, organizer_id, name')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Solo el organizador puede subir archivos' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file
    const fileExtensionPart = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtensionPart) {
      return NextResponse.json(
        { 
          error: 'Invalid File Type', 
          message: 'El archivo debe tener una extensión válida' 
        },
        { status: 400 }
      );
    }
    
    const fileExtension = '.' + fileExtensionPart;
    
    if (!FILE_UPLOAD_CONFIG.allowedExtensions.includes(fileExtension as any)) {
      return NextResponse.json(
        { 
          error: 'Invalid File Type', 
          message: `Tipo de archivo no válido. Solo se permiten: ${FILE_UPLOAD_CONFIG.allowedExtensions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
      const maxSizeMB = Math.round(FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024));
      return NextResponse.json(
        { 
          error: 'File Too Large', 
          message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB` 
        },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    
    // Validate TDF file structure if it's a TDF file
    if (fileExtension === '.tdf') {
      const validation = validateTDFFile(fileContent);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid TDF File', 
            message: 'El archivo TDF no es válido',
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      // Extract tournament summary for additional validation
      try {
        const summary = extractTournamentSummary(fileContent);
        
        // Optional: Validate that the TDF tournament matches the database tournament
        if (summary.name !== tournament.name) {
          // Tournament name mismatch - could be intentional
        }
      } catch {
        // Could not extract tournament summary - not critical
      }
    }

    // Generate unique file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `tournaments/${tournamentId}/uploads/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload Failed', message: 'Error al subir el archivo al almacenamiento' },
        { status: 500 }
      );
    }

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('tournament_files')
      .insert({
        tournament_id: tournamentId,
        file_name: file.name,
        file_path: uploadData.path,
        file_type: fileExtension.substring(1), // Remove the dot
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('tournament-files')
        .remove([uploadData.path]);

      return NextResponse.json(
        { error: 'Database Error', message: 'Error al guardar la información del archivo' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension.substring(1),
      uploadPath: uploadData.path,
      message: 'Archivo subido exitosamente',
    });

  } catch (error) {
    console.error('Upload endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}