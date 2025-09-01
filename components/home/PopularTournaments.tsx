'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Users, Calendar, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TournamentType {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'tournament_created' | 'tournament_completed';
  tournament_name: string;
  tournament_type: string;
  location: string;
  timestamp: string;
  participant_count?: number;
}

export function PopularTournaments() {
  const [popularTypes, setPopularTypes] = useState<TournamentType[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now, we'll use mock data since we don't have tournaments in the database yet
        // In the future, this would fetch real data from analytics endpoints
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        setPopularTypes([
          { type: 'TCG League Challenge', count: 0, trend: 'stable', percentage: 0 },
          { type: 'VGC Premier Challenge', count: 0, trend: 'stable', percentage: 0 },
          { type: 'GO Community Day', count: 0, trend: 'stable', percentage: 0 },
          { type: 'TCG Cup', count: 0, trend: 'stable', percentage: 0 }
        ]);

        setRecentActivity([]);
        
      } catch (error) {
        console.error('Error fetching popular tournaments data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'tournament_created':
        return <Trophy className="w-4 h-4 text-green-500" />;
      case 'tournament_completed':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'registration':
        return `Nuevo registro en ${activity.tournament_name}`;
      case 'tournament_created':
        return `Nuevo torneo: ${activity.tournament_name}`;
      case 'tournament_completed':
        return `Torneo completado: ${activity.tournament_name}`;
      default:
        return activity.tournament_name;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Types Loading */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-48 h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Loading */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-40 h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Popular Tournament Types */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900">Tipos Populares</h3>
        </div>

        {popularTypes.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay datos de popularidad aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Los datos aparecerán cuando haya más actividad
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {popularTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{type.type}</div>
                    <div className="text-sm text-gray-500">{type.count} torneos</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(type.trend)}
                  <span className={`text-sm font-medium ${
                    type.trend === 'up' ? 'text-green-600' : 
                    type.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {type.percentage > 0 ? `+${type.percentage}%` : type.percentage === 0 ? '0%' : `${type.percentage}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay actividad reciente</p>
            <p className="text-sm text-gray-400 mt-1">
              La actividad aparecerá cuando los usuarios interactúen con torneos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {getActivityText(activity)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{activity.location}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {activity.tournament_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}