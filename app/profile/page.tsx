"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfileForm } from "@/components/profile-form";
import { ProfileDisplay } from "@/components/profile-display";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Eye } from "lucide-react";
import { HomePageNavigation } from "@/components/navigation/PageNavigation";
import { getNavigationConfig } from "@/lib/navigation/config";
import { useTypedTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { tCommon } = useTypedTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const getProfile = async () => {
      try {
        const supabase = createClient();
        
        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
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
      } catch (error) {
        console.error("Error loading profile:", error);
        setLoading(false);
      }
    };

    getProfile();
  }, [user, authLoading, router]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (authLoading || loading) {
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

  const navConfig = getNavigationConfig('profile');
  
  // Welcome message for new users (no profile yet)
  const welcomeMessage = !profile 
    ? "¡Bienvenido! Completa tu perfil para acceder a todas las funciones de RotomTracks."
    : undefined;

  const profileActions = profile ? (
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
  ) : undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <HomePageNavigation
        title={navConfig.title}
        description={welcomeMessage || navConfig.description}
        currentPageLabel={tCommon('pages.profile.title')}
        currentPageHref="/profile"
        actions={profileActions}
      />

      {isEditing ? (
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile ? tCommon('pages.profile.updateProfile') : tCommon('pages.profile.completeProfile')}
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
        profile ? (
          <ProfileDisplay
            profile={profile}
            userEmail={user.email}
            onEdit={() => setIsEditing(true)}
            showEditButton={false}
          />
        ) : (
          <div className="text-center py-8">
            <p>No se encontró perfil. Creando uno nuevo...</p>
          </div>
        )
      )}
    </div>
  );
}