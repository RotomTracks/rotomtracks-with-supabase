"use client";

import { useEffect, useState, Suspense } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminOrganizerRequest, OrganizerRequestStatus } from '@/lib/types/tournament';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface RequestsListResponse {
  data: AdminOrganizerRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function AdminOrganizerRequestsContent() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<AdminOrganizerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/organizer-requests?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar solicitudes');
      }

      const result: RequestsListResponse = await response.json();
      setRequests(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, searchTerm]);

  const getStatusBadge = (status: OrganizerRequestStatus) => {
    switch (status) {
      case OrganizerRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:bg-yellow-900/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case OrganizerRequestStatus.APPROVED:
        return (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-600 dark:bg-green-900/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case OrganizerRequestStatus.REJECTED:
        return (
          <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-600 dark:bg-red-900/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case OrganizerRequestStatus.UNDER_REVIEW:
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:bg-blue-900/20">
            <Eye className="w-3 h-3 mr-1" />
            En Revisión
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && requests.length === 0) {
    return (
      <AdminRoute>
        <AdminLayout title="Solicitudes de Organizador" description="Gestionar solicitudes de organizador">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout title="Solicitudes de Organizador" description="Gestionar solicitudes de organizador">
        <div className="p-6 space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros y Búsqueda
              </CardTitle>
              <CardDescription>
                Buscar y filtrar solicitudes de organizador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre de organización o solicitante..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="under_review">En Revisión</SelectItem>
                      <SelectItem value="approved">Aprobadas</SelectItem>
                      <SelectItem value="rejected">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchRequests}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                Mostrando {requests.length} de {pagination.total} solicitudes
                {statusFilter !== 'all' && ` (filtrado por: ${statusFilter})`}
                {searchTerm && ` (búsqueda: "${searchTerm}")`}
              </span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100">
                      Error al cargar solicitudes
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRequests}
                    className="ml-auto"
                  >
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requests List */}
          {requests.length === 0 && !loading && !error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron solicitudes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay solicitudes de organizador en el sistema'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.organization_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Solicitado por: {`${request.user_profile?.first_name || ''} ${request.user_profile?.last_name || ''}`.trim() || 'Usuario desconocido'}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Organización
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                          {request.reviewed_at && (
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Revisado: {formatDate(request.reviewed_at)}
                              </span>
                            </div>
                          )}
                        </div>

                        {request.experience_description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {request.experience_description}
                          </p>
                        )}

                        {request.admin_notes && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Notas del administrador:</strong> {request.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <Link href={`/admin/organizer-requests/${request.id}`}>
                          <Button size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(
                          pagination.totalPages - 4,
                          currentPage - 2
                        )) + i;
                        
                        if (pageNum > pagination.totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages || loading}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

export default function AdminOrganizerRequestsPage() {
  return (
    <Suspense fallback={
      <AdminRoute>
        <AdminLayout title="Solicitudes de Organizador" description="Gestionar solicitudes de organizador">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </AdminLayout>
      </AdminRoute>
    }>
      <AdminOrganizerRequestsContent />
    </Suspense>
  );
}