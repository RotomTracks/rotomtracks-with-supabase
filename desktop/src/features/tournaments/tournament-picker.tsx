import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { listButton } from '../../ui/styles';
import { alertError, panel } from '../../ui/styles';
import { muted } from '../../ui/typography';
import { fontSizes, spacing } from '../../theme/tokens';
import { Text } from '../../ui/components/Text';
import { colors } from '../../theme/colors';

type Tournament = {
  id: string;
  name: string;
  start_date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
};

type Props = {
  onSelect: (t: Tournament) => void;
};

export function TournamentPicker({ onSelect }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Tournament[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setItems([]);
          return;
        }
        const todayIso = new Date().toISOString();
        const { data, error } = await supabase
          .from('tournaments')
          .select('id, name, start_date, status')
          .eq('organizer_id', user.id)
          .in('status', ['upcoming', 'ongoing'])
          .gte('start_date', todayIso)
          .order('start_date', { ascending: true });
        if (error) throw error;
        if (!cancelled) setItems(data || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando torneos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
      <div style={{ fontSize: fontSizes['4xl'], marginBottom: spacing.sm }}>⏳</div>
      <div>Cargando torneos…</div>
    </div>
  );
  
  if (error) return (
    <div style={{ ...alertError, borderRadius: 8 }}>
      <strong>❌ Error:</strong> {error}
    </div>
  );
  
  if (items.length === 0) return (
    <div style={{ ...panel, padding: spacing.xxl, textAlign: 'center', background: '#e5e7eb', color: colors.textDark }}>
      <div style={{ fontSize: fontSizes['4xl'], marginBottom: spacing.sm }}>📅</div>
      <div style={{ fontSize: fontSizes.lg, fontWeight: 500, marginBottom: spacing.xs }}>No hay torneos futuros</div>
      <div style={{ ...muted }}>Crea un torneo desde la web para comenzar</div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: spacing.md }}>
      {items.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          style={listButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Text as="div" size={'lg'} weight={'semibold'} style={{ color: colors.textDark, marginBottom: spacing.xs }}>
            🏆 {t.name}
          </Text>
          <Text as="div" size={'sm'} style={{ color: colors.textMuted, display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            📅 {new Date(t.start_date).toLocaleDateString('es-ES', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </button>
      ))}
    </div>
  );
}



