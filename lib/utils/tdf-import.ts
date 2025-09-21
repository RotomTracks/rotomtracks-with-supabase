import { createClient } from '@/lib/supabase/server';
import { TDFImportReport } from '@/lib/types/tournament';

export interface TDFParticipantData {
  player_name: string;
  player_id: string; // Always required - TDF always provides this
  player_birthdate: string; // Always required - TDF always provides this
  email?: string;
  tdf_userid?: string;
}

export async function verifyTDFParticipants(
  participants: TDFParticipantData[]
): Promise<TDFImportReport> {
  const supabase = await createClient();
  const report: TDFImportReport = {
    total_participants: participants.length,
    imported_participants: 0,
    skipped_participants: 0,
    imported_users: [],
    skipped_users: []
  };

  for (const participant of participants) {
    try {
      let user = null;
      
      if (participant.player_id) {
        const { data: userByPlayerId } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, player_id')
          .eq('player_id', participant.player_id)
          .single();
        user = userByPlayerId;
      }

      if (!user && participant.email) {
        const { data: userByEmail } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, player_id')
          .eq('email', participant.email)
          .single();
        user = userByEmail;
      }

      if (!user && participant.player_name) {
        const nameParts = participant.player_name.trim().split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          const { data: userByName } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, player_id')
            .ilike('first_name', firstName)
            .ilike('last_name', lastName)
            .single();
          user = userByName;
        }
      }

      if (user) {
        report.imported_participants++;
        report.imported_users.push({
          player_name: participant.player_name,
          player_id: participant.player_id,
          player_birthdate: participant.player_birthdate,
          user_id: user.id
        });
      } else {
        report.skipped_participants++;
        report.skipped_users.push({
          player_name: participant.player_name,
          player_id: participant.player_id,
          player_birthdate: participant.player_birthdate,
          reason: 'no_account'
        });
      }
    } catch {
      report.skipped_participants++;
      report.skipped_users.push({
        player_name: participant.player_name,
        player_id: participant.player_id,
        player_birthdate: participant.player_birthdate,
        reason: 'invalid_data'
      });
    }
  }

  return report;
}

export async function importTDFParticipants(
  tournamentId: string,
  participants: TDFParticipantData[]
): Promise<{
  report: TDFImportReport;
  createdParticipants: Record<string, unknown>[];
}> {
  const supabase = await createClient();
  const report = await verifyTDFParticipants(participants);
  const createdParticipants = [];

  for (const importedUser of report.imported_users) {
    try {
      const { data: existingParticipant } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', importedUser.user_id)
        .single();

      if (existingParticipant) {
        report.imported_participants--;
        report.skipped_participants++;
        report.skipped_users.push({
          player_name: importedUser.player_name,
          player_id: importedUser.player_id,
          player_birthdate: importedUser.player_birthdate,
          reason: 'duplicate'
        });
        continue;
      }

      const { data: participant, error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: importedUser.user_id,
          player_name: importedUser.player_name,
          player_id: importedUser.player_id,
          player_birthdate: importedUser.player_birthdate,
          registration_date: new Date().toISOString(),
          registration_source: 'tdf_import',
          status: 'registered'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating participant:', error);
        report.imported_participants--;
        report.skipped_participants++;
        report.skipped_users.push({
          player_name: importedUser.player_name,
          player_id: importedUser.player_id,
          player_birthdate: importedUser.player_birthdate,
          reason: 'invalid_data'
        });
      } else {
        createdParticipants.push(participant);
      }
    } catch (error) {
      console.error('Error processing participant:', error);
      report.imported_participants--;
      report.skipped_participants++;
      report.skipped_users.push({
        player_name: importedUser.player_name,
        player_id: importedUser.player_id,
        player_birthdate: importedUser.player_birthdate,
        reason: 'invalid_data'
      });
    }
  }

  if (createdParticipants.length > 0) {
    await supabase.rpc('increment_tournament_participants', {
      tournament_id: tournamentId,
      increment_by: createdParticipants.length
    });
  }

  return { report, createdParticipants };
}

export function formatImportReport(report: TDFImportReport): string {
  let message = `Importación completada: ${report.imported_participants} de ${report.total_participants} participantes añadidos.`;
  
  if (report.skipped_participants > 0) {
    message += `\n\n${report.skipped_participants} participantes no fueron añadidos:`;
    
    const noAccountUsers = report.skipped_users.filter(u => u.reason === 'no_account');
    const duplicateUsers = report.skipped_users.filter(u => u.reason === 'duplicate');
    const invalidUsers = report.skipped_users.filter(u => u.reason === 'invalid_data');

    if (noAccountUsers.length > 0) {
      message += `\n\nSin cuenta en RotomTracks (${noAccountUsers.length}):`;
      noAccountUsers.forEach(user => {
        message += `\n- ${user.player_name} (ID: ${user.player_id})`;
      });
      message += `\n\nEstos jugadores deben crear una cuenta en RotomTracks para poder participar.`;
    }

    if (duplicateUsers.length > 0) {
      message += `\n\nYa registrados (${duplicateUsers.length}):`;
      duplicateUsers.forEach(user => {
        message += `\n- ${user.player_name} (ID: ${user.player_id})`;
      });
    }

    if (invalidUsers.length > 0) {
      message += `\n\nDatos inválidos (${invalidUsers.length}):`;
      invalidUsers.forEach(user => {
        message += `\n- ${user.player_name} (ID: ${user.player_id})`;
      });
    }
  }

  return message;
}