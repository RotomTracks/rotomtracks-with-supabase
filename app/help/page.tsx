'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { HomeNavigation } from "@/components/home/HomeNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useTypedTranslation } from "@/lib/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  const { user } = useAuth();
  const { tPages } = useTypedTranslation();

  return (
    <main id="main-content" className="min-h-screen flex flex-col" role="main">
      <HomeNavigation user={user} />

      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-5 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {tPages('help.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {tPages('help.subtitle')}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              'search',
              'createAccount',
              'registerTournament',
              'organizeTournament',
              'tournamentTypes',
              'organizerFeatures'
            ].map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-left">
                  {tPages(`help.faq.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent>
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: tPages(`help.faq.${key}.answer`) }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {tPages('help.stillNeedHelp.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {tPages('help.stillNeedHelp.description')}
            </p>
          </div>
        </div>
      </div>

      <HomeFooter user={user} />
    </main>
  );
}

