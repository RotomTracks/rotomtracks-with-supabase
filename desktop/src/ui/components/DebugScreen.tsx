import React from 'react';
import { h1, subtitle as subtitleStyle } from '../../ui/typography';
import { panel } from '../../ui/styles';

export function DebugScreen() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const webBaseUrl = import.meta.env.VITE_WEB_BASE_URL;

  return (
    <div style={{ 
      padding: 40,
      fontFamily: 'monospace',
      fontSize: 14,
      lineHeight: 1.6,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h1 style={{ ...h1, marginBottom: 24, color: '#333' }}>
        🔍 RotomTracks Desktop - Debug Info
      </h1>
      
      <div style={{ ...panel, background: '#f5f5f5', marginBottom: 16 }}>
        <h2 style={{ ...subtitleStyle, fontSize: 18, marginBottom: 12, color: '#666' }}>Variables de Entorno:</h2>
        
        <div style={{ marginBottom: 12 }}>
          <strong>VITE_SUPABASE_URL:</strong>
          <div style={{ 
            background: supabaseUrl ? '#d4edda' : '#f8d7da', 
            padding: 8, 
            marginTop: 4,
            borderRadius: 4,
            color: supabaseUrl ? '#155724' : '#721c24'
          }}>
            {supabaseUrl ? `✓ ${supabaseUrl}` : '✗ NO CONFIGURADO'}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>VITE_SUPABASE_ANON_KEY:</strong>
          <div style={{ 
            background: supabaseKey ? '#d4edda' : '#f8d7da', 
            padding: 8, 
            marginTop: 4,
            borderRadius: 4,
            color: supabaseKey ? '#155724' : '#721c24'
          }}>
            {supabaseKey ? `✓ ${supabaseKey.substring(0, 20)}...` : '✗ NO CONFIGURADO'}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>VITE_WEB_BASE_URL:</strong>
          <div style={{ 
            background: webBaseUrl ? '#d4edda' : '#fff3cd', 
            padding: 8, 
            marginTop: 4,
            borderRadius: 4,
            color: webBaseUrl ? '#155724' : '#856404'
          }}>
            {webBaseUrl || '⚠ No configurado (opcional)'}
          </div>
        </div>
      </div>

      <div style={{ ...panel, background: '#e7f3ff', marginBottom: 16 }}>
        <h2 style={{ ...subtitleStyle, fontSize: 18, marginBottom: 12, color: '#004085' }}>ℹ️ Información:</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Las variables se leen del archivo <code>.env.local</code> en la raíz del proyecto</li>
          <li>Se mapean desde las variables de Next.js (NEXT_PUBLIC_API_URL, etc.)</li>
          <li>Si ves "NO CONFIGURADO", verifica tu archivo .env.local</li>
        </ul>
      </div>

      {(!supabaseUrl || !supabaseKey) && (
        <div style={{ ...panel, background: '#f8d7da', color: '#721c24' }}>
          <h2 style={{ ...subtitleStyle, fontSize: 18, marginBottom: 12 }}>❌ Acción Requerida:</h2>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>Verifica que existe el archivo <code>.env.local</code> en la raíz del proyecto</li>
            <li>Debe contener: <code>NEXT_PUBLIC_API_URL</code> y <code>NEXT_PUBLIC_API_TOKEN</code></li>
            <li>Reconstruye la aplicación: <code>pnpm build && pnpm tauri build</code></li>
          </ol>
        </div>
      )}
    </div>
  );
}

