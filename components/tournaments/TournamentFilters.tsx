"use client";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icons
import { Calendar, Trophy, MapPin } from "lucide-react";

// Types
import {
  TournamentType,
  TournamentStatus,
  UserRole,
} from "@/lib/types/tournament";

// Utilities
import {
  getStatusColor,
  STATUS_TRANSLATIONS,
  getTournamentTypeIcon,
  getTournamentTypeColor,
} from "@/lib/utils/tournament-status";

interface TournamentFiltersProps {
  searchParams: {
    q?: string;
    location?: string;
    type?: string;
    status?: string;
    page?: string;
    sort?: string;
  };
  onFilterChange: (updates: Record<string, string | undefined>) => void;
  userRole?: UserRole;
  loading?: boolean;
}

export function TournamentFilters({
  searchParams,
  onFilterChange,
  loading = false,
}: TournamentFiltersProps) {
  // Use centralized tournament types with icons
  const tournamentTypes = [
    {
      value: TournamentType.TCG_PRERELEASE,
      label: "TCG Prerelease",
      icon: getTournamentTypeIcon(TournamentType.TCG_PRERELEASE),
      color: getTournamentTypeColor(TournamentType.TCG_PRERELEASE),
    },
    {
      value: TournamentType.TCG_LEAGUE_CHALLENGE,
      label: "TCG League Challenge",
      icon: getTournamentTypeIcon(TournamentType.TCG_LEAGUE_CHALLENGE),
      color: getTournamentTypeColor(TournamentType.TCG_LEAGUE_CHALLENGE),
    },
    {
      value: TournamentType.TCG_LEAGUE_CUP,
      label: "TCG League Cup",
      icon: getTournamentTypeIcon(TournamentType.TCG_LEAGUE_CUP),
      color: getTournamentTypeColor(TournamentType.TCG_LEAGUE_CUP),
    },
    {
      value: TournamentType.VGC_PREMIER_EVENT,
      label: "VGC Premier",
      icon: getTournamentTypeIcon(TournamentType.VGC_PREMIER_EVENT),
      color: getTournamentTypeColor(TournamentType.VGC_PREMIER_EVENT),
    },
        {
      value: TournamentType.GO_PREMIER_EVENT,
      label: "GO Premier",
      icon: getTournamentTypeIcon(TournamentType.GO_PREMIER_EVENT),
      color: getTournamentTypeColor(TournamentType.GO_PREMIER_EVENT),
    }
  ];

  // Use centralized status options
  const statusOptions = [
    {
      value: TournamentStatus.UPCOMING,
      label: STATUS_TRANSLATIONS.tournament[TournamentStatus.UPCOMING],
      color: getStatusColor(TournamentStatus.UPCOMING),
    },
    {
      value: TournamentStatus.ONGOING,
      label: STATUS_TRANSLATIONS.tournament[TournamentStatus.ONGOING],
      color: getStatusColor(TournamentStatus.ONGOING),
    },
    {
      value: TournamentStatus.COMPLETED,
      label: STATUS_TRANSLATIONS.tournament[TournamentStatus.COMPLETED],
      color: getStatusColor(TournamentStatus.COMPLETED),
    },
    {
      value: TournamentStatus.CANCELLED,
      label: STATUS_TRANSLATIONS.tournament[TournamentStatus.CANCELLED],
      color: getStatusColor(TournamentStatus.CANCELLED),
    },
  ];

  const popularLocations = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Bilbao",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Las Palmas",
    "Valladolid",
    "Córdoba",
  ];

  const handleTypeFilter = (type: string) => {
    const currentTypes = searchParams.type ? searchParams.type.split(",") : [];
    let newTypes: string[];

    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter((t) => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }

    onFilterChange({
      type: newTypes.length > 0 ? newTypes.join(",") : undefined,
      page: "1",
    });
  };

  const handleStatusFilter = (status: string) => {
    const currentStatus = searchParams.status;
    onFilterChange({
      status: currentStatus === status ? undefined : status,
      page: "1",
    });
  };

  const handleLocationFilter = (location: string) => {
    onFilterChange({
      location: location,
      page: "1",
    });
  };

  const selectedTypes = searchParams.type ? searchParams.type.split(",") : [];
  const selectedStatus = searchParams.status;

  // Render loading state
  const renderLoadingState = () => (
    <div
      className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
      role="status"
      aria-label="Cargando filtros"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
            ></div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"
            ></div>
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando filtros de torneos...</span>
    </div>
  );

  if (loading) return renderLoadingState();

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      {/* Tournament Types */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Tipo de Torneo
          </h4>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtros de tipo de torneo"
        >
          {tournamentTypes.map((type) => (
            <Button
              key={type.value}
              variant={
                selectedTypes.includes(type.value) ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleTypeFilter(type.value)}
              className="text-xs"
              aria-pressed={selectedTypes.includes(type.value)}
              aria-label={`Filtrar por ${type.label}`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Estado
          </h4>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtros de estado de torneo"
        >
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status.value)}
              className="text-xs"
              aria-pressed={selectedStatus === status.value}
              aria-label={`Filtrar por ${status.label}`}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Locations */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Ubicaciones Populares
          </h4>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtros de ubicación"
        >
          {popularLocations.map((location) => (
            <Button
              key={location}
              variant="outline"
              size="sm"
              onClick={() => handleLocationFilter(location)}
              className="text-xs"
              aria-label={`Filtrar por ${location}`}
            >
              {location}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedTypes.length > 0 ||
        selectedStatus ||
        searchParams.location) && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Filtros Activos
          </h4>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Filtros activos"
          >
            {selectedTypes.map((type) => {
              const typeInfo = tournamentTypes.find((t) => t.value === type);
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className="text-xs"
                  role="listitem"
                >
                  {typeInfo?.icon} {typeInfo?.label}
                </Badge>
              );
            })}
            {selectedStatus && (
              <Badge variant="secondary" className="text-xs" role="listitem">
                📅{" "}
                {statusOptions.find((s) => s.value === selectedStatus)?.label}
              </Badge>
            )}
            {searchParams.location && (
              <Badge variant="secondary" className="text-xs" role="listitem">
                📍 {searchParams.location}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t dark:border-gray-600">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">150+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Torneos Activos
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">25</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Ciudades
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">5K+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Participantes
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">12</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Esta Semana
          </div>
        </div>
      </div>
    </div>
  );
}
