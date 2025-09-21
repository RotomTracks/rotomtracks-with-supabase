import { UpdatePasswordForm } from "@/components/update-password-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  
  // Check if user has an active session
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    // No active session, redirect to forgot password page
    redirect('/auth/login?error=no_session&message=You must request a recovery link first.');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
