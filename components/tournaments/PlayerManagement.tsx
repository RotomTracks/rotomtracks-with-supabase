'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TournamentParticipant } from '@/lib/types/tournament';

interface PlayerManagementProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  onParticipantUpdate: () => void;
}

export default function PlayerManagement({ 
  tournamentId, 
  participants, 
  onParticipantUpdate 
}: PlayerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<TournamentParticipant | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter participants based on search and status
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (participant.player_id && participant.player_id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: participants.length,
    registered: participants.filter(p => p.status === 'registered').length,
    confirmed: participants.filter(p => p.status === 'confirmed').length,
    waitlist: participants.filter(p => p.status === 'waitlist').length,
    dropped: participants.filter(p => p.status === 'dropped').length,
  };

  const updateParticipantStatus = async (participantId: string, newStatus: string) => {
    setActionLoading(participantId);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update participant status');
      }

      onParticipantUpdate();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const removeParticipant = async (participantId: string) => {
    setActionLoading(participantId);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove participant');
      }

      onParticipantUpdate();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'registered':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'waitlist':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'dropped':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'registered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'waitlist':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dropped':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Player Management
        </CardTitle>
        <CardDescription>
          Manage tournament participants, approve registrations, and update player status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-700">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.registered}</div>
            <div className="text-sm text-blue-700">Registered</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-green-700">Confirmed</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.waitlist}</div>
            <div className="text-sm text-orange-700">Waitlist</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
            <div className="text-sm text-red-700">Dropped</div>
          </div>
        </div>

        <Separator />

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Players</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, or player ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status-filter">Filter by Status</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('registered')}>
                  Registered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('waitlist')}>
                  Waitlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('dropped')}>
                  Dropped
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Participants List */}
        <div className="space-y-3">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              )}
            </div>
          ) : (
            filteredParticipants.map((participant, index) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{participant.player_name}</h4>
                      <Badge className={getStatusColor(participant.status)}>
                        {getStatusIcon(participant.status)}
                        <span className="ml-1">{participant.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{participant.email}</span>
                      </div>
                      {participant.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{participant.phone}</span>
                        </div>
                      )}
                      {participant.player_id && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">ID:</span>
                          <span>{participant.player_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(participant.registration_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Player Details</DialogTitle>
                        <DialogDescription>
                          Complete information for {participant.player_name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedParticipant && (
                        <div className="space-y-4">
                          <div>
                            <Label>Name</Label>
                            <p className="text-sm">{selectedParticipant.player_name}</p>
                          </div>
                          
                          <div>
                            <Label>Email</Label>
                            <p className="text-sm">{selectedParticipant.email}</p>
                          </div>
                          
                          {selectedParticipant.phone && (
                            <div>
                              <Label>Phone</Label>
                              <p className="text-sm">{selectedParticipant.phone}</p>
                            </div>
                          )}
                          
                          {selectedParticipant.player_id && (
                            <div>
                              <Label>Player ID</Label>
                              <p className="text-sm">{selectedParticipant.player_id}</p>
                            </div>
                          )}
                          
                          {selectedParticipant.player_birthdate && (
                            <div>
                              <Label>Birth Date</Label>
                              <p className="text-sm">
                                {new Date(selectedParticipant.player_birthdate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <Label>Registration Date</Label>
                            <p className="text-sm">
                              {new Date(selectedParticipant.registration_date).toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <Label>Registration Source</Label>
                            <p className="text-sm">{selectedParticipant.registration_source}</p>
                          </div>
                          
                          {selectedParticipant.tdf_userid && (
                            <div>
                              <Label>TDF User ID</Label>
                              <p className="text-sm font-mono">{selectedParticipant.tdf_userid}</p>
                            </div>
                          )}
                          
                          {selectedParticipant.emergency_contact && (
                            <div>
                              <Label>Emergency Contact</Label>
                              <p className="text-sm">{selectedParticipant.emergency_contact}</p>
                              {selectedParticipant.emergency_phone && (
                                <p className="text-sm text-muted-foreground">
                                  {selectedParticipant.emergency_phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={actionLoading === participant.id}
                      >
                        {actionLoading === participant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {participant.status === 'registered' && (
                        <DropdownMenuItem 
                          onClick={() => updateParticipantStatus(participant.id, 'confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Registration
                        </DropdownMenuItem>
                      )}
                      
                      {participant.status === 'waitlist' && (
                        <DropdownMenuItem 
                          onClick={() => updateParticipantStatus(participant.id, 'registered')}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Move to Registered
                        </DropdownMenuItem>
                      )}
                      
                      {participant.status !== 'dropped' && (
                        <DropdownMenuItem 
                          onClick={() => updateParticipantStatus(participant.id, 'dropped')}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Mark as Dropped
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove Participant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}