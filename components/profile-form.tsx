"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { User, Camera, Save, ArrowLeft, Building2, Trophy, AlertCircle, CheckCircle } from "lucide-react";
import { validatePlayerId, ValidationMessages } from "@/lib/utils/validation";
import { UserRole } from "@/lib/types/tournament";

import { OrganizerRequestModal } from "./organizer-request-modal";
import Link from "next/link";

interface ProfileFormProps {
  user: {
    id: string;
    email?: string;
  };
  initialProfile?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    player_id?: string;
    birth_year?: number;
    profile_image_url?: string;
    user_role?: string;
    organization_name?: string;
    pokemon_league_url?: string;
  } | null;
  onProfileUpdate?: (profile: any) => void;
  showBackButton?: boolean;
  redirectAfterSave?: string;
}

export function ProfileForm({ 
  user, 
  initialProfile, 
  onProfileUpdate,
  showBackButton = true,
  redirectAfterSave = "/"
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    player_id: initialProfile?.player_id || "",
    birth_year: initialProfile?.birth_year || "",
    user_role: initialProfile?.user_role || UserRole.PLAYER,
    organization_name: initialProfile?.organization_name || "",
    pokemon_league_url: initialProfile?.pokemon_league_url || "",
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialProfile?.profile_image_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Preview de la imagen seleccionada
  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [profileImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading image:', file.name, 'Size:', file.size);
      
      // Validar el archivo
      if (file.size > 1 * 1024 * 1024) { // 1MB
        throw new Error('El archivo es demasiado grande. Máximo 1MB.');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF.');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      
      // Eliminar imagen anterior si existe
      if (previewUrl && previewUrl.includes('supabase')) {
        try {
          const oldPath = previewUrl.split('/').pop();
          if (oldPath) {
            const oldFileName = `${user.id}/${oldPath}`;
            await supabase.storage
              .from('profile-images')
              .remove([oldFileName]);
          }
        } catch (deleteError) {
          console.log('Could not delete old image:', deleteError);
        }
      }
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Image uploaded successfully:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setMessage(error.message || 'Error al subir la imagen. Inténtalo de nuevo.');
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = "El nombre es requerido";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar apellidos
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Los apellidos son requeridos";
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Los apellidos deben tener al menos 2 caracteres";
    }

    // Validar Player ID
    if (!formData.player_id) {
      newErrors.player_id = ValidationMessages.PLAYER_ID_REQUIRED;
    } else if (!validatePlayerId(formData.player_id)) {
      newErrors.player_id = ValidationMessages.PLAYER_ID_INVALID;
    }

    // Validar año de nacimiento
    if (!formData.birth_year) {
      newErrors.birth_year = "El año de nacimiento es requerido";
    } else {
      const year = parseInt(formData.birth_year.toString(), 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.birth_year = `El año debe estar entre 1900 y ${currentYear}`;
      }
    }

    // Validar campos específicos de organizador
    if (formData.user_role === UserRole.ORGANIZER) {
      if (!formData.organization_name.trim()) {
        newErrors.organization_name = "El nombre de la liga/tienda es requerido para organizadores";
      } else if (formData.organization_name.trim().length < 3) {
        newErrors.organization_name = "El nombre de la liga/tienda debe tener al menos 3 caracteres";
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
      let imageUrl = previewUrl;

      // Subir nueva imagen si se seleccionó una
      if (profileImage) {
        const uploadedUrl = await uploadImage(profileImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Datos básicos del perfil
      const profileData: any = {
        user_id: user.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        player_id: formData.player_id,
        birth_year: formData.birth_year ? parseInt(formData.birth_year.toString()) : null,
        user_role: formData.user_role,
        organization_name: formData.user_role === UserRole.ORGANIZER ? formData.organization_name.trim() : null,
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      // Solo agregar pokemon_league_url si es organizador y tiene valor
      if (formData.user_role === UserRole.ORGANIZER && formData.pokemon_league_url) {
        profileData.pokemon_league_url = formData.pokemon_league_url.trim();
      }

      let savedProfile;

      if (initialProfile?.id) {
        // Actualizar perfil existente
        const { data, error } = await supabase
          .from("user_profiles")
          .update(profileData)
          .eq("id", initialProfile.id)
          .select()
          .single();

        if (error) throw error;
        savedProfile = data;
      } else {
        // Crear nuevo perfil
        const { data, error } = await supabase
          .from("user_profiles")
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;
        savedProfile = data;
      }

      setMessage("¡Perfil actualizado correctamente!");
      
      // Llamar callback si se proporciona
      if (onProfileUpdate) {
        onProfileUpdate(savedProfile);
      }

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push(redirectAfterSave);
      }, 2000);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      // Manejar errores específicos
      if (error?.code === '23505') {
        if (error.message?.includes('player_id')) {
          setErrors({ player_id: "Este Player ID ya está en uso por otro usuario" });
        } else {
          setMessage("Ya existe un perfil con esta información");
        }
      } else if (error?.message) {
        setMessage(`Error al guardar el perfil: ${error.message}`);
      } else {
        setMessage("Error al guardar el perfil. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      {showBackButton && (
        <div className="flex items-center gap-4 mb-6">
          <Link href={redirectAfterSave}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de imagen de perfil */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Imagen de perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading profile image:', previewUrl);
                      console.error('Image error event:', e);
                      // Mostrar el icono de usuario si la imagen falla
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully:', previewUrl);
                    }}
                  />
                ) : null}
                {!previewUrl && (
                  <User className="w-12 h-12 text-gray-400" />
                )}
                {/* Fallback icon que se muestra si la imagen falla */}
                <User className="w-12 h-12 text-gray-400 hidden" />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Imagen de Perfil
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Haz clic en el icono de cámara para cambiar tu imagen
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos: JPEG, PNG, WebP, GIF • Máximo: 1MB
              </p>

            </div>
          </div>
        </Card>

        {/* Información personal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => {
                  setFormData({...formData, first_name: e.target.value});
                  if (errors.first_name) {
                    setErrors({...errors, first_name: ""});
                  }
                }}
                placeholder="Tu nombre"
                className={errors.first_name ? "border-red-500" : ""}
                required
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.first_name}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="last_name">Apellidos</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => {
                  setFormData({...formData, last_name: e.target.value});
                  if (errors.last_name) {
                    setErrors({...errors, last_name: ""});
                  }
                }}
                placeholder="Tus apellidos"
                className={errors.last_name ? "border-red-500" : ""}
                required
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.last_name}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="player_id">Player ID</Label>
              <Input
                id="player_id"
                value={formData.player_id}
                onChange={(e) => {
                  setFormData({...formData, player_id: e.target.value});
                  if (errors.player_id) {
                    setErrors({...errors, player_id: ""});
                  }
                }}
                placeholder="1234567 (1-7 dígitos)"
                className={errors.player_id ? "border-red-500" : ""}
                required
              />
              {errors.player_id && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.player_id}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Tu Player ID oficial (1-7 dígitos, rango 1-9999999)
              </p>
            </div>
            
            <div>
              <Label htmlFor="birth_year">Año de Nacimiento</Label>
              <Input
                id="birth_year"
                type="number"
                value={formData.birth_year}
                onChange={(e) => {
                  setFormData({...formData, birth_year: e.target.value});
                  if (errors.birth_year) {
                    setErrors({...errors, birth_year: ""});
                  }
                }}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
                className={errors.birth_year ? "border-red-500" : ""}
                required
              />
              {errors.birth_year && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birth_year}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Role Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de Cuenta
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo de Cuenta Actual</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {formData.user_role === UserRole.ORGANIZER ? (
                  <>
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">Organizador</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Puedes crear y gestionar torneos
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">Jugador</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Puedes participar en torneos
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {formData.user_role === UserRole.PLAYER && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  <Building2 className="w-4 h-4" />
                  ¿Quieres ser Organizador?
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Si quieres organizar torneos, puedes solicitar convertirte en organizador. 
                  Tu solicitud será revisada por nuestro equipo.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  onClick={() => setIsOrganizerModalOpen(true)}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Solicitar ser Organizador
                </Button>
              </div>
            )}

            {formData.user_role === UserRole.ORGANIZER && (
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Cuenta de Organizador Aprobada
                </div>
                
                <div>
                  <Label htmlFor="organization_name">Nombre de la Liga/Tienda</Label>
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
                    required={formData.user_role === UserRole.ORGANIZER}
                  />
                  {errors.organization_name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.organization_name}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    El nombre oficial de tu liga o tienda
                  </p>
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
                    Enlace oficial de tu liga o tienda en el sitio de Pokémon (opcional)
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

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
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Link href={redirectAfterSave}>
            <Button variant="outline" type="button" className="w-full sm:w-auto">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Guardando..." : initialProfile?.id ? "Actualizar Perfil" : "Crear Perfil"}
          </Button>
        </div>
      </form>

      {/* Modal de Solicitud de Organizador */}
      <OrganizerRequestModal
        isOpen={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
        user={user}
        onRequestSubmitted={() => {
          // Recargar la página para mostrar el estado actualizado
          window.location.reload();
        }}
      />
    </div>
  );
}
