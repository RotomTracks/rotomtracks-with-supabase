import { supabase } from '../../lib/supabase';

export async function uploadTDFAndRegister(
  tournamentId: string,
  filePath: string,
  content: string
): Promise<{ fileId: string; fileName: string; uploadPath: string }> {
  const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}.tdf`;
  const storagePath = `tournaments/${tournamentId}/uploads/${filename}`;
  const blob = new Blob([content], { type: 'application/xml' });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('tournament-files')
    .upload(storagePath, blob, { contentType: 'application/xml', upsert: false });
  if (uploadError) throw uploadError;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  if (!uploadData) {
    throw new Error('No upload data returned');
  }

  const { data: inserted, error: insertError } = await supabase
    .from('tournament_files')
    .insert({
      tournament_id: tournamentId,
      file_name: filename,
      file_path: uploadData.path,
      file_type: 'tdf',
      file_size: content.length,
      uploaded_by: userId,
    })
    .select('id, file_name, file_path')
    .single();
  if (insertError) throw insertError;

  return { fileId: inserted.id as string, fileName: inserted.file_name as string, uploadPath: inserted.file_path as string };
}


