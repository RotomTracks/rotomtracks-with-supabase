'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TDFUpload } from '@/components/tournaments/TDFUpload';
import { CreateTournamentForm } from '@/components/tournaments/CreateTournamentForm';

interface CreateTournamentSwitcherProps {
  user: any;
}

export default function CreateTournamentSwitcher({ user }: CreateTournamentSwitcherProps) {
  const [mode, setMode] = useState<'tdf' | 'manual'>('tdf');

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'tdf' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tdf">Subir archivo TDF</TabsTrigger>
            <TabsTrigger value="manual">Crear manualmente</TabsTrigger>
          </TabsList>

          <TabsContent value="tdf" className="pt-6">
            <TDFUpload />
          </TabsContent>

          <TabsContent value="manual" className="pt-6">
            <CreateTournamentForm user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


