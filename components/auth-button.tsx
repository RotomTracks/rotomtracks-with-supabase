
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";
import { AuthButtonClient } from "./auth-button-client";

export async function AuthButton() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return user ? (
    <UserMenu user={user} />
  ) : (
    <AuthButtonClient />
  );
}
