'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useTypedTranslation } from "@/lib/i18n";

export default function ContactPage() {
  const { user } = useAuth();
  const { tPages } = useTypedTranslation();

  return (
    <main id="main-content" className="min-h-screen flex flex-col" role="main">
      <HomeNavigation user={user} />

      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-5 py-12 w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('contact.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {tPages('contact.subtitle')}
            </p>
            
            <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {tPages('contact.comingSoon')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <HomeFooter user={user} />
    </main>
  );
}

