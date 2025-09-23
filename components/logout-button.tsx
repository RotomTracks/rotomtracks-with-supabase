"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTypedTranslation } from "@/lib/i18n";

export function LogoutButton() {
  const router = useRouter();
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>{tCommon("navigation.logout")}</Button>;
}
