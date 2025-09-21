'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TDFDownloadManager from '@/components/tournaments/TDFDownloadManager';
import PlayerManagement from '@/components/tournaments/PlayerManagement';
import TournamentSettings from '@/components/tournaments/TournamentSettings';
import RealTimePlayerCount from '@/components/tournaments/RealTimePlayerCount';
import TournamentActivityFeed from '@/components/tournaments/TournamentActivityFeed';
import NotificationCenter from '@/components/tournaments/NotificationCenter';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Settings,
  ArrowLeft,
  Trophy,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TournamentParticipant, Tournament } from '@/lib/types/tournament';

interface LocalTournament extends Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  city: string;
  state?: string;
  country: string;
  start_date: string;
  end_date?: string;
  status: string;
  current_players: number;
  max_players?: number;
  registration_open: boolean;
  official_tournament_id?: string;
  organizer_name?: string;
  organizer_popid?: string;
  tdf_metadata?: any;
}

interface TournamentManagementClientProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
}

export default function TournamentManagementClient({ 
  tournament: initialTournament, 
  participants: initialParticipants 
}: TournamentManagementClientProps) {
  const router = useRouter();
  const [tournament, setTournament] = useState(initialTournament);
  const [participants, setParticipants] = useState(initialParticipants);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate statistics
  const registeredCount = participants.filter(p => p.status === 'registered').length;
  const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
  const waitlistCount = participants.filter(p => p.status === 'waitlist').length;
  const totalCount = participants.length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the page data
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleParticipantUpdate = () => {
    handleRefresh();
  };

  const handleTournamentUpdate = () => {
    handleRefresh();
  };

  return (
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
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-muted-foreground mt-1">Tournament Management</p>
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

      {/* Tournament Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {new Date(tournament.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {tournament.city}, {tournament.country}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="font-medium">
                  {registeredCount + confirmedCount}
                  {tournament.max_players && ` / ${tournament.max_players}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tournament ID</p>
                <p className="font-medium font-mono text-sm">
                  {tournament.official_tournament_id || tournament.id.substring(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            tournament={tournament}
            participants={participants}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <TournamentSettings 
            tournament={tournament}
            onTournamentUpdate={handleTournamentUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}