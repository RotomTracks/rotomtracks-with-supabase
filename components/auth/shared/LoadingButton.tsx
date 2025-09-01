"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("transition-all duration-200", className)}
      aria-busy={loading}
      aria-live="polite"
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      <span>{loading ? (loadingText || children) : children}</span>
    </Button>
  );
}