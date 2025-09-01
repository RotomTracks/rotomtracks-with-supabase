import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserProfile } from "@/lib/auth/roles";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, AlertCircle } from "lucide-react";

export default async function CompleteProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentUserProfile();
  
  // If user already has a complete profile, redirect to home
  if (profile && profile.first_name && profile.last_name && profile.player_id) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Please complete your profile to access all tournament features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Profile Required
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    To participate in tournaments and access all features, please complete your profile with your tournament information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProfileForm user={user} initialProfile={profile} />
        </div>
      </div>
    </div>
  );
}