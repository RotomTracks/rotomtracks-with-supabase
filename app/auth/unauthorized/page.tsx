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
import { useSearchParams } from "next/navigation";
import { Shield, Building2, Trophy, ArrowLeft, Home } from "lucide-react";
import { Suspense } from "react";
import { useTypedTranslation } from "@/lib/i18n";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";
import { GoBackButton } from "@/components/auth/GoBackButton";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();
  const reason = searchParams.get("reason");
  const redirectTo = searchParams.get("redirectTo");

  const getErrorInfo = () => {
    switch (reason) {
      case "organizer_required":
        return {
          icon: <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
          title: tPages('unauthorized.organizerRequired.title'),
          description: tPages('unauthorized.organizerRequired.description'),
          suggestion: tPages('unauthorized.organizerRequired.suggestion'),
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800"
        };
      case "player_required":
        return {
          icon: <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />,
          title: tPages('unauthorized.playerRequired.title'),
          description: tPages('unauthorized.playerRequired.description'),
          suggestion: tPages('unauthorized.playerRequired.suggestion'),
          bgColor: "bg-green-100 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800"
        };
      default:
        return {
          icon: <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />,
          title: tPages('unauthorized.accessDenied.title'),
          description: tPages('unauthorized.accessDenied.description'),
          suggestion: tPages('unauthorized.accessDenied.suggestion'),
          bgColor: "bg-red-100 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800"
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto ${errorInfo.bgColor} rounded-full flex items-center justify-center mb-4 border ${errorInfo.borderColor}`}>
                {errorInfo.icon}
              </div>
              <CardTitle className="text-2xl">
                {errorInfo.title}
              </CardTitle>
              <CardDescription>
                {errorInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-4 ${errorInfo.bgColor} rounded-lg border ${errorInfo.borderColor}`}>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {errorInfo.suggestion}
                </p>
              </div>

              {reason === "organizer_required" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    How to become an organizer:
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <span>Go to your profile settings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <span>Change your account type to &quot;Organizer&quot;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <span>Add your organization information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <span>Save your changes</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link href="/profile" className="w-full">
                  <Button className="w-full">
                    <Trophy className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                
                {redirectTo && (
                  <GoBackButton href={redirectTo} />
                )}
                
                <BackToHomeButton />
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Need help? Contact support if you continue having access issues.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}