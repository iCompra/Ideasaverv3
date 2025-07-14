'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Cloud, 
  Trash2, 
  CreditCard, 
  User, 
  Shield, 
  Bell,
  Download,
  Upload,
  LogOut,
  Crown
} from 'lucide-react';

/**
 * Settings page - Manage user preferences and account settings
 * Protected route requiring authentication
 */
export default function SettingsPage() {
  const { user, profile, isLoading, updateCredits, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Local state for settings
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [autoCloudSync, setAutoCloudSync] = useState(false);
  const [deletionPolicy, setDeletionPolicy] = useState('never');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local state from profile once loaded
  useEffect(() => {
    if (profile) {
      setCloudSyncEnabled(profile.cloud_sync_enabled || false);
      setAutoCloudSync(profile.auto_cloud_sync || false);
      setDeletionPolicy(profile.deletion_policy_days === 0 ? 'never' : String(profile.deletion_policy_days));
    }
  }, [profile]);

  // Defensive loading and authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('SettingsPage: Not authenticated, redirecting to /login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-primary-bg text-dark-text-light">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-dark-text-muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Handle Save Changes
  const handleSaveChanges = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      console.log("Saving settings:", { cloudSyncEnabled, autoCloudSync, deletionPolicy });
      
      const { error } = await getSupabaseBrowserClient()
        .from('profiles')
        .update({
          cloud_sync_enabled: cloudSyncEnabled,
          auto_cloud_sync: autoCloudSync,
          deletion_policy_days: deletionPolicy === 'never' ? 0 : parseInt(deletionPolicy),
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error saving settings:", error);
        toast({ 
          title: "Error", 
          description: error.message || "Failed to save settings.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Settings Saved!", 
          description: "Your preferences have been updated successfully." 
        });
      }
    } catch (error: any) {
      console.error("Unexpected error saving settings:", error);
      toast({ 
        title: "Error", 
        description: error.message || "An unexpected error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isProUser = profile.has_purchased_app || profile.current_plan === 'full_app_purchase';

  return (
    <div className="min-h-screen bg-dark-primary-bg text-dark-text-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Settings</h1>
          <p className="text-dark-text-muted text-lg">
            Manage your account, preferences, and data synchronization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Information Card */}
            <Card className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-dark-text-light flex items-center">
                  <User className="w-5 h-5 mr-2" /> 
                  Account Information
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Your account details and current plan status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-dark-text-muted text-sm">Email Address</Label>
                    <p className="text-dark-text-light font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-dark-text-muted text-sm">Current Plan</Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-dark-text-light font-medium capitalize">{profile.current_plan}</p>
                      {isProUser && <Badge className="bg-accent-purple text-white"><Crown className="w-3 h-3 mr-1" />Pro</Badge>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-dark-text-muted text-sm">Credits Remaining</Label>
                    <p className="text-dark-text-light font-medium text-lg">{profile.credits.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-dark-text-muted text-sm">Member Since</Label>
                    <p className="text-dark-text-light font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  className="btn-gradient"
                  onClick={() => router.push('/pricing')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Plan & Credits
                </Button>
              </CardContent>
            </Card>

            {/* Data & Sync Settings */}
            <Card className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-dark-text-light flex items-center">
                  <Cloud className="w-5 h-5 mr-2" /> 
                  Data & Sync
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Control how your data is stored and synchronized across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Cloud Sync Toggle */}
                <div className="flex items-center justify-between p-4 bg-dark-tertiary-bg rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="cloud-sync" className="text-dark-text-light font-medium">
                      Enable Cloud Sync
                    </Label>
                    <p className="text-sm text-dark-text-muted mt-1">
                      Securely backup your notes to the cloud
                    </p>
                  </div>
                  <Switch 
                    id="cloud-sync" 
                    checked={cloudSyncEnabled} 
                    onCheckedChange={setCloudSyncEnabled}
                    disabled={!isProUser}
                    className="data-[state=checked]:bg-accent-purple"
                  />
                </div>
                {!isProUser && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Cloud Sync is a Pro feature. Upgrade to enable cross-device synchronization.
                    </p>
                  </div>
                )}

                {/* Auto Cloud Sync */}
                {cloudSyncEnabled && isProUser && (
                  <div className="flex items-center justify-between p-4 bg-dark-tertiary-bg rounded-lg ml-4">
                    <div className="flex-1">
                      <Label htmlFor="auto-cloud-sync" className="text-dark-text-light font-medium">
                        Automatic Sync
                      </Label>
                      <p className="text-sm text-dark-text-muted mt-1">
                        Automatically sync new notes as soon as they're created
                      </p>
                    </div>
                    <Switch 
                      id="auto-cloud-sync" 
                      checked={autoCloudSync} 
                      onCheckedChange={setAutoCloudSync}
                      className="data-[state=checked]:bg-accent-purple"
                    />
                  </div>
                )}

                {/* Data Retention Policy */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-dark-text-light font-medium flex items-center">
                      <Trash2 className="w-4 h-4 mr-2" /> 
                      Data Retention
                    </Label>
                    <p className="text-sm text-dark-text-muted mt-1">
                      Automatically delete notes after a specified period
                    </p>
                  </div>
                  <RadioGroup 
                    value={deletionPolicy} 
                    onValueChange={setDeletionPolicy} 
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 bg-dark-tertiary-bg rounded-lg">
                      <RadioGroupItem value="never" id="r1" className="border-dark-border-subtle" />
                      <Label htmlFor="r1" className="text-dark-text-light">Never delete automatically</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-dark-tertiary-bg rounded-lg">
                      <RadioGroupItem value="7" id="r2" className="border-dark-border-subtle" />
                      <Label htmlFor="r2" className="text-dark-text-light">Delete after 7 days</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-dark-tertiary-bg rounded-lg">
                      <RadioGroupItem value="30" id="r3" className="border-dark-border-subtle" />
                      <Label htmlFor="r3" className="text-dark-text-light">Delete after 30 days</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-dark-tertiary-bg rounded-lg">
                      <RadioGroupItem value="90" id="r4" className="border-dark-border-subtle" />
                      <Label htmlFor="r4" className="text-dark-text-light">Delete after 90 days</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Local Data Management */}
                <div className="space-y-3">
                  <Label className="text-dark-text-light font-medium">Local Data Management</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline"
                      className="bg-dark-tertiary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-secondary-bg flex-1"
                      onClick={() => toast({ title: "Coming Soon!", description: "Export functionality is under development." })}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-dark-tertiary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-secondary-bg flex-1"
                      onClick={() => toast({ title: "Coming Soon!", description: "Import functionality is under development." })}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-dark-text-light flex items-center">
                  <Shield className="w-5 h-5 mr-2" /> 
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Control your privacy settings and data usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-tertiary-bg rounded-lg">
                  <div className="flex-1">
                    <Label className="text-dark-text-light font-medium">Anonymous Usage Analytics</Label>
                    <p className="text-sm text-dark-text-muted mt-1">
                      Help improve Idea Saver by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch 
                    defaultChecked={true}
                    className="data-[state=checked]:bg-accent-purple"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-tertiary-bg rounded-lg">
                  <div className="flex-1">
                    <Label className="text-dark-text-light font-medium">Marketing Communications</Label>
                    <p className="text-sm text-dark-text-muted mt-1">
                      Receive emails about new features and updates
                    </p>
                  </div>
                  <Switch 
                    defaultChecked={false}
                    className="data-[state=checked]:bg-accent-purple"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Danger Zone */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-dark-text-light text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full justify-start bg-dark-tertiary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-secondary-bg"
                  onClick={() => router.push('/history')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  View Notes History
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start bg-dark-tertiary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-secondary-bg"
                  onClick={() => router.push('/record')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Record New Note
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start bg-dark-tertiary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-secondary-bg"
                  onClick={() => toast({ title: "Coming Soon!", description: "Keyboard shortcuts guide is under development." })}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Keyboard Shortcuts
                </Button>
              </CardContent>
            </Card>

            {/* Save Changes Button */}
            <Button 
              className="w-full btn-gradient"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            {/* Danger Zone */}
            <Card className="bg-dark-secondary-bg border-red-500/50 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center text-lg">
                  <Trash2 className="w-5 h-5 mr-2" /> 
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Actions that cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => toast({ 
                    title: "Confirmation Required", 
                    description: "Account deletion requires email verification. Feature coming soon!",
                    variant: "destructive" 
                  })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}