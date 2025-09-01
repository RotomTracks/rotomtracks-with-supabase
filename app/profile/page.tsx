"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { ProfileDisplay } from "@/components/profile-display";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft, Edit, Eye } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(profile);
      
      // Si no hay perfil, activar modo edición automáticamente
      if (!profile) {
        setIsEditing(true);
      }
      
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mi Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {profile 
                ? "Gestiona tu información personal y configuración de cuenta"
                : "Completa tu perfil para acceder a todas las funciones"
              }
            </p>
          </div>
        </div>

        {profile && (
          <div className="flex gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile ? "Actualizar Perfil" : "Completar Perfil"}
            </h2>
          </div>
          
          <ProfileForm 
            user={user} 
            initialProfile={profile}
            onProfileUpdate={handleProfileUpdate}
            showBackButton={false}
            redirectAfterSave=""
          />
        </Card>
      ) : (
        profile && (
          <ProfileDisplay
            profile={profile}
            userEmail={user.email}
            onEdit={() => setIsEditing(true)}
            showEditButton={false}
          />
        )
      )}
    </div>
  );
}