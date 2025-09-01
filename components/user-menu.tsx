"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, User, Trophy, LogOut, Building2 } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  player_id?: string;
  profile_image_url?: string;
  user_role?: string;
}

interface UserMenuProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const supabase = createClient();
  const { tCommon, tAuth } = useTypedTranslation();



  // Obtener el perfil del usuario
  useEffect(() => {
    if (!user.id) {
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (error) {
          console.error("Error cargando perfil:", error);
          return;
        }
        
        setUserProfile(profile);
      } catch (error) {
        console.error("Excepción cargando perfil:", error);
      }
    };

    fetchUserProfile();
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

  const firstLetter = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
          {userProfile?.profile_image_url ? (
            <img 
              src={userProfile.profile_image_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            firstLetter
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userProfile?.first_name && userProfile?.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : tCommon("navigation.profile")
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userProfile?.player_id || tAuth("profile.noPlayerId")}
            </p>
            {userProfile?.user_role && (
              <div className="flex items-center gap-1 mt-1">
                {userProfile.user_role === 'organizer' ? (
                  <Building2 className="w-3 h-3 text-blue-500" />
                ) : (
                  <Trophy className="w-3 h-3 text-green-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userProfile.user_role}
                </span>
              </div>
            )}
          </div>

          <Link 
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <User className="w-4 h-4" />
            {tCommon("buttons.view")} {tCommon("navigation.profile")}
          </Link>



          <Link 
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Trophy className="w-4 h-4" />
            {tCommon("navigation.tournaments")}
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            {tCommon("navigation.logout")}
          </button>
        </div>
      )}


    </div>
  );
}
