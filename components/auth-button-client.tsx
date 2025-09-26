"use client";

import { useTypedTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserMenu } from "./user-menu";
import { useAuthModalContext } from "./auth/AuthModalContext";

export function AuthButtonClient() {
  const { tUI } = useTypedTranslation();
  const { user, loading } = useAuth();
  const { openLoginModal, openSignUpModal } = useAuthModalContext();

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (user) {
    return <UserMenu user={user} />;
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={openLoginModal}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs border border-gray-300 dark:border-gray-600 bg-transparent shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        {tUI("navigation.login")}
      </button>
      <button 
        onClick={openSignUpModal}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs bg-blue-600 text-white shadow-sm hover:bg-blue-700"
      >
        {tUI("navigation.signUp")}
      </button>
    </div>
  );
}