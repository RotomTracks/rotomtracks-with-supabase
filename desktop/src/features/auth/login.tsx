import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { card } from '../../ui/styles';
import { Button } from '../../ui/components/Button';
import { FormField } from '../../ui/components/FormField';
import { alertError } from '../../ui/styles';
import { spacing } from '../../theme/tokens';

type Props = {
  onLoggedIn: () => void;
};

export function Login({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    console.log('🔐 Intentando iniciar sesión...', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });                                                                       
      
      if (error) {
        console.error('❌ Error de login:', error);
        setError(error.message || 'No se pudo iniciar sesión');
        setLoading(false);
        return;
      }
      
      console.log('✅ Login exitoso', data.user?.email);
      onLoggedIn();
    } catch (err) {
      console.error('❌ Error crítico:', err);
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: spacing.lg, maxWidth: 400, ...card }}>
      <FormField
        label="Email"
        inputProps={{
          value: email,
          onChange: (e) => setEmail(e.target.value),
          type: 'email',
          required: true,
          placeholder: 'tu@email.com',
        }}
      />
      <FormField
        label="Contraseña"
        inputProps={{
          value: password,
          onChange: (e) => setPassword(e.target.value),
          type: showPassword ? 'text' : 'password',
          required: true,
          placeholder: '••••••••',
          style: { padding: '10px 38px 10px 12px' },
        }}
        rightAdornment={(
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      />
      {error && (
        <div style={alertError}>
          {error}
        </div>
      )}
      <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>
        {loading ? '⏳ Iniciando…' : '🔓 Iniciar sesión'}
      </Button>
    </form>
  );
}


