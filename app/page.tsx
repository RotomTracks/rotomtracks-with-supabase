'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { HomeContent } from "@/components/home/HomeContent";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useTypedTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, error } = useAuth();
  const { tCommon } = useTypedTranslation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  // Show timeout message after 5 seconds of loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);

      // Force show the app after 12 seconds even if auth is still loading
      const forceTimer = setTimeout(() => {
        setForceShow(true);
      }, 12000);

      return () => {
        clearTimeout(timer);
        clearTimeout(forceTimer);
      };
    } else {
      setShowTimeout(false);
      setForceShow(false);
    }
  }, [loading]);

  // Show loading screen only if we haven't forced show and we're still loading
  if (loading && !forceShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">{tCommon('pages.home.loading')}</p>
          
          {showTimeout && (
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                {tCommon('pages.home.loadingTooLong')}
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => setForceShow(true)} 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                >
                  {tCommon('buttons.continueWithoutAuth')}
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {tCommon('buttons.reloadPage')}
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="max-w-md mx-auto mt-4">
              <p className="text-red-600 text-sm mb-2">
                {tCommon('pages.home.connectionError', { error })}
              </p>
              <button 
                onClick={() => setForceShow(true)} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {tCommon('buttons.continueWithoutAuth')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show the app (either auth loaded successfully or we forced it)
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
      
      {/* Show a small indicator if auth is still loading */}
      {loading && forceShow && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
          {tCommon('pages.home.loadingAuth')}
        </div>
      )}
    </main>
  );
}
