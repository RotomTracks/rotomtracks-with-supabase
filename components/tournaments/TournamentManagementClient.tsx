'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TDFDownloadManager from '@/components/tournaments/TDFDownloadManager';
import PlayerManagement from '@/components/tournaments/PlayerManagement';
import TournamentSettings from '@/components/tournaments/TournamentSettings';
import RealTimePlayerCount from '@/components/tournaments/RealTimePlayerCount';
import TournamentActivityFeed from '@/components/tournaments/TournamentActivityFeed';
import NotificationCenter from '@/components/tournaments/NotificationCenter';
import { TournamentDetailsModal } from '@/components/tournaments/TournamentDetailsModal';
import { 
  ArrowLeft,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TournamentParticipant, TournamentWithOrganizer } from '@/lib/types/tournament';

interface TournamentManagementClientProps {
  tournament: TournamentWithOrganizer;
  participants: TournamentParticipant[];
}

export default function TournamentManagementClient({ 
  tournament: initialTournament, 
  participants: initialParticipants 
}: TournamentManagementClientProps) {
  const router = useRouter();
  const tournament = initialTournament;
  const participants = initialParticipants;
  
  // State for tournament details modal
  const [showTournamentDetails, setShowTournamentDetails] = useState(false);

  // Calculate statistics
  const registeredCount = participants.filter(p => p.status === 'registered').length;
  const confirmedCount = participants.filter(p => p.status === 'checked_in').length;
  const totalCount = participants.length;

  const handleRefresh = async () => {
    // Refresh the page data
    router.refresh();
  };

  const handleParticipantUpdate = () => {
    handleRefresh();
  };

  const handleTournamentUpdate = () => {
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/tournaments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournaments
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <p className="text-muted-foreground mt-1">Tournament Management</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTournamentDetails(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver como jugador
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationCenter showAsDropdown={true} />
            <Badge variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}>
              {tournament.status}
            </Badge>
            {tournament.registration_open && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Registration Open
              </Badge>
            )}
          </div>
        </div>
      </div>


      {/* Real-time Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RealTimePlayerCount 
          tournamentId={tournament.id}
          initialCount={tournament.current_players}
          initialMax={tournament.max_players}
          initialRegistrationOpen={tournament.registration_open}
          initialStatus={tournament.status}
          showRecentRegistrations={true}
        />
        
        <div className="lg:col-span-2">
          <TournamentActivityFeed 
            tournamentId={tournament.id}
            maxItems={5}
          />
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="participants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Participants ({totalCount})</TabsTrigger>
          <TabsTrigger value="tdf">TDF Generation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          <PlayerManagement 
            tournamentId={tournament.id}
            participants={participants}
            onParticipantUpdate={handleParticipantUpdate}
          />
        </TabsContent>

        {/* TDF Generation Tab */}
        <TabsContent value="tdf" className="space-y-6">
          <TDFDownloadManager 
            tournament={tournament as TournamentWithOrganizer}
            participants={participants}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <TournamentSettings 
            tournament={tournament as any}
            onTournamentUpdate={handleTournamentUpdate}
          />
        </TabsContent>
      </Tabs>
      </div>
      
      {/* Tournament Details Modal */}
      <TournamentDetailsModal
        isOpen={showTournamentDetails}
        onClose={() => setShowTournamentDetails(false)}
        tournament={tournament as TournamentWithOrganizer}
        userRole="authenticated"
      />
    </div>
  );
}