'use client';

import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useTypedTranslation } from "@/lib/i18n";

export default function PrivacyPage() {
  const { tPages } = useTypedTranslation();

  return (
    <main id="main-content" className="min-h-screen flex flex-col" role="main">
      <HomeNavigation />

      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-5 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('privacy.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {tPages('privacy.lastUpdated')}
            </p>
          </div>

          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {tPages('privacy.commitment.title')}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>{tPages('privacy.commitment.noThirdParties')}</li>
              <li>{tPages('privacy.commitment.noAdvertising')}</li>
              <li>{tPages('privacy.commitment.dataSecurity')}</li>
            </ul>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {['dataCollected', 'dataUse', 'security', 'rights', 'pokemonData'].map((section) => (
              <div key={section} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {tPages(`privacy.sections.${section}.title`)}
                </h2>
                <div 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: tPages(`privacy.sections.${section}.content`) }}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tPages('privacy.contact')}
            </p>
          </div>
        </div>
      </div>

      <HomeFooter />
    </main>
  );
}

