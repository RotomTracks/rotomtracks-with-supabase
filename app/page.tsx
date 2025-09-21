'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { HomeContent } from "@/components/home/HomeContent";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, error } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Show timeout message after 10 seconds of loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          {showTimeout && (
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                La aplicación está tardando más de lo esperado en cargar...
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recargar página
              </button>
            </div>
          )}
          {error && (
            <div className="max-w-md mx-auto mt-4">
              <p className="text-red-600 text-sm">
                Error: {error}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <HomeNavigation user={user} />

      <div className="flex-1 flex flex-col">
        {/* Home Content with Location Management */}
        <HomeContent user={user} />

        {/* Footer */}
        <HomeFooter user={user} />
      </div>
    </main>
  );
}
