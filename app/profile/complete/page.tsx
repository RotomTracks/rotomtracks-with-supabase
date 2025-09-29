"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, AlertCircle } from "lucide-react";
import { useTypedTranslation } from "@/lib/i18n";

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const { tPages } = useTypedTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // If user already has a complete profile, redirect to home
    if ((user as any).user_profiles && (user as any).user_profiles.first_name && (user as any).user_profiles.last_name && (user as any).user_profiles.player_id) {
      router.push("/");
      return;
    }

    setProfile((user as any).user_profiles);
    setIsLoading(false);
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">
                {tPages('auth.completeProfile.title')}
              </CardTitle>
              <CardDescription>
                {tPages('auth.completeProfile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {tPages('auth.completeProfile.profileRequired')}
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    {tPages('auth.completeProfile.profileRequiredDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProfileForm user={user} initialProfile={profile} />
        </div>
      </div>
      </div>
    </div>
  );
}