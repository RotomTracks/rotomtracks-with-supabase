"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function FormCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: FormCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn("space-y-1", headerClassName)}>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}