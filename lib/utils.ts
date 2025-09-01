import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_DATABASE_URL &&
  (process.env.NEXT_PUBLIC_CLIENT_AUTH || 
   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY);
