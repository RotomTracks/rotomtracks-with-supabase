"use client";

import { CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationSummaryData {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  untouchedFields: number;
  completionPercentage: number;
  hasErrors: boolean;
  canSubmit: boolean;
}

interface ValidationSummaryProps {
  summary: ValidationSummaryData;
  className?: string;
  showProgress?: boolean;
  showDetails?: boolean;
}

export function ValidationSummary({
  summary,
  className,
  showProgress = true,
  showDetails = false,
}: ValidationSummaryProps) {
  const {
    totalFields,
    validFields,
    invalidFields,
    untouchedFields,
    completionPercentage,
    hasErrors,
    canSubmit,
  } = summary;

  if (totalFields === 0) return null;

  const getStatusColor = () => {
    if (canSubmit) return "text-green-600 dark:text-green-400";
    if (hasErrors) return "text-red-600 dark:text-red-400";
    if (completionPercentage > 50) return "text-blue-600 dark:text-blue-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getProgressColor = () => {
    if (canSubmit) return "bg-green-500";
    if (hasErrors) return "bg-red-500";
    if (completionPercentage > 50) return "bg-blue-500";
    return "bg-gray-400";
  };

  const getStatusIcon = () => {
    if (canSubmit) return <CheckCircle className="w-4 h-4" />;
    if (hasErrors) return <AlertCircle className="w-4 h-4" />;
    if (completionPercentage > 0) return <TrendingUp className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusMessage = () => {
    if (canSubmit) return "Formulario completo y listo para enviar";
    if (hasErrors)
      return `${invalidFields} campo${
        invalidFields !== 1 ? "s" : ""
      } con errores`;
    if (completionPercentage > 0)
      return `${validFields} de ${totalFields} campos completados`;
    return "Completa los campos para continuar";
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 sm:p-4 transition-all duration-200",
        canSubmit
          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
          : hasErrors
          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
          : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex-shrink-0", getStatusColor())}>
            {getStatusIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-medium", getStatusColor())}>
              {getStatusMessage()}
            </p>
            {showDetails && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                {validFields > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {validFields} válidos
                  </span>
                )}
                {invalidFields > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    {invalidFields} con errores
                  </span>
                )}
                {untouchedFields > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {untouchedFields} pendientes
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {showProgress && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn("text-sm font-medium", getStatusColor())}>
              {completionPercentage}%
            </span>
            <div className="w-16 sm:w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  getProgressColor()
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
