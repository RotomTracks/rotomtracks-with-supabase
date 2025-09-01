'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, MapPin, Users } from 'lucide-react';

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
}

export function TournamentFilters({ searchParams, onFilterChange }: TournamentFiltersProps) {
  const tournamentTypes = [
    { value: 'vgc', label: 'VGC', icon: '🎮' },
    { value: 'tcg', label: 'TCG', icon: '🃏' },
    { value: 'go', label: 'Pokémon GO', icon: '📱' },
    { value: 'premier', label: 'Premier Event', icon: '🏆' },
    { value: 'league', label: 'League Cup', icon: '🥤' },
    { value: 'challenge', label: 'Challenge', icon: '⚔️' },
    { value: 'prerelease', label: 'Prerelease', icon: '📦' }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Próximos', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ongoing', label: 'En Curso', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completados', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelados', color: 'bg-red-100 text-red-800' }
  ];

  const popularLocations = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza',
    'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Valladolid', 'Córdoba'
  ];

  const handleTypeFilter = (type: string) => {
    const currentTypes = searchParams.type ? searchParams.type.split(',') : [];
    let newTypes: string[];
    
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    
    onFilterChange({ 
      type: newTypes.length > 0 ? newTypes.join(',') : undefined,
      page: '1'
    });
  };

  const handleStatusFilter = (status: string) => {
    const currentStatus = searchParams.status;
    onFilterChange({ 
      status: currentStatus === status ? undefined : status,
      page: '1'
    });
  };

  const handleLocationFilter = (location: string) => {
    onFilterChange({ 
      location: location,
      page: '1'
    });
  };

  const selectedTypes = searchParams.type ? searchParams.type.split(',') : [];
  const selectedStatus = searchParams.status;

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
      {/* Tournament Types */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Tipo de Torneo</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {tournamentTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedTypes.includes(type.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeFilter(type.value)}
              className="text-xs"
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
          <Calendar className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Estado</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(status.value)}
              className="text-xs"
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Locations */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Ubicaciones Populares</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((location) => (
            <Button
              key={location}
              variant="outline"
              size="sm"
              onClick={() => handleLocationFilter(location)}
              className="text-xs"
            >
              {location}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedTypes.length > 0 || selectedStatus || searchParams.location) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Filtros Activos</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => {
              const typeInfo = tournamentTypes.find(t => t.value === type);
              return (
                <Badge key={type} variant="secondary" className="text-xs">
                  {typeInfo?.icon} {typeInfo?.label}
                </Badge>
              );
            })}
            {selectedStatus && (
              <Badge variant="secondary" className="text-xs">
                📅 {statusOptions.find(s => s.value === selectedStatus)?.label}
              </Badge>
            )}
            {searchParams.location && (
              <Badge variant="secondary" className="text-xs">
                📍 {searchParams.location}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">150+</div>
          <div className="text-xs text-gray-600">Torneos Activos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">25</div>
          <div className="text-xs text-gray-600">Ciudades</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">5K+</div>
          <div className="text-xs text-gray-600">Participantes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">12</div>
          <div className="text-xs text-gray-600">Esta Semana</div>
        </div>
      </div>
    </div>
  );
}