import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = (() => {
  try {
    return !!(
      process.env.NEXT_PUBLIC_DATABASE_URL &&
      (process.env.NEXT_PUBLIC_CLIENT_AUTH || 
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY)
    );
  } catch {
    return false;
  }
})();
