"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTypedTranslation } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const { tPages } = useTypedTranslation();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {tPages('auth.error.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-sm text-muted-foreground">
                  {tPages('auth.error.codeError', { error })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {tPages('auth.error.unspecifiedError')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
