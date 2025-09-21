"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTypedTranslation } from "@/lib/i18n";

interface GoBackButtonProps {
  href?: string;
}

export function GoBackButton({ href = "/" }: GoBackButtonProps) {
  const { tCommon } = useTypedTranslation();

  return (
    <Link href={href} className="w-full">
      <Button variant="outline" className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {tCommon('buttons.goBack')}
      </Button>
    </Link>
  );
}