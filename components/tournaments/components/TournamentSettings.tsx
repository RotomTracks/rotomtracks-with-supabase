'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
  Pencil
} from 'lucide-react';
import { useTypedTranslation } from '@/lib/i18n/hooks/useTypedTranslation';

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
  const { tTournaments } = useTypedTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || '',
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
      description: tournament.description || '',
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
    <div>
      {/* Tournament Settings */}
      <Card className="bg-transparent border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
  {tTournaments('management.settings')}
            </CardTitle>
            
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="text-white dark:text-white">
                <Pencil className="h-4 w-4 mr-2" />
{tTournaments('management.editSettings')}
              </Button>
            )}
          </div>
          
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            {isEditing 
              ? tTournaments('management.settingsDescription')
              : tTournaments('management.settingsDescription')
            }
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

          {/* Registration Link */}
          <div className="space-y-4">
            <h4 className="font-medium">{tTournaments('management.registrationLink')}</h4>
            <div>
              <Label>{tTournaments('management.shareRegistrationLink')}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/tournaments/${tournament.id}/register`}
                  readOnly
                  className="font-mono text-sm bg-white dark:bg-gray-900"
                />
                <Button className="bg-white dark:bg-gray-900" size="sm" variant="outline" onClick={copyRegistrationLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button className="bg-white dark:bg-gray-900" size="sm" variant="outline" asChild>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">{tTournaments('management.basicInformation')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{tTournaments('management.tournamentName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="tournament-id">{tTournaments('management.tournamentId')}</Label>
                <Input
                  id="tournament-id"
                  value={tournament.official_tournament_id || tournament.id.substring(0, 8)}
                  disabled
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">{tTournaments('management.description')}</Label>
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
            <h4 className="font-medium">{tTournaments('management.locationAndDates')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">{tTournaments('management.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="state">{tTournaments('management.stateProvince')}</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Opcional"
                />
              </div>
              
              <div>
                <Label htmlFor="country">{tTournaments('management.country')}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="start-date">{tTournaments('management.startDate')}</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tournament Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">{tTournaments('management.tournamentConfiguration')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-players">{tTournaments('management.maximumPlayers')}</Label>
                <Input
                  id="max-players"
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange('max_players', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ilimitado"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="status">{tTournaments('management.tournamentStatus')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">{tTournaments('management.upcoming')}</SelectItem>
                    <SelectItem value="ongoing">{tTournaments('management.ongoing')}</SelectItem>
                    <SelectItem value="completed">{tTournaments('management.completed')}</SelectItem>
                    <SelectItem value="cancelled">{tTournaments('management.cancelled')}</SelectItem>
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
              <Label htmlFor="registration-open">{tTournaments('management.registrationOpen')}</Label>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
{tTournaments('management.saveChanges')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
{tTournaments('management.cancel')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TDF Information */}
      {tournament.tdf_metadata && (
        <Card className="bg-transparent border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              {tTournaments('management.tdfInformation')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              {tTournaments('management.tdfInformationDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label>{tTournaments('management.gameType')}</Label>
                <p className="mt-1">{tournament.tdf_metadata.gametype || 'N/A'}</p>
              </div>
              
              <div>
                <Label>{tTournaments('management.mode')}</Label>
                <p className="mt-1">{tournament.tdf_metadata.mode || 'N/A'}</p>
              </div>
              
              <div>
                <Label>{tTournaments('management.roundTime')}</Label>
                <p className="mt-1">{tournament.tdf_metadata.roundtime || 'N/A'} {tTournaments('management.minutes')}</p>
              </div>
              
              <div>
                <Label>{tTournaments('management.finalsRoundTime')}</Label>
                <p className="mt-1">{tournament.tdf_metadata.finalsroundtime || 'N/A'} {tTournaments('management.minutes')}</p>
              </div>
              
              {tournament.tdf_metadata.organizer && (
                <>
                  <div>
                    <Label>{tTournaments('management.organizer')}</Label>
                    <p className="mt-1">{tournament.tdf_metadata.organizer.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label>{tTournaments('management.organizerId')}</Label>
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