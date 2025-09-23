"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";

export function BackToTournamentsButton() {
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();

  return (
    <Link href="/tournaments">
      <Button variant="outline" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tUI('buttons.backToTournaments')}
      </Button>
    </Link>
  );
}