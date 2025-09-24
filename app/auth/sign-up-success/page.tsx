"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { useTypedTranslation } from "@/lib/i18n";

export default function Page() {
  const { tPages } = useTypedTranslation();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">
                {tPages('auth.signupSuccess.title')}
              </CardTitle>
              <CardDescription>
                {tPages('auth.signupSuccess.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    {tPages('auth.signupSuccess.checkEmail')}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {tPages('auth.signupSuccess.emailSent')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {tPages('auth.signupSuccess.whatsNext')}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{tPages('auth.signupSuccess.steps.confirmEmail')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{tPages('auth.signupSuccess.steps.completeProfile')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{tPages('auth.signupSuccess.steps.searchTournaments')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{tPages('auth.signupSuccess.steps.registerTrack')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">
                    {tPages('auth.signupSuccess.signInButton')}
                  </Button>
                </Link>
                
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full">
                    {tPages('auth.signupSuccess.backToHomeButton')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
