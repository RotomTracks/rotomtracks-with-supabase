"use client";

import { useState } from "react";
import { UserRole } from "@/lib/types/tournament";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizerRequestStatus } from "@/components/organizer/OrganizerRequestStatus";
import { 
  Building2, 
  Trophy, 
  IdCard,
  Edit,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Info
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useFormatting, useTypedTranslation } from "@/lib/i18n";

interface ProfileDisplayProps {
  profile: {
    id?: string;
    first_name?: string;
    last_name?: string;
    player_id?: string;
    birth_year?: number;
    user_role?: string;
    organization_name?: string;
    pokemon_league_url?: string;
    created_at?: string;
    updated_at?: string;
  };
  userEmail?: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export function ProfileDisplay({ 
  profile, 
  userEmail, 
  onEdit, 
  showEditButton = true 
}: ProfileDisplayProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { formatLongDate } = useFormatting();
  const { tUI, tPages } = useTypedTranslation();
  const isOrganizer = profile.user_role === UserRole.ORGANIZER;

  // Función para copiar datos básicos al portapapeles
  const copyBasicData = async () => {
    const data = [
      `Nombre: ${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      `Email: ${userEmail || ''}`,
      `Player ID: ${profile.player_id || ''}`,
      `Año de nacimiento: ${profile.birth_year || ''}`
    ].filter(line => !line.endsWith(': ')).join('\n');

    try {
      await navigator.clipboard.writeText(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error(tUI('messages.error.copyError'), err);
    }
  };
  
  // Calcular completitud del perfil
  const getProfileCompleteness = () => {
    const requiredFields = ['first_name', 'last_name', 'player_id', 'birth_year'];
    const organizerFields = isOrganizer ? ['organization_name'] : [];
    const allRequiredFields = [...requiredFields, ...organizerFields];
    
    const completedFields = allRequiredFields.filter(field => {
      const value = profile[field as keyof typeof profile];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      completed: completedFields.length,
      total: allRequiredFields.length,
      percentage: Math.round((completedFields.length / allRequiredFields.length) * 100)
    };
  };

  const completeness = getProfileCompleteness();

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar 
              firstName={profile.first_name}
              lastName={profile.last_name}
              email={userEmail}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : tPages('profile.display.incompleteProfile')
                }
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {isOrganizer ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{tPages('profile.display.organizer')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">{tPages('profile.display.player')}</span>
                  </div>
                )}
                {isOrganizer && profile.organization_name && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    • {profile.organization_name}
                  </span>
                )}
              </div>
              
              {/* Indicador de completitud */}
              <div className="flex items-center gap-2 mt-2">
                {completeness.percentage === 100 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{tPages('profile.display.profileComplete')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{tPages('profile.display.profilePercentComplete', { percent: completeness.percentage })}</span>
                  </div>
                )}
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      completeness.percentage === 100 
                        ? 'bg-green-500' 
                        : completeness.percentage >= 75 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {showEditButton && onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 transition-colors !bg-gray-100 hover:!bg-gray-200 !border-gray-300 !text-gray-700 dark:!bg-gray-700 dark:hover:!bg-gray-600 dark:!border-gray-600 dark:!text-gray-200"
            >
              <Edit className="w-4 h-4" />
              {tUI('buttons.edit')}
            </Button>
          )}
        </div>
      </Card>

      {/* Información básica */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IdCard className="w-5 h-5" />
            {tPages('profile.display.basicInfo')}
          </h3>
          <Button
            onClick={copyBasicData}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 transition-colors ${
              copySuccess 
                ? '!bg-green-50 !border-green-200 !text-green-700 dark:!bg-green-900/20 dark:!border-green-800 dark:!text-green-300' 
                : '!bg-gray-100 hover:!bg-gray-200 !border-gray-300 !text-gray-700 dark:!bg-gray-700 dark:hover:!bg-gray-600 dark:!border-gray-600 dark:!text-gray-200'
            }`}
          >
            {copySuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {tUI('messages.success.copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {tUI('buttons.copy')}
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {tPages('profile.display.playerId')}
            </label>
            <p className="text-gray-900 dark:text-white">
              {profile.player_id || tPages('profile.display.notSet')}
            </p>
          </div>
          
          {userEmail && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tPages('profile.display.email')}
              </label>
              <p className="text-gray-900 dark:text-white">{userEmail}</p>
            </div>
          )}
          
          {profile.birth_year && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tPages('profile.display.birthYear')}
              </label>
              <p className="text-gray-900 dark:text-white">{profile.birth_year}</p>
            </div>
          )}
          
          {profile.created_at && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tPages('profile.display.memberSince')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatLongDate(profile.created_at)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Información específica del rol */}
      {isOrganizer && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {tPages('profile.display.organizerInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tPages('profile.display.leagueStore')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {profile.organization_name || tPages('profile.display.notSpecified')}
              </p>
            </div>

            {profile.pokemon_league_url && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {tPages('profile.display.officialLink')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  <a 
                    href={profile.pokemon_league_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {tPages('profile.display.viewLeagueStore')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
            

          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{tPages('profile.display.organizerPrivileges')}</strong>
              <ul className="mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                <li>• {tPages('profile.display.organizerPrivilegesList.0')}</li>
                <li>• {tPages('profile.display.organizerPrivilegesList.1')}</li>
                <li>• {tPages('profile.display.organizerPrivilegesList.2')}</li>
                <li>• {tPages('profile.display.organizerPrivilegesList.3')}</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {!isOrganizer && (
        <>
          {/* Información de jugador con tooltip/popover */}
          <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600" />
                {tPages('profile.display.player')}
              </h3>
              <div className="group relative">
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">{tPages('profile.display.whatCanIDo')}</span>
                </button>
                
                {/* Tooltip con información */}
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-green-600 dark:text-green-400">{tPages('profile.display.asPlayerYouCan')}</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• {tPages('profile.display.playerCapabilities.0')}</li>
                      <li>• {tPages('profile.display.playerCapabilities.1')}</li>
                      <li>• {tPages('profile.display.playerCapabilities.2')}</li>
                      <li>• {tPages('profile.display.playerCapabilities.3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Tu cuenta está configurada como jugador</span>
            </div>
          </Card>

          {/* Estado de solicitud de organizador - solo mostrar si hay una solicitud */}
          <OrganizerRequestStatus 
            userId={profile.id || ''} 
            userEmail={userEmail}
            showTitle={true}
          />
        </>
      )}
    </div>
  );
}