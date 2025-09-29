'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Users, Calendar, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTypedTranslation } from '@/lib/i18n';

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
  const { tPages } = useTypedTranslation();
  const [popularTypes, setPopularTypes] = useState<TournamentType[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch popular tournaments data
        const response = await fetch('/api/tournaments/popular');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API data to match component format
          const transformedTypes = data.data.popular_types?.map((type: any) => ({
            type: type.tournament_type,
            count: type.count,
            trend: type.trend || 'stable',
            percentage: type.percentage || 0
          })) || [];

          const transformedActivity = data.data.recent_activity?.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            tournament_name: activity.tournament_name,
            tournament_type: activity.tournament_type,
            location: activity.location,
            timestamp: activity.timestamp,
            participant_count: activity.participant_count
          })) || [];

          setPopularTypes(transformedTypes);
          setRecentActivity(transformedActivity);
        } else {
          // Set empty data if no results
          setPopularTypes([]);
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Error fetching popular tournaments data:', error);
        // Set empty data on error
        setPopularTypes([]);
        setRecentActivity([]);
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
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-600">
          <div className="w-48 h-6 bg-gray-200 dark:bg-gray-600 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Loading */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-600">
          <div className="w-40 h-6 bg-gray-200 dark:bg-gray-600 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
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
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tPages('home.popular.types.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tPages('home.popular.types.subtitle')}</p>
          </div>
        </div>

        {popularTypes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tPages('home.popular.types.empty.title')}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {tPages('home.popular.types.empty.description')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {tPages('home.popular.types.empty.hint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {popularTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-base">{type.type}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {type.count} {type.count === 1 ? tPages('home.popular.types.tournament') : tPages('home.popular.types.tournaments')} {tPages('home.popular.types.active')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(type.trend)}
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      type.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                      type.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {type.percentage > 0 ? `+${type.percentage}%` : type.percentage === 0 ? '0%' : `${type.percentage}%`}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {type.trend === 'up' ? tPages('home.popular.types.trend.up') : type.trend === 'down' ? tPages('home.popular.types.trend.down') : tPages('home.popular.types.trend.stable')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tPages('home.popular.activity.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tPages('home.popular.activity.subtitle')}</p>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-green-100 dark:bg-green-800/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200 dark:border-green-700">
              <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tPages('home.popular.activity.empty.title')}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {tPages('home.popular.activity.empty.description')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {tPages('home.popular.activity.empty.hint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {getActivityText(activity)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {activity.tournament_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
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