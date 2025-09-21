"use client";

import { SupabaseDiagnostic } from '@/components/debug/SupabaseDiagnostic';
import { useTypedTranslation } from '@/lib/i18n';

export default function SupabaseDiagnosticPage() {
  const { tCommon } = useTypedTranslation();
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{tCommon('pages.debug.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {tCommon('pages.debug.description')}
          </p>
        </div>
        
        <SupabaseDiagnostic />
        
        <div className="text-sm text-muted-foreground max-w-2xl text-center">
          <p>
            {tCommon('pages.debug.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
}