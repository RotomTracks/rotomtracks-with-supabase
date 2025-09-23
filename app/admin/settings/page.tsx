"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Users, 
  Bell, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';
import { useTypedTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';

function AdminSettingsContent() {
  const { tAdmin, tUI, tForms, tPages } = useTypedTranslation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'RotomTracks',
    siteDescription: 'Plataforma de gestión de torneos Pokémon',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxTournamentsPerUser: 10,
    autoApproveOrganizers: false,
    enableNotifications: true,
    enableAnalytics: true
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const data = result.data;
            setSettings({
              siteName: data.site_name || 'RotomTracks',
              siteDescription: data.site_description || 'Plataforma de gestión de torneos Pokémon',
              maintenanceMode: data.maintenance_mode || false,
              allowRegistration: data.allow_registration !== false,
              requireEmailVerification: data.require_email_verification !== false,
              maxTournamentsPerUser: data.max_tournaments_per_user || 10,
              autoApproveOrganizers: data.auto_approve_organizers || false,
              enableNotifications: data.enable_notifications !== false,
              enableAnalytics: data.enable_analytics !== false
            });
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const result = await response.json();
      if (result.success) {
        // Settings saved successfully
        // You could add a toast notification here
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // You could add error handling UI here
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      siteName: 'RotomTracks',
      siteDescription: 'Plataforma de gestión de torneos Pokémon',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      maxTournamentsPerUser: 10,
      autoApproveOrganizers: false,
      enableNotifications: true,
      enableAnalytics: true
    });
  };

  if (initialLoading) {
    return (
      <AdminRoute>
        <AdminLayout 
          title={tAdmin('settings.title')} 
          description={tAdmin('settings.description')}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">{tUI('loading')}</p>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout 
        title={tAdmin('settings.title')} 
        description={tAdmin('settings.description')}
      >
        <div className="p-6 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {tAdmin('settings.general.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('settings.general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{tAdmin('settings.general.siteName')}</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    placeholder={tAdmin('settings.general.siteNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">{tAdmin('settings.general.siteDescription')}</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    placeholder={tAdmin('settings.general.siteDescriptionPlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {tAdmin('settings.system.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('settings.system.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">{tAdmin('settings.system.maintenanceMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.system.maintenanceModeDescription')}
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">{tAdmin('settings.system.allowRegistration')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.system.allowRegistrationDescription')}
                  </p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">{tAdmin('settings.system.requireEmailVerification')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.system.requireEmailVerificationDescription')}
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tournament Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {tAdmin('settings.tournaments.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('settings.tournaments.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxTournamentsPerUser">{tAdmin('settings.tournaments.maxTournamentsPerUser')}</Label>
                <Input
                  id="maxTournamentsPerUser"
                  type="number"
                  value={settings.maxTournamentsPerUser}
                  onChange={(e) => setSettings({...settings, maxTournamentsPerUser: parseInt(e.target.value) || 0})}
                  min="1"
                  max="100"
                />
                <p className="text-sm text-muted-foreground">
                  {tAdmin('settings.tournaments.maxTournamentsPerUserDescription')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApproveOrganizers">{tAdmin('settings.tournaments.autoApproveOrganizers')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.tournaments.autoApproveOrganizersDescription')}
                  </p>
                </div>
                <Switch
                  id="autoApproveOrganizers"
                  checked={settings.autoApproveOrganizers}
                  onCheckedChange={(checked) => setSettings({...settings, autoApproveOrganizers: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {tAdmin('settings.notifications.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">{tAdmin('settings.notifications.enableNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.notifications.enableNotificationsDescription')}
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, enableNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAnalytics">{tAdmin('settings.analytics.enableAnalytics')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tAdmin('settings.analytics.enableAnalyticsDescription')}
                  </p>
                </div>
                <Switch
                  id="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => setSettings({...settings, enableAnalytics: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {tAdmin('settings.actions.title')}
              </CardTitle>
              <CardDescription>
                {tAdmin('settings.actions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? tAdmin('settings.actions.saving') : tAdmin('settings.actions.save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {tAdmin('settings.actions.reset')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

export default function AdminSettingsPage() {
  return <AdminSettingsContent />;
}
