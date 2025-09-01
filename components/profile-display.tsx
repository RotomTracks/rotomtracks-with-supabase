"use client";

import { useState } from "react";
import { UserRole } from "@/lib/types/tournament";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { OrganizerRequestStatus } from "./organizer-request-status";
import { 
  User, 
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

interface ProfileDisplayProps {
  profile: {
    id?: string;
    first_name?: string;
    last_name?: string;
    player_id?: string;
    birth_year?: number;
    profile_image_url?: string;
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
      console.error('Error al copiar al portapapeles:', err);
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
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt="Imagen de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'Perfil Incompleto'
                }
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {isOrganizer ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Organizador</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">Jugador</span>
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
                    <span className="text-sm">Perfil completo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Perfil {completeness.percentage}% completo</span>
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
            <Button onClick={onEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </Card>

      {/* Información básica */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IdCard className="w-5 h-5" />
            Información Básica
          </h3>
          <Button
            onClick={copyBasicData}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 transition-colors ${
              copySuccess 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                : ''
            }`}
          >
            {copySuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar datos
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Player ID
            </label>
            <p className="text-gray-900 dark:text-white">
              {profile.player_id || 'No establecido'}
            </p>
          </div>
          
          {userEmail && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{userEmail}</p>
            </div>
          )}
          
          {profile.birth_year && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Año de Nacimiento
              </label>
              <p className="text-gray-900 dark:text-white">{profile.birth_year}</p>
            </div>
          )}
          
          {profile.created_at && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Miembro desde
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(profile.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Información específica del rol */}
      {isOrganizer && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Información de Organizador
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Liga/Tienda
              </label>
              <p className="text-gray-900 dark:text-white">
                {profile.organization_name || 'No especificada'}
              </p>
            </div>

            {profile.pokemon_league_url && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Enlace Oficial
                </label>
                <p className="text-gray-900 dark:text-white">
                  <a 
                    href={profile.pokemon_league_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Ver Liga/Tienda
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
            

          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privilegios de Organizador:</strong>
              <ul className="mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Crear y gestionar torneos</li>
                <li>• Subir archivos de torneo y resultados</li>
                <li>• Gestionar inscripciones de participantes</li>
                <li>• Generar reportes de torneos</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {!isOrganizer && (
        <>
          {/* Información de jugador con tooltip/popover */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600" />
                Cuenta de Jugador
              </h3>
              <div className="group relative">
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">¿Qué puedo hacer?</span>
                </button>
                
                {/* Tooltip con información */}
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-green-600 dark:text-green-400">Como jugador puedes:</strong>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Buscar y registrarte en torneos</li>
                      <li>• Ver resultados y clasificaciones</li>
                      <li>• Acceder a tu historial de torneos</li>
                      <li>• Ver tus estadísticas personales</li>
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