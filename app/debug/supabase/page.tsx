import { SupabaseDiagnostic } from '@/components/debug/SupabaseDiagnostic';

export default function SupabaseDiagnosticPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Supabase Diagnostic</h1>
          <p className="text-muted-foreground mt-2">
            Debug your Supabase connection and configuration
          </p>
        </div>
        
        <SupabaseDiagnostic />
        
        <div className="text-sm text-muted-foreground max-w-2xl text-center">
          <p>
            This diagnostic tool helps identify connection issues with Supabase.
            If you see errors, check your environment variables and network connection.
          </p>
        </div>
      </div>
    </div>
  );
}