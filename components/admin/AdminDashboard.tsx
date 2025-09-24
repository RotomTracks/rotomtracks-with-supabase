"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp,
  Activity,
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { AdminDashboardMetrics, AdminActivity, AdminActionType, OrganizerRequestStatus } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';
import Link from 'next/link';

interface AdminDashboardResponse {
  data: AdminDashboardMetrics;
  message: string;
  timestamp: string;
  request_id: string;
}

export function AdminDashboard() {
  const { tUI, tAdmin } = useTypedTranslation();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
            let errorMessage = tAdmin('dashboard.error.loading');
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        // If it's a 404, it might mean the tables don't exist yet
        if (response.status === 404) {
          console.log('Dashboard endpoint returned 404, showing empty state');
          setMetrics({
            totalRequests: 0,
            pendingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0,
            underReviewRequests: 0,
            recentActivity: []
          });
          setLastUpdated(new Date());
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result: AdminDashboardResponse = await response.json();
      
      if (result.data) {
        setMetrics(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(tAdmin('dashboard.error.invalidData'));
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : tUI('status.unknown');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: OrganizerRequestStatus) => {
    switch (status) {
      case OrganizerRequestStatus.PENDING:
        return <Clock className="w-4 h-4 text-amber-500" />;
      case OrganizerRequestStatus.UNDER_REVIEW:
        return <Eye className="w-4 h-4 text-blue-500" />;
      case OrganizerRequestStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case OrganizerRequestStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: AdminActionType) => {
    switch (action) {
      case AdminActionType.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case AdminActionType.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case AdminActionType.UNDER_REVIEW:
        return <Eye className="w-4 h-4 text-blue-500" />;
      case AdminActionType.NOTES_ADDED:
        return <FileText className="w-4 h-4 text-gray-500" />;
      case AdminActionType.STATUS_CHANGED:
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (action: AdminActionType) => {
    switch (action) {
      case AdminActionType.APPROVED:
        return 'Aprobó solicitud';
      case AdminActionType.REJECTED:
        return 'Rechazó solicitud';
      case AdminActionType.UNDER_REVIEW:
        return 'Marcó en revisión';
      case AdminActionType.NOTES_ADDED:
        return 'Agregó notas';
      case AdminActionType.STATUS_CHANGED:
        return 'Cambió estado';
      default:
        return 'Realizó acción';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {tAdmin('dashboard.error.title')}
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {tUI('buttons.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {tAdmin('dashboard.noData')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tAdmin('dashboard.title')}
          </h3>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tAdmin('dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {tUI('buttons.refresh')}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin('dashboard.metrics.totalRequests')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {tAdmin('dashboard.metrics.totalRequestsDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin('dashboard.metrics.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {tAdmin('dashboard.metrics.pendingDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin('dashboard.metrics.approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.approvedRequests}</div>
            <p className="text-xs text-muted-foreground">
              {tAdmin('dashboard.metrics.approvedDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin('dashboard.metrics.underReview')}</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.underReviewRequests}</div>
            <p className="text-xs text-muted-foreground">
              {tAdmin('dashboard.metrics.underReviewDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {tAdmin('dashboard.recentActivity.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('dashboard.recentActivity.description')}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/organizer-requests">
                {tAdmin('dashboard.recentActivity.viewAll')}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {tAdmin('dashboard.recentActivity.empty')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.admin_name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getActionText(activity.action)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {activity.organization_name}
                      </span>
                      {activity.new_status && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.new_status}
                        </Badge>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        "{activity.notes}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/organizer-requests/${activity.request_id}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4 flex-col gap-2">
              <Link href="/admin/organizer-requests?status=pending">
                <Clock className="w-6 h-6" />
                <span className="font-medium">Revisar Pendientes</span>
                <span className="text-xs opacity-80">
                  {metrics.pendingRequests} solicitudes
                </span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/admin/organizer-requests?status=under_review">
                <Eye className="w-6 h-6" />
                <span className="font-medium">En Revisión</span>
                <span className="text-xs opacity-80">
                  {metrics.underReviewRequests} solicitudes
                </span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/admin/organizer-requests">
                <Users className="w-6 h-6" />
                <span className="font-medium">Todas las Solicitudes</span>
                <span className="text-xs opacity-80">
                  Ver y gestionar
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}