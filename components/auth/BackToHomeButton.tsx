"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";

export function BackToHomeButton() {
  const { tCommon } = useTypedTranslation();

  return (
    <Link href="/" className="w-full">
      <Button variant="ghost" className="w-full">
        <Home className="w-4 h-4 mr-2" />
        {tCommon('buttons.backToHome')}
      </Button>
    </Link>
  );
}