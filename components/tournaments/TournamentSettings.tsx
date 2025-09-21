'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Calendar, 
  Users, 
  MapPin,
  FileText,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Tournament {
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

interface TournamentSettingsProps {
  tournament: Tournament;
  onTournamentUpdate: () => void;
}

export default function TournamentSettings({ 
  tournament, 
  onTournamentUpdate 
}: TournamentSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description,
    city: tournament.city,
    state: tournament.state || '',
    country: tournament.country,
    start_date: tournament.start_date.split('T')[0], // Extract date part
    end_date: tournament.end_date ? tournament.end_date.split('T')[0] : '',
    max_players: tournament.max_players?.toString() || '',
    registration_open: tournament.registration_open,
    status: tournament.status
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        max_players: formData.max_players ? parseInt(formData.max_players) : null,
        registration_open: formData.registration_open,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tournament');
      }

      setSuccess(true);
      setIsEditing(false);
      onTournamentUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: tournament.name,
      description: tournament.description,
      city: tournament.city,
      state: tournament.state || '',
      country: tournament.country,
      start_date: tournament.start_date.split('T')[0],
      end_date: tournament.end_date ? tournament.end_date.split('T')[0] : '',
      max_players: tournament.max_players?.toString() || '',
      registration_open: tournament.registration_open,
      status: tournament.status
    });
    setIsEditing(false);
    setError(null);
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/tournaments/${tournament.id}/register`;
    navigator.clipboard.writeText(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tournament Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tournament Status
          </CardTitle>
          <CardDescription>
            Manage tournament status and registration settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Current Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Registration</Label>
              <div className="mt-1">
                <Badge variant={tournament.registration_open ? 'default' : 'secondary'}>
                  {tournament.registration_open ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Participants</Label>
              <div className="mt-1">
                <span className="text-sm font-medium">
                  {tournament.current_players}
                  {tournament.max_players && ` / ${tournament.max_players}`}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label>Registration Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/tournaments/${tournament.id}/register`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button size="sm" variant="outline" onClick={copyRegistrationLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`/tournaments/${tournament.id}/register`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tournament Settings
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Settings
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Modify tournament details, dates, and capacity settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Success/Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Tournament settings updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="tournament-id">Tournament ID</Label>
                <Input
                  id="tournament-id"
                  value={tournament.official_tournament_id || tournament.id.substring(0, 8)}
                  disabled
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Location and Dates */}
          <div className="space-y-4">
            <h4 className="font-medium">Location and Dates</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tournament Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Tournament Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-players">Maximum Players</Label>
                <Input
                  id="max-players"
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange('max_players', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Tournament Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="registration-open"
                checked={formData.registration_open}
                onCheckedChange={(checked) => handleInputChange('registration_open', checked)}
                disabled={!isEditing}
              />
              <Label htmlFor="registration-open">Registration Open</Label>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TDF Information */}
      {tournament.tdf_metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              TDF Information
            </CardTitle>
            <CardDescription>
              Information from the original TDF file
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Game Type</Label>
                <p className="mt-1">{tournament.tdf_metadata.gametype || 'N/A'}</p>
              </div>
              
              <div>
                <Label>Mode</Label>
                <p className="mt-1">{tournament.tdf_metadata.mode || 'N/A'}</p>
              </div>
              
              <div>
                <Label>Round Time</Label>
                <p className="mt-1">{tournament.tdf_metadata.roundtime || 'N/A'} minutes</p>
              </div>
              
              <div>
                <Label>Finals Round Time</Label>
                <p className="mt-1">{tournament.tdf_metadata.finalsroundtime || 'N/A'} minutes</p>
              </div>
              
              {tournament.tdf_metadata.organizer && (
                <>
                  <div>
                    <Label>Organizer Name</Label>
                    <p className="mt-1">{tournament.tdf_metadata.organizer.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label>Organizer POP ID</Label>
                    <p className="mt-1 font-mono">{tournament.tdf_metadata.organizer.popid || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}