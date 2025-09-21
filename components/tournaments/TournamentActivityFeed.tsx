'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTournamentActivity } from '@/lib/hooks/useRealTimeUpdates';
import { 
  Activity, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TournamentActivityFeedProps {
  tournamentId: string;
  className?: string;
  maxItems?: number;
  showRefreshButton?: boolean;
}

export default function TournamentActivityFeed({
  tournamentId,
  className = '',
  maxItems = 10,
  showRefreshButton = true
}: TournamentActivityFeedProps) {
  const { activities, isLoading, error, refresh } = useTournamentActivity(tournamentId, true);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'status_change':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'withdrawal':
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration':
        return 'border-l-green-500 bg-green-50';
      case 'status_change':
        return 'border-l-blue-500 bg-blue-50';
      case 'withdrawal':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>
              Recent tournament activity and registrations
            </CardDescription>
          </div>
          
          {showRefreshButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load activity feed: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {displayedActivities.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as players register and interact with the tournament</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActivities.map((activity) => (
              <div 
                key={activity.id}
                className={`p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      
                      {activity.details?.status && (
                        <Badge variant="outline" className="text-xs">
                          {activity.details.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > maxItems && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing {maxItems} of {activities.length} activities
                </p>
              </div>
            )}
          </div>
        )}

        {isLoading && displayedActivities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading activity...</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Updates every 15 seconds • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}