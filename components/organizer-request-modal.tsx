"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Building2, 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle,
  Mail,
  FileText,
  Clock,
  Eye,
  XCircle
} from "lucide-react";
import { CreateOrganizerRequest, OrganizerRequest, OrganizerRequestStatus } from "@/lib/types/tournament";

interface OrganizerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email?: string;
  };
  onRequestSubmitted?: () => void;
}

export function OrganizerRequestModal({ 
  isOpen, 
  onClose, 
  user, 
  onRequestSubmitted 
}: OrganizerRequestModalProps) {
  const [existingRequest, setExistingRequest] = useState<OrganizerRequest | null>(null);
  const [formData, setFormData] = useState<CreateOrganizerRequest>({
    organization_name: "",
    business_email: "",
    phone_number: "",
    address: "",
    pokemon_league_url: "",
    experience_description: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  
  const supabase = createClient();

  // Verificar si ya existe una solicitud cuando se abre el modal
  useEffect(() => {
    if (isOpen && user.id) {
      const fetchExistingRequest = async () => {
        try {
          const response = await fetch('/api/organizer-requests', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            setExistingRequest(result.data);
            setShowForm(false); // No mostrar formulario si hay solicitud existente
          } else if (response.status === 404) {
            // No hay solicitud existente
            setExistingRequest(null);
            setShowForm(true);
          } else {
            // Otro error
            console.error("Error fetching existing request:", await response.text());
            setShowForm(true);
          }
        } catch (error) {
          console.error("Error fetching existing request:", error);
          setShowForm(true); // Mostrar formulario si hay error de red
        }
      };

      fetchExistingRequest();
    }
  }, [isOpen, user.id]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        organization_name: "",
        business_email: "",
        phone_number: "",
        address: "",
        pokemon_league_url: "",
        experience_description: "",
      });
      setMessage("");
      setErrors({});
      setExistingRequest(null);
      setShowForm(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = "El nombre de la liga/tienda es requerido";
    } else if (formData.organization_name.trim().length < 3) {
      newErrors.organization_name = "El nombre debe tener al menos 3 caracteres";
    }

    if (formData.business_email && formData.business_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.business_email.trim())) {
        newErrors.business_email = "El email no tiene un formato válido";
      }
    }

    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        newErrors.phone_number = "El teléfono no tiene un formato válido";
      }
    }

    if (formData.pokemon_league_url && formData.pokemon_league_url.trim()) {
      try {
        const url = new URL(formData.pokemon_league_url.trim());
        if (!url.protocol.startsWith('http')) {
          newErrors.pokemon_league_url = "La URL debe comenzar con http:// o https://";
        }
      } catch {
        newErrors.pokemon_league_url = "La URL no tiene un formato válido";
      }
    }

    if (!formData.experience_description?.trim()) {
      newErrors.experience_description = "La descripción de experiencia es requerida";
    } else if (formData.experience_description.trim().length < 50) {
      newErrors.experience_description = "La descripción debe tener al menos 50 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const requestData = {
        organization_name: formData.organization_name.trim(),
        business_email: formData.business_email?.trim() || undefined,
        phone_number: formData.phone_number?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        pokemon_league_url: formData.pokemon_league_url?.trim() || undefined,
        experience_description: formData.experience_description?.trim() || undefined,
      };

      const response = await fetch('/api/organizer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API error response
        if (result.code === 'DUPLICATE_ORGANIZER_REQUEST') {
          setMessage("Ya tienes una solicitud pendiente. Solo puedes tener una solicitud activa a la vez.");
        } else if (result.code === 'VALIDATION_ERROR') {
          setMessage(result.message || "Los datos proporcionados no son válidos");
          // Handle field-specific errors if available
          if (result.details?.issues) {
            const fieldErrors: Record<string, string> = {};
            result.details.issues.forEach((issue: any) => {
              if (issue.path?.length > 0) {
                fieldErrors[issue.path[0]] = issue.message;
              }
            });
            setErrors(fieldErrors);
          }
        } else {
          setMessage(result.message || "Error al enviar la solicitud. Inténtalo de nuevo.");
        }
        return;
      }

      setMessage("¡Solicitud enviada correctamente! Recibirás una respuesta en tu email.");
      setExistingRequest(result.data);
      setShowForm(false);
      
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }

      // Cerrar modal después de un delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting organizer request:', error);
      setMessage("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrganizerRequestStatus) => {
    switch (status) {
      case OrganizerRequestStatus.PENDING:
        return <Clock className="w-5 h-5 text-amber-500" />;
      case OrganizerRequestStatus.UNDER_REVIEW:
        return <Eye className="w-5 h-5 text-blue-500" />;
      case OrganizerRequestStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case OrganizerRequestStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: OrganizerRequestStatus) => {
    switch (status) {
      case OrganizerRequestStatus.PENDING:
        return "Pendiente de Revisión";
      case OrganizerRequestStatus.UNDER_REVIEW:
        return "En Revisión";
      case OrganizerRequestStatus.APPROVED:
        return "Aprobada";
      case OrganizerRequestStatus.REJECTED:
        return "Rechazada";
      default:
        return "Estado Desconocido";
    }
  };

  const handleNewRequest = async () => {
    if (existingRequest && existingRequest.status === OrganizerRequestStatus.REJECTED) {
      // Eliminar solicitud rechazada
      await supabase
        .from("organizer_requests")
        .delete()
        .eq("id", existingRequest.id);
      
      setExistingRequest(null);
      setShowForm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Solicitud de Organizador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {existingRequest && !showForm ? (
            // Mostrar estado de solicitud existente
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {getStatusIcon(existingRequest.status as OrganizerRequestStatus)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {getStatusText(existingRequest.status as OrganizerRequestStatus)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        Liga/Tienda:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {existingRequest.organization_name}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        Fecha de Solicitud:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(existingRequest.requested_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {existingRequest.admin_notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">
                        Notas del Administrador:
                      </span>
                      <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                        {existingRequest.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {existingRequest.status === OrganizerRequestStatus.REJECTED && (
                <div className="flex justify-center">
                  <Button onClick={handleNewRequest}>
                    Nueva Solicitud
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Mostrar formulario
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de la Liga/Tienda */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Información de la Liga/Tienda
                </h3>
                
                <div>
                  <Label htmlFor="organization_name">Nombre de la Liga/Tienda *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => {
                      setFormData({...formData, organization_name: e.target.value});
                      if (errors.organization_name) {
                        setErrors({...errors, organization_name: ""});
                      }
                    }}
                    placeholder="Nombre de tu liga o tienda"
                    className={errors.organization_name ? "border-red-500" : ""}
                    required
                  />
                  {errors.organization_name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.organization_name}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    El nombre oficial de tu liga o tienda donde organizas torneos
                  </p>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Información de Contacto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_email">Email de la Liga/Tienda</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => {
                        setFormData({...formData, business_email: e.target.value});
                        if (errors.business_email) {
                          setErrors({...errors, business_email: ""});
                        }
                      }}
                      placeholder="contacto@tuliga.com"
                      className={errors.business_email ? "border-red-500" : ""}
                    />
                    {errors.business_email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.business_email}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Email de contacto de tu liga o tienda
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone_number">Teléfono</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => {
                        setFormData({...formData, phone_number: e.target.value});
                        if (errors.phone_number) {
                          setErrors({...errors, phone_number: ""});
                        }
                      }}
                      placeholder="+34 123 456 789"
                      className={errors.phone_number ? "border-red-500" : ""}
                    />
                    {errors.phone_number && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pokemon_league_url">Enlace Oficial de la Liga/Tienda</Label>
                  <Input
                    id="pokemon_league_url"
                    type="url"
                    value={formData.pokemon_league_url}
                    onChange={(e) => {
                      setFormData({...formData, pokemon_league_url: e.target.value});
                      if (errors.pokemon_league_url) {
                        setErrors({...errors, pokemon_league_url: ""});
                      }
                    }}
                    placeholder="https://www.pokemon.com/es/play-pokemon/..."
                    className={errors.pokemon_league_url ? "border-red-500" : ""}
                  />
                  {errors.pokemon_league_url && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.pokemon_league_url}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Enlace oficial de tu liga o tienda en el sitio de Pokémon
                  </p>
                </div>

                <div>
                  <Label htmlFor="address">Dirección de la Liga/Tienda</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Dirección completa de tu liga o tienda"
                    rows={2}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Dirección física donde se realizarán los torneos
                  </p>
                </div>
              </div>

              {/* Experiencia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Experiencia en Organización de Torneos
                </h3>
                
                <div>
                  <Label htmlFor="experience_description">Describe tu Experiencia *</Label>
                  <Textarea
                    id="experience_description"
                    value={formData.experience_description}
                    onChange={(e) => {
                      setFormData({...formData, experience_description: e.target.value});
                      if (errors.experience_description) {
                        setErrors({...errors, experience_description: ""});
                      }
                    }}
                    placeholder="Describe tu experiencia organizando torneos, eventos, o actividades relacionadas..."
                    rows={4}
                    className={errors.experience_description ? "border-red-500" : ""}
                    required
                  />
                  {errors.experience_description && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.experience_description}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Mínimo 50 caracteres. Sé específico sobre tu experiencia previa.
                  </p>
                </div>
              </div>

              {/* Mensaje de estado */}
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                  message.includes("Error") || message.includes("corrige")
                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                    : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                }`}>
                  {message.includes("Error") || message.includes("corrige") ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {message}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}