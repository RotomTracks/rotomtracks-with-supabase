"use client";

// React
import React from "react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import {
  Activity,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Hooks
import { useTournamentActivity } from "@/lib/hooks/useRealTimeUpdates";

// Types
import { UserRole } from "@/lib/types/tournament";

// Utilities
import { useTournamentFormatting } from "@/lib/utils/tournament-formatting";

interface TournamentActivityFeedProps {
  tournamentId: string;
  className?: string;
  maxItems?: number;
  showRefreshButton?: boolean;
  userRole?: UserRole;
  loading?: boolean;
  error?: string | null;
}

export default function TournamentActivityFeed({
  tournamentId,
  className = "",
  maxItems = 10,
  showRefreshButton = true,
  loading: externalLoading = false,
  error: externalError = null,
}: TournamentActivityFeedProps) {
  // Hooks
  const { formatDateTime, formatRelativeTime } = useTournamentFormatting();

  const { activities, isLoading, error, refresh } = useTournamentActivity(
    tournamentId,
    true
  );

  // Use external loading/error states if provided
  const currentLoading = externalLoading || isLoading;
  const currentError = externalError || error;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "status_change":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "withdrawal":
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "registration":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20";
      case "status_change":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "withdrawal":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-800";
    }
  };

  // Use centralized formatting for timestamps
  const formatTimestamp = (timestamp: string) => {
    return formatRelativeTime
      ? formatRelativeTime(timestamp)
      : formatDateTime(timestamp);
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Feed de Actividad
            </CardTitle>
            <CardDescription>
              Actividad reciente del torneo y registros
            </CardDescription>
          </div>

          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={currentLoading}
              aria-label="Actualizar feed de actividad"
            >
              {currentLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {currentError && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar el feed de actividad: {currentError instanceof Error ? currentError.message : currentError}
            </AlertDescription>
          </Alert>
        )}

        {displayedActivities.length === 0 && !currentLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sin actividad reciente</p>
            <p className="text-sm">
              La actividad aparecerá aquí cuando los jugadores se registren e
              interactúen con el torneo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border-l-4 ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                  Mostrando {maxItems} de {activities.length} actividades
                </p>
              </div>
            )}
          </div>
        )}

        {currentLoading && displayedActivities.length === 0 && (
          <div
            className="flex items-center justify-center py-8"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Cargando actividad...
            </span>
            <span className="sr-only">Cargando actividad del torneo...</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t dark:border-gray-700">
          <p className="text-xs text-muted-foreground text-center">
            Se actualiza cada 15 segundos • Última actualización:{" "}
            {formatDateTime(new Date().toISOString())}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
