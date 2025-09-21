"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  title?: string;
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

export function SuccessAnimation({
  show,
  title = "¡Éxito!",
  message,
  onComplete,
  duration = 3000,
  className
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setAnimationPhase('enter');
      
      // Phase 1: Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase('show');
      }, 100);

      // Phase 2: Show duration
      const showTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, duration - 500);

      // Phase 3: Exit animation
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(showTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm",
      className
    )}>
      <div className={cn(
        "relative bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-green-200 dark:border-green-800 max-w-sm mx-4 text-center",
        "transition-all duration-500 ease-out",
        animationPhase === 'enter' && "scale-50 opacity-0",
        animationPhase === 'show' && "scale-100 opacity-100",
        animationPhase === 'exit' && "scale-110 opacity-0"
      )}>
        {/* Background sparkles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute text-green-300 dark:text-green-400 opacity-60",
                "animate-pulse",
                i === 0 && "top-4 left-4 h-3 w-3",
                i === 1 && "top-6 right-6 h-2 w-2 animation-delay-200",
                i === 2 && "bottom-8 left-6 h-4 w-4 animation-delay-400",
                i === 3 && "bottom-4 right-4 h-2 w-2 animation-delay-600",
                i === 4 && "top-1/2 left-2 h-3 w-3 animation-delay-800",
                i === 5 && "top-1/3 right-2 h-2 w-2 animation-delay-1000"
              )}
              style={{
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>

        {/* Main success icon */}
        <div className="relative mb-4">
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 transition-all duration-700",
            animationPhase === 'show' && "animate-bounce"
          )}>
            <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Success text */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-green-800 dark:text-green-200">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-green-700 dark:text-green-300">
              {message}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all ease-linear"
              style={{
                width: animationPhase === 'exit' ? '100%' : '0%',
                transitionDuration: `${duration - 600}ms`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}