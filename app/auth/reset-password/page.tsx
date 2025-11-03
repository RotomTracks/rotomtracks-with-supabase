"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  const handlePasswordReset = async () => {
    const authToken = token || code;
    
    if (!authToken) {
      setError('Token de recuperación no encontrado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authToken);
      
      if (exchangeError) {
        throw exchangeError;
      }

      if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/update-password');
        }, 2000);
      } else {
        throw new Error('No se pudo verificar el token de recuperación');
      }
    } catch (error: any) {
      setError(
        error.message || 
        'El enlace de recuperación ha expirado o es inválido. Por favor, solicita uno nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((token || code) && type === 'recovery') {
      handlePasswordReset();
    }
  }, [token, code, type, handlePasswordReset]);

  const handleManualReset = () => {
    router.push('/auth/login?error=expired_token&message=El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.');
  };

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">
                ¡Token verificado!
              </CardTitle>
              <CardDescription>
                Redirigiendo a la página de actualización de contraseña...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">
              Verificando enlace de recuperación
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? 'Procesando enlace de recuperación...' 
                : 'Haz clic en el botón para continuar con la recuperación de contraseña'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handlePasswordReset}
                disabled={isLoading || (!token && !code)}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Continuar con la recuperación'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleManualReset}
                className="w-full"
              >
                Solicitar nuevo enlace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl">
                Cargando...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
