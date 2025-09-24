"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { ChevronDown, User, Trophy, LogOut, Shield, Building2 } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";
import { Avatar } from "./ui/avatar";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  player_id?: string;
  user_role?: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut, isAdmin } = useAuth();
  const supabase = createClient();
  const { tAuth, tUI } = useTypedTranslation();

  // Obtener el perfil del usuario y estadísticas de torneos
  useEffect(() => {
    if (!user.id) {
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (profileError) {
          console.error("Error cargando perfil:", profileError);
        } else {
          setUserProfile(profile);
        }

        // Stats section removed to simplify menu
      } catch (error) {
        console.error("Excepción cargando datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [user.id, supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label={`${tUI('navigation.account')} menu`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="user-menu"
      >
        <Avatar 
          firstName={userProfile?.first_name}
          lastName={userProfile?.last_name}
          email={user.email}
          size="md"
        />
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {isOpen && (
        <div 
          id="user-menu"
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          role="menu"
          aria-label="User account menu"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userProfile?.first_name && userProfile?.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : tUI("navigation.profile")
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userProfile?.player_id || tAuth("profile.noPlayerId")}
            </p>
            {userProfile?.user_role && (
              <div className="flex items-center gap-1 mt-1">
                {userProfile.user_role === 'admin' ? (
                  <Shield className="w-3 h-3 text-red-500" />
                ) : userProfile.user_role === 'organizer' ? (
                  <Building2 className="w-3 h-3 text-blue-500" />
                ) : (
                  <Trophy className="w-3 h-3 text-green-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userProfile.user_role === 'admin' ? 'Administrador' : userProfile.user_role}
                </span>
              </div>
            )}
          </div>

          <Link 
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            role="menuitem"
          >
            <User className="w-4 h-4" />
            {tUI("buttons.view")} {tUI("navigation.profile")}
          </Link>

          {/* Admin Panel Link - Only show for admin users */}
          {isAdmin && (
            <Link 
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 font-medium"
              role="menuitem"
            >
              <Shield className="w-4 h-4" />
              Panel de Administración
            </Link>
          )}

          {/* Single dashboard entry for all roles */}
          <Link 
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            role="menuitem"
          >
            <Trophy className="w-4 h-4" />
            Ir al dashboard
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            {tUI("navigation.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
