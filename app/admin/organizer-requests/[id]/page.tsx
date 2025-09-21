"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminOrganizerRequest, OrganizerRequestStatus } from '@/lib/types/tournament';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Save,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrganizerRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<AdminOrganizerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    action: 'approve' | 'reject' | null;
    show: boolean;
  }>({ action: null, show: false });

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/organizer-requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar la solicitud');
      }

      const result = await response.json();
      setRequest(result.data);
      setAdminNotes(result.data.admin_notes || '');
    } catch (err) {
      console.error('Error fetching request:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (status: OrganizerRequestStatus, notes?: string) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/admin/organizer-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: notes || adminNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la solicitud');
      }

      const result = await response.json();
      setRequest(result.data);
      setAdminNotes(result.data.admin_notes || '');
      
      toast({
        title: "Solicitud actualizada",
        description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente.`,
      });

      setShowConfirmDialog({ action: null, show: false });
    } catch (err) {
      console.error('Error updating request:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al actualizar la solicitud',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const saveAdminNotes = async () => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/admin/organizer-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_notes: adminNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar las notas');
      }

      const result = await response.json();
      setRequest(result.data);
      
      toast({
        title: "Notas guardadas",
        description: "Las notas del administrador han sido guardadas exitosamente.",
      });
    } catch (err) {
      console.error('Error saving notes:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al guardar las notas',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout title="Detalle de Solicitud" description="Revisar solicitud de organizador">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando solicitud...</p>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (error || !request) {
    return (
      <AdminRoute>
        <AdminLayout title="Error" description="Error al cargar la solicitud">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error al cargar la solicitud
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'No se pudo encontrar la solicitud'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button onClick={fetchRequest}>
                Reintentar
              </Button>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout title="Detalle de Solicitud" description="Revisar solicitud de organizador">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista
            </Button>
            {getStatusBadge(request.status)}
          </div>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Información de la Organización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {request.organization_name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {request.business_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${request.business_email}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {request.business_email}
                        </a>
                      </div>
                    )}
                    {request.pokemon_league_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <a 
                          href={request.pokemon_league_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Liga Pokémon
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Fechas Importantes
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Solicitado: {formatDate(request.created_at)}
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
                </div>
              </div>

              {request.experience_description && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Experiencia
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {request.experience_description}
                  </p>
                </div>
              )}
              
              {request.address && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Dirección
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {request.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {`${request.user_profile?.first_name || ''} ${request.user_profile?.last_name || ''}`.trim() || 'Nombre no disponible'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID de usuario: {request.user_id}
                    </p>
                  </div>
                  
                  {request.user_profile?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${request.user_profile.email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {request.user_profile.email}
                      </a>
                    </div>
                  )}
                  
                  {request.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {request.phone_number}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {request.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {request.address}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Miembro desde: {request.user_profile?.created_at ? formatDate(request.user_profile.created_at) : 'Fecha no disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notas del Administrador
              </CardTitle>
              <CardDescription>
                Agregar notas internas sobre esta solicitud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Agregar notas sobre la revisión de esta solicitud..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {adminNotes.length}/500 caracteres
                </p>
                <Button
                  onClick={saveAdminNotes}
                  disabled={updating || adminNotes === (request.admin_notes || '')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Notas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {request.status === OrganizerRequestStatus.PENDING || request.status === OrganizerRequestStatus.UNDER_REVIEW ? (
            <Card>
              <CardHeader>
                <CardTitle>Acciones de Revisión</CardTitle>
                <CardDescription>
                  Aprobar o rechazar esta solicitud de organizador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowConfirmDialog({ action: 'approve', show: true })}
                    disabled={updating}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar Solicitud
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDialog({ action: 'reject', show: true })}
                    disabled={updating}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar Solicitud
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Esta solicitud ya ha sido {request.status === OrganizerRequestStatus.APPROVED ? 'aprobada' : 'rechazada'}.
                  </p>
                  {request.reviewed_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Revisado el {formatDate(request.reviewed_at)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {showConfirmDialog.action === 'approve' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Confirmar Aprobación
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        Confirmar Rechazo
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    ¿Estás seguro de que quieres {showConfirmDialog.action === 'approve' ? 'aprobar' : 'rechazar'} 
                    la solicitud de <strong>{request.organization_name}</strong>?
                  </p>
                  {showConfirmDialog.action === 'approve' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Al aprobar esta solicitud, el usuario obtendrá permisos de organizador y podrá crear torneos.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog({ action: null, show: false })}
                      disabled={updating}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => updateRequestStatus(showConfirmDialog.action === 'approve' ? OrganizerRequestStatus.APPROVED : OrganizerRequestStatus.REJECTED)}
                      disabled={updating}
                      className={cn(
                        "flex items-center gap-2",
                        showConfirmDialog.action === 'approve' 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : showConfirmDialog.action === 'approve' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {showConfirmDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}