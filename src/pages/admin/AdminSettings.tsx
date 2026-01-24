import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Mail,
  Save,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'AlibabaClone',
    siteDescription: 'B2B E-commerce Marketplace',
    contactEmail: 'support@alibaba-clone.com',
    supportPhone: '+1 (555) 123-4567',
  });

  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '',
    chatId: '',
    enabled: false,
  });

  const [featureFlags, setFeatureFlags] = useState({
    allowNewRegistrations: true,
    requireEmailVerification: false,
    enableRFQSystem: true,
    enableMessaging: true,
    enableReviews: true,
    maintenanceMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    welcomeEmailEnabled: true,
    orderConfirmationEnabled: true,
    rfqNotificationEnabled: true,
    marketingEmailsEnabled: false,
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value');

      if (settings) {
        settings.forEach((setting) => {
          if (setting.key === 'telegram_bot_token') {
            setTelegramSettings(prev => ({ 
              ...prev, 
              botToken: String(setting.value).replace(/"/g, '') 
            }));
          }
          if (setting.key === 'telegram_chat_id') {
            setTelegramSettings(prev => ({ 
              ...prev, 
              chatId: String(setting.value).replace(/"/g, '') 
            }));
          }
          if (setting.key === 'telegram_notifications_enabled') {
            setTelegramSettings(prev => ({ 
              ...prev, 
              enabled: setting.value === true || setting.value === 'true' 
            }));
          }
        });
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save telegram settings
      const telegramSettingsToSave = [
        { key: 'telegram_bot_token', value: telegramSettings.botToken },
        { key: 'telegram_chat_id', value: telegramSettings.chatId },
        { key: 'telegram_notifications_enabled', value: telegramSettings.enabled },
      ];

      for (const setting of telegramSettingsToSave) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ 
            key: setting.key, 
            value: setting.value,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({ title: 'Settings saved successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Error saving settings', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const testTelegramConnection = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({ 
        title: 'Missing settings', 
        description: 'Please enter both Bot Token and Chat ID',
        variant: 'destructive' 
      });
      return;
    }

    setTesting(true);
    setTelegramStatus('idle');

    try {
      // First save the settings
      await handleSave();

      // Then test the connection
      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'message',
          customMessage: '✅ Test message from Admin Dashboard\n\nYour Telegram integration is working correctly!',
        },
      });

      if (error) throw error;

      if (data?.success) {
        setTelegramStatus('success');
        toast({ title: 'Test message sent successfully!' });
      } else {
        setTelegramStatus('error');
        toast({ 
          title: 'Test failed', 
          description: data?.message || 'Could not send message',
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      setTelegramStatus('error');
      toast({ 
        title: 'Test failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure marketplace settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="telegram" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="telegram" className="gap-2">
            <Send className="h-4 w-4" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telegram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Telegram Integration
              </CardTitle>
              <CardDescription>
                Configure Telegram bot to receive order and payment notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <Label>Enable Telegram Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications for orders and payments
                  </p>
                </div>
                <Switch
                  checked={telegramSettings.enabled}
                  onCheckedChange={(checked) => 
                    setTelegramSettings({ ...telegramSettings, enabled: checked })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="Enter your Telegram Bot Token"
                    value={telegramSettings.botToken}
                    onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from @BotFather on Telegram
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chatId">Chat ID</Label>
                  <Input
                    id="chatId"
                    placeholder="Enter your Chat ID or Group ID"
                    value={telegramSettings.chatId}
                    onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from @userinfobot or your group ID
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={testTelegramConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <>Testing...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                {telegramStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Connection successful!</span>
                  </div>
                )}
                
                {telegramStatus === 'error' && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Connection failed</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  How to set up Telegram notifications:
                </h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Open Telegram and search for @BotFather</li>
                  <li>Send /newbot and follow the instructions to create a bot</li>
                  <li>Copy the bot token and paste it above</li>
                  <li>Start a chat with your bot or add it to a group</li>
                  <li>Get your Chat ID from @userinfobot (or group ID for groups)</li>
                  <li>Paste the Chat ID above and test the connection</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>
                Basic information about your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={siteSettings.supportPhone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Control user access and registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable new users to sign up
                  </p>
                </div>
                <Switch
                  checked={featureFlags.allowNewRegistrations}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, allowNewRegistrations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify email before accessing features
                  </p>
                </div>
                <Switch
                  checked={featureFlags.requireEmailVerification}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, requireEmailVerification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Only admins can access the site
                  </p>
                </div>
                <Switch
                  checked={featureFlags.maintenanceMode}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, maintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable marketplace features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>RFQ System</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow buyers to post Request for Quotations
                  </p>
                </div>
                <Switch
                  checked={featureFlags.enableRFQSystem}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, enableRFQSystem: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Messaging System</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow direct messaging between buyers and sellers
                  </p>
                </div>
                <Switch
                  checked={featureFlags.enableMessaging}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, enableMessaging: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reviews & Ratings</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow buyers to leave reviews
                  </p>
                </div>
                <Switch
                  checked={featureFlags.enableReviews}
                  onCheckedChange={(checked) => 
                    setFeatureFlags({ ...featureFlags, enableReviews: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure automated email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Welcome Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send welcome email to new users
                  </p>
                </div>
                <Switch
                  checked={emailSettings.welcomeEmailEnabled}
                  onCheckedChange={(checked) => 
                    setEmailSettings({ ...emailSettings, welcomeEmailEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Send confirmation emails for orders
                  </p>
                </div>
                <Switch
                  checked={emailSettings.orderConfirmationEnabled}
                  onCheckedChange={(checked) => 
                    setEmailSettings({ ...emailSettings, orderConfirmationEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>RFQ Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify sellers about new RFQs
                  </p>
                </div>
                <Switch
                  checked={emailSettings.rfqNotificationEnabled}
                  onCheckedChange={(checked) => 
                    setEmailSettings({ ...emailSettings, rfqNotificationEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send promotional and marketing emails
                  </p>
                </div>
                <Switch
                  checked={emailSettings.marketingEmailsEnabled}
                  onCheckedChange={(checked) => 
                    setEmailSettings({ ...emailSettings, marketingEmailsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
