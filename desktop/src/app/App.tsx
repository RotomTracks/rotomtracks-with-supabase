import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { supabase } from '../lib/supabase';
import { withBackoff } from '../lib/retry';
import { notify } from '../lib/notify';
import { Login } from '../features/auth/login';
import { OrganizerGate } from '../features/auth/organizer-gate';
import { TournamentPicker } from '../features/tournaments/tournament-picker';
import { TDFSelector } from '../features/files/tdf-selector';
import { FileWatcher } from '../features/files/file-watcher';
import { uploadTDFAndRegister } from '../features/upload/upload-tdf';
import { processTournament } from '../features/upload/process-tournament';
import { DebugScreen } from '../ui/components/DebugScreen';
import { colors } from '../theme/colors';
import { pageGradient, toggleButton, buttonSecondary, panel, alertSuccess } from '../ui/styles';
import { HeaderBar } from '../ui/components/HeaderBar';
import { SectionCard } from '../ui/components/SectionCard';
import { StatusPill } from '../ui/components/StatusPill';
import { Button } from '../ui/components/Button';
import { iconSizes, fontSizes, spacing } from '../theme/tokens';
import { containerPadding, codeBlockMuted, contentContainer, rowBetweenCenter, textCenter, centeredFull, heroContainer, titleBlock, sectionTopRow, sectionTitleSpacer, mutedParagraph } from '../ui/styles';
import { Text } from '../ui/components/Text';

export function App() {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState<{ id: string; name: string } | null>(null);
  const [tdfPath, setTdfPath] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(true);

  useEffect(() => {
    const unlistenPromise = listen('tray://toggle-watch', () => {
      setIsWatching(prev => !prev);
    });
    return () => {
      unlistenPromise.then(un => un());
    };
  }, []);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setShowDebug(true);
      return;
    }
  }, []);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    setDebugInfo(`URL: ${supabaseUrl ? 'Configurado ✓' : 'NO CONFIGURADO ✗'}\nKey: ${supabaseKey ? 'Configurado ✓' : 'NO CONFIGURADO ✗'}`);

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          setError(`Error de sesión: ${error.message}`);
        }
        setIsLogged(!!data.session);
      })
      .catch((err) => {
        setError(`Error crítico: ${err.message}`);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (showDebug) {
    return (
      <div>
        <DebugScreen />
        <div style={{ ...textCenter, marginTop: spacing.lg }}>
          <Button onClick={() => setShowDebug(false)}>Continuar de todas formas</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerPadding}>
        <Text as="h1" size={'xl'} weight={'bold'} style={{ marginBottom: spacing.lg, color: 'red' }}>⚠️ Error</Text>
        <pre style={codeBlockMuted}>
          {error}
        </pre>
        <Text as="h2" size={'md'} weight={'semibold'} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Debug Info:</Text>
        <pre style={codeBlockMuted}>
          {debugInfo}
        </pre>
      </div>
    );
  }

  if (isLogged === null) {
    return (
      <div style={containerPadding}>
        <div>Cargando…</div>
        <pre style={{ ...codeBlockMuted, marginTop: 12, fontSize: 11 }}>
          {debugInfo}
        </pre>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div style={pageGradient}>
        <div style={centeredFull}>
          <div style={heroContainer}>
            <div style={titleBlock}>
              <Text as="h1" size={'4xl'} weight={'bold'} style={{ color: 'white', marginBottom: spacing.sm }}>
                🎮 RotomTracks Desktop
              </Text>
              <Text as="p" size={'lg'} style={{ color: 'rgba(255,255,255,0.9)' }}>
                Gestión de torneos en tiempo real
              </Text>
            </div>
            <Login onLoggedIn={() => setIsLogged(true)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrganizerGate>
      <div style={pageGradient}>
        <HeaderBar 
          title="🎮 RotomTracks Desktop"
          subtitle="Gestión de torneos en tiempo real"
          showDebug={import.meta.env.DEV}
          onDebug={() => setShowDebug(true)}
          onLogout={async () => { await supabase.auth.signOut(); setIsLogged(false); }}
        />

        <div style={{ 
          flex: 1,
          overflow: 'auto',
          padding: 24
        }}>
          <div style={contentContainer}>
          {!selectedTournament ? (
            <SectionCard title="📋 Selecciona un Torneo" subtitle="Elige el torneo que deseas gestionar">
              <TournamentPicker onSelect={(t) => setSelectedTournament({ id: t.id, name: t.name })} />
            </SectionCard>
          ) : (
            <div style={{ display: 'grid', gap: spacing.lg }}>
              <SectionCard borderColor={colors.primary} padding={20}>
                <div style={rowBetweenCenter}>
                  <div>
                    <Text size={'md'} style={{ color: colors.textMuted, marginBottom: spacing.xs }}>Torneo Seleccionado</Text>
                    <Text size={'xl'} weight={'semibold'} style={{ color: colors.textDark }}>🏆 {selectedTournament.name}</Text>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTournament(null);
                      setTdfPath(null);
                    }}
                    style={buttonSecondary()}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  >
                    <span style={{ fontSize: iconSizes.md }}>↩️</span> Cambiar torneo
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="📁 Archivo del Torneo">
                <h2 style={sectionTitleSpacer}>{/* Title rendered by SectionCard; keep spacing */}</h2>
                {!tdfPath ? (
                  <>
                    <p style={mutedParagraph}>
                      Selecciona el archivo .tdf del torneo para comenzar el monitoreo
                    </p>
                    <TDFSelector onPicked={setTdfPath} />
                  </>
                ) : (
                  <div>
                    <div style={{ 
                      ...panel,
                      marginBottom: spacing.lg,
                    }}>
                      <Text size={'sm'} style={{ color: colors.textMuted, marginBottom: spacing.xs }}>Archivo Monitorizado:</Text>
                      <code style={{ fontSize: fontSizes.sm, color: '#374151', wordBreak: 'break-all', display: 'block' }}>
                        📄 {tdfPath}
                      </code>
                    </div>
                    {tdfPath && (
                      <FileWatcher
                        path={tdfPath}
                        enabled={isWatching}
                        onChange={async (content) => {
                          if (!selectedTournament) return;
                          try {
                            const { fileId } = await withBackoff(() =>
                              uploadTDFAndRegister(selectedTournament.id!, tdfPath, content)
                            );
                            await withBackoff(() =>
                              processTournament(selectedTournament.id!, fileId, { generateReport: true, updateData: true })
                            );
                            setLastSyncedAt(new Date().toISOString());
                            notify('Torneo actualizado', 'Los datos se han sincronizado correctamente.');
                          } catch (e) {
                            notify('Error de sincronización', e instanceof Error ? e.message : 'Fallo desconocido');
                          }
                        }}
                      />
                    )}
                    {lastSyncedAt && (
                      <div style={{ ...alertSuccess, marginTop: spacing.md }}>
                        <div style={{ fontSize: fontSizes.sm }}>
                          ✅ Última actualización: {new Date(lastSyncedAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                    )}

                    <div style={sectionTopRow}>
                      <StatusPill isOn={isWatching} />
                      <Button onClick={() => setIsWatching(v => !v)} style={toggleButton(isWatching)}>
                        {isWatching ? '⏸️ Pausar' : '▶️ Reanudar'}
                      </Button>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}
          </div>
        </div>
      </div>
    </OrganizerGate>
  );
}


