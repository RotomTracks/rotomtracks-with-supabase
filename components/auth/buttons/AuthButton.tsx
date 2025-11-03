
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user/UserMenu";
import { AuthButtonClient } from "./AuthButtonClient";

export async function AuthButton() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return user ? (
    <UserMenu user={user} />
  ) : (
    <AuthButtonClient />
  );
}
