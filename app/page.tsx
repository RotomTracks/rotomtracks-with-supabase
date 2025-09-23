'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { HomeContent } from "@/components/home/HomeContent";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useTypedTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const { tPages } = useTypedTranslation();
  const [, setShowTimeout] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);

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
  return (
    <main className="min-h-screen flex flex-col">
      <HomeNavigation user={user} />

      <div className="flex-1 flex flex-col">
        <HomeContent user={user} />
        <HomeFooter user={user} />
      </div>
      {loading && forceShow && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
          {tPages('home.loadingAuth')}
        </div>
      )}
    </main>
  );
}
