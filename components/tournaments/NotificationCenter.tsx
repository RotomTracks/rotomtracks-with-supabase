'use client';

// React
import React, { useState } from 'react';

// Next.js
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Bell, 
  BellRing, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  X,
  CheckCheck,
  Loader2
} from 'lucide-react';

// Hooks
import { useRealTimeNotifications } from '@/lib/hooks/useRealTimeUpdates';

// Types
import { UserRole, LoadingState } from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  STATUS_TRANSLATIONS
} from '@/lib/utils/tournament-status';

interface NotificationCenterProps {
  className?: string;
  showAsDropdown?: boolean;
  userRole?: UserRole;
  loading?: boolean;
  error?: string | null;
}

export default function NotificationCenter({ 
  className = '',
  showAsDropdown = true,
  userRole = UserRole.PLAYER,
  loading: externalLoading = false,
  error: externalError = null
}: NotificationCenterProps) {
  // Hooks
  const { formatDateTime, formatRelativeTime } = useTournamentFormatting();
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead 
  } = useRealTimeNotifications({ enabled: false });

  // State
  const [isOpen, setIsOpen] = useState(false);
  
  // Use external loading/error states if provided
  const currentLoading = externalLoading || isLoading;
  const currentError = externalError || error;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'capacity_reached':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'near_capacity':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseClasses = read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900 border-l-4';
    
    switch (type) {
      case 'registration':
        return `${baseClasses} ${!read ? 'border-l-blue-500' : ''}`;
      case 'capacity_reached':
        return `${baseClasses} ${!read ? 'border-l-red-500' : ''}`;
      case 'near_capacity':
        return `${baseClasses} ${!read ? 'border-l-orange-500' : ''}`;
      case 'status_change':
        return `${baseClasses} ${!read ? 'border-l-green-500' : ''}`;
      default:
        return `${baseClasses} ${!read ? 'border-l-gray-500' : ''}`;
    }
  };

  // Use centralized formatting for timestamps
  const formatTimestamp = (timestamp: string) => {
    return formatRelativeTime ? formatRelativeTime(timestamp) : formatDateTime(timestamp);
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  if (showAsDropdown) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`relative ${className}`}>
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
                aria-label="Marcar todas como leídas"
              >
                Marcar como leídas
              </Button>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          {currentError && (
            <div className="p-2">
              <Alert variant="destructive" role="alert">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Error al cargar notificaciones
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {currentLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center p-4" role="status" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
              <span className="sr-only">Cargando notificaciones...</span>
            </div>
          )}
          
          {notifications.length === 0 && !currentLoading && !currentError && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Sin notificaciones
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${getNotificationColor(notification.type, notification.read)}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <Link 
                        href={`/tournaments/${notification.tournament_id}/manage`}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.tournament_name}
                      </Link>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          
          {notifications.length > 10 && (
            <DropdownMenuSeparator />
          )}
          
          <div className="p-2 text-center">
            <p className="text-xs text-muted-foreground">
              Se actualiza cada 10 segundos
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full card view (not dropdown)
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Actualizaciones y alertas de torneos
            </CardDescription>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} aria-label="Marcar todas como leídas">
              Marcar como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {currentError && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar notificaciones: {currentError instanceof Error ? currentError.message : currentError}
            </AlertDescription>
          </Alert>
        )}

        {notifications.length === 0 && !currentLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sin notificaciones</p>
            <p className="text-sm">Recibirás actualizaciones sobre tus torneos aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${getNotificationColor(notification.type, notification.read)}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Link 
                        href={`/tournaments/${notification.tournament_id}/manage`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {notification.tournament_name}
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentLoading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando notificaciones...</span>
            <span className="sr-only">Cargando notificaciones...</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t dark:border-gray-700">
          <p className="text-xs text-muted-foreground text-center">
            Se actualiza cada 10 segundos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}