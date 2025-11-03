import React, { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '../../ui/components/Button';
import { spacing } from '../../theme/tokens';

type Props = {
  onPicked: (path: string) => void;
};

export function TDFSelector({ onPicked }: Props) {
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    setError(null);
    const selected = await open({
      title: 'Selecciona archivo .tdf',
      multiple: false,
      filters: [{ name: 'Tournament Data File', extensions: ['tdf'] }],
    });
    if (typeof selected === 'string') {
      if (!selected.toLowerCase().endsWith('.tdf')) {
        setError('El archivo debe tener extensión .tdf');
        return;
      }
      onPicked(selected);
    }
  }

  return (
    <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
      <Button variant="secondary" onClick={pick}>Elegir archivo .tdf</Button>
      {error && <span style={{ color: 'crimson' }}>{error}</span>}
    </div>
  );
}



