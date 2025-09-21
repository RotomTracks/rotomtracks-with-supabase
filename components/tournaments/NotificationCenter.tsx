'use client';

import React, { useState } from 'react';
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
import { useRealTimeNotifications } from '@/lib/hooks/useRealTimeUpdates';
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
import Link from 'next/link';

interface NotificationCenterProps {
  className?: string;
  showAsDropdown?: boolean;
}

export default function NotificationCenter({ 
  className = '',
  showAsDropdown = true 
}: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead 
  } = useRealTimeNotifications({ enabled: true });

  const [isOpen, setIsOpen] = useState(false);

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
    const baseClasses = read ? 'bg-gray-50' : 'bg-white border-l-4';
    
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
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
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          {error && (
            <div className="p-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Failed to load notifications
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
          
          {notifications.length === 0 && !isLoading && !error && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
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
              Updates every 10 seconds
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
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Tournament updates and alerts
            </CardDescription>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load notifications: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {notifications.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
            <p className="text-sm">You'll receive updates about your tournaments here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${getNotificationColor(notification.type, notification.read)}`}
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

        {isLoading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading notifications...</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Updates every 10 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}