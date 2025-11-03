import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { alertWarning } from '../../ui/styles';
import { h2 } from '../../ui/typography';
import { containerPadding } from '../../ui/styles';
import { Button } from '../../ui/components/Button';
import { fontSizes } from '../../theme/tokens';

type Props = {
  children: React.ReactNode;
};

export function OrganizerGate({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setIsOrganizer(false);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_role')
          .eq('user_id', user.id)
          .single();
        if (cancelled) return;
        if (error) {
          setError(error.message);
          setIsOrganizer(false);
        } else {
          // Allow both organizer and admin roles
          const allowedRoles = ['organizer', 'admin'];
          setIsOrganizer(allowedRoles.includes(data?.user_role));
          console.log('✅ Usuario verificado:', { role: data?.user_role, allowed: allowedRoles.includes(data?.user_role) });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={containerPadding}>
        <div style={{ fontSize: fontSizes.lg, marginBottom: 8 }}>🔄 Comprobando permisos…</div>
        <div style={{ fontSize: fontSizes.xs, color: '#666' }}>Verificando rol de usuario...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={containerPadding}>
        <h2 style={{ ...h2, marginBottom: 8, color: 'crimson' }}>❌ Error</h2>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
          {error}
        </pre>
        <Button style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }
  
  if (!isOrganizer) {
    return (
      <div style={containerPadding}>
        <h2 style={{ ...h2, marginBottom: 8 }}>⚠️ Acceso restringido</h2>
        <p style={{ marginBottom: 16 }}>Esta aplicación es solo para cuentas de organizador o administrador.</p>
        <div style={{ ...alertWarning, marginBottom: 16 }}>
          <strong>ℹ️ Información:</strong>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14 }}>
            Para usar la aplicación desktop, necesitas tener una cuenta con rol de "organizador" o "administrador".
            Si deberías tener acceso y ves este mensaje, contacta con el administrador del sistema.
          </p>
        </div>
        <Button variant="danger" onClick={() => supabase.auth.signOut().then(() => window.location.reload())}>Cerrar sesión</Button>
      </div>
    );
  }
  return <>{children}</>;
}



