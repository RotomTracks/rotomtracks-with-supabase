"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useTypedTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./user-menu";

export function AuthButtonClient() {
  const { tCommon } = useTypedTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (user) {
    return <UserMenu user={user} />;
  }

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{tCommon("navigation.login")}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{tCommon("navigation.signUp")}</Link>
      </Button>
    </div>
  );
}