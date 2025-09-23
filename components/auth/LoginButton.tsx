"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";

export function LoginButton() {
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();

  return (
    <Link href="/auth/login" className="w-full">
      <Button className="w-full">
        <Mail className="w-4 h-4 mr-2" />
        {tUI('navigation.login')}
      </Button>
    </Link>
  );
}