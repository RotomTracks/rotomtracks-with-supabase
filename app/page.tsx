'use client';

import { useAuth } from "@/contexts/AuthContext";
import { HomeContent } from "@/components/home/HomeContent";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
