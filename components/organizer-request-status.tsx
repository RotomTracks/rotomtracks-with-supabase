"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { OrganizerRequestModal } from "./organizer-request-modal";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle,
  Building2,
  ExternalLink
} from "lucide-react";
import { OrganizerRequest, OrganizerRequestStatus as RequestStatus } from "@/lib/types/tournament";
import { useTypedTranslation } from '@/lib/i18n';

interface OrganizerRequestStatusProps {
  userId: string;
  userEmail?: string;
  showTitle?: boolean;
}

export function OrganizerRequestStatus({ userId, userEmail, showTitle = false }: OrganizerRequestStatusProps) {
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();
  const [request, setRequest] = useState<OrganizerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch('/api/organizer-requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setRequest(result.data);
        } else if (response.status === 404) {
          // No request found
          setRequest(null);
        } else {
          console.error("Error fetching organizer request:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching organizer request:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [userId]);

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return <Clock className="w-4 h-4 text-amber-500" />;
      case RequestStatus.UNDER_REVIEW:
        return <Eye className="w-4 h-4 text-blue-500" />;
      case RequestStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case RequestStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return tUI('status.pending');
      case RequestStatus.UNDER_REVIEW:
        return tUI('status.processing');
      case RequestStatus.APPROVED:
        return tUI('status.completed');
      case RequestStatus.REJECTED:
        return tUI('status.cancelled');
      default:
        return tUI('status.unknown');
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800";
      case RequestStatus.UNDER_REVIEW:
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
      case RequestStatus.APPROVED:
        return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case RequestStatus.REJECTED:
        return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  const getStatusTextColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "text-amber-800 dark:text-amber-200";
      case RequestStatus.UNDER_REVIEW:
        return "text-blue-800 dark:text-blue-200";
      case RequestStatus.APPROVED:
        return "text-green-800 dark:text-green-200";
      case RequestStatus.REJECTED:
        return "text-red-800 dark:text-red-200";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!request) {
    return (
      <>
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  ¿Quieres ser Organizador?
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Solicita convertirte en organizador de torneos
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <Building2 className="w-3 h-3 mr-1" />
              Solicitar
            </Button>
          </div>
        </Card>

        {/* Modal de Solicitud de Organizador */}
        <OrganizerRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={{ id: userId, email: userEmail }}
          onRequestSubmitted={() => {
            // Recargar datos de la solicitud
            window.location.reload();
          }}
        />
      </>
    );
  }

  return (
    <div>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          {tCommon('organizerRequest.title')}
        </h3>
      )}
      
      <Card className={`p-4 ${getStatusColor(request.status as RequestStatus)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon(request.status as RequestStatus)}
            <div>
              <h4 className={`font-medium ${getStatusTextColor(request.status as RequestStatus)}`}>
                {getStatusText(request.status as RequestStatus)}
              </h4>
              <p className={`text-sm ${getStatusTextColor(request.status as RequestStatus)} opacity-80 mt-1`}>
                {request.status === RequestStatus.PENDING && 
                  tCommon('organizerRequest.status.pending')
                }
                {request.status === RequestStatus.UNDER_REVIEW && 
                  tCommon('organizerRequest.status.underReview')
                }
                {request.status === RequestStatus.APPROVED && 
                  tCommon('organizerRequest.status.approved')
                }
                {request.status === RequestStatus.REJECTED && 
                  tCommon('organizerRequest.status.rejected')
                }
              </p>
              <p className={`text-xs ${getStatusTextColor(request.status as RequestStatus)} opacity-60 mt-1`}>
                {tCommon('organizerRequest.requestedOn')} {new Date(request.requested_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {tCommon('organizerRequest.viewDetails')}
          </Button>
        </div>

        {/* Modal de Solicitud de Organizador */}
        <OrganizerRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={{ id: userId, email: userEmail }}
          onRequestSubmitted={() => {
            // Recargar datos de la solicitud
            window.location.reload();
          }}
        />
      </Card>
    </div>
  );
}