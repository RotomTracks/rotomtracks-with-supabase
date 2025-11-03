import { supabase } from '../../lib/supabase';

export async function processTournament(
  tournamentId: string,
  fileId: string,
  options: { generateReport?: boolean; updateData?: boolean } = {}
) {
  // Try to call the existing API endpoint, passing the Supabase access token
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  const env: any = (import.meta as any).env || {};
  const baseUrl = env.VITE_WEB_BASE_URL || env.VITE_SITE_URL || env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_APP_URL || 'https://rotomtracks.es';
  const response = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      fileId,
      generateReport: options.generateReport !== false,
      updateData: options.updateData !== false,
    }),
  });

  if (!response.ok) {
    const err = await safeJson(response);
    throw new Error(err?.message || `Processing failed with status ${response.status}`);
  }

  return response.json();
}

async function safeJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}


