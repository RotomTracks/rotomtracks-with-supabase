"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertCircle, X, User } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types/tournament";

interface ProfileCompletionAlertProps {
  user: {
    id: string;
    email?: string;
  };
}

export function ProfileCompletionAlert({ user }: ProfileCompletionAlertProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        setProfile(data);
      } catch (error) {
        // Error silencioso - el perfil puede no existir aún
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id, supabase]);

  // Verificar si el perfil está completo
  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = ['first_name', 'last_name', 'player_id', 'birth_year'];
    const organizerFields = profile.user_role === UserRole.ORGANIZER ? ['organization_name'] : [];
    const allRequiredFields = [...requiredFields, ...organizerFields];
    
    return allRequiredFields.every(field => {
      const value = profile[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  // No mostrar si está cargando, si el perfil está completo, o si fue descartado
  if (loading || isProfileComplete() || dismissed) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {!profile ? "Perfil Incompleto" : "Completa tu Perfil"}
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {!profile 
                ? "Para acceder a todas las funciones de torneos, necesitas completar tu perfil."
                : "Tu perfil está incompleto. Completa la información faltante para una mejor experiencia."
              }
            </p>
            <div className="mt-3 flex gap-2">
              <Link href="/profile">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <User className="w-4 h-4 mr-2" />
                  {!profile ? "Crear Perfil" : "Completar Perfil"}
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setDismissed(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
              >
                Más tarde
              </Button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}