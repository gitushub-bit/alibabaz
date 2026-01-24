import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  TestTube
} from 'lucide-react';

export default function AdminIntegrations() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  const [telegram, setTelegram] = useState({
    botToken: '',
    chatId: '',
    enabled: false,
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_notifications_enabled']);

    if (settings) {
      const settingsMap: Record<string, unknown> = {};
      settings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      setTelegram({
        botToken: (settingsMap['telegram_bot_token'] as string || '').replace(/"/g, ''),
        chatId: (settingsMap['telegram_chat_id'] as string || '').replace(/"/g, ''),
        enabled: settingsMap['telegram_notifications_enabled'] === true || 
                 settingsMap['telegram_notifications_enabled'] === 'true',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    
    try {
      // Update or insert each setting
      const updates = [
        { key: 'telegram_bot_token', value: JSON.stringify(telegram.botToken) },
        { key: 'telegram_chat_id', value: JSON.stringify(telegram.chatId) },
        { key: 'telegram_notifications_enabled', value: telegram.enabled },
      ];

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
      }

      toast({ title: 'Settings saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegram.botToken || !telegram.chatId) {
      setTestResult({ success: false, message: 'Please enter Bot Token and Chat ID first' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Save first to ensure latest values are used
      await handleSave();

      // Send test notification
      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'order',
          orderId: 'TEST-' + Date.now(),
          productName: 'Test Product',
          quantity: 1,
          amount: 99.99,
          currency: 'USD',
          buyerName: 'Test Buyer',
          buyerEmail: 'test@example.com',
          buyerPhone: '+1234567890',
          sellerName: 'Test Seller',
          sellerCompany: 'Test Company Inc.',
          shippingAddress: '123 Test Street, Test City, TC 12345',
          cardLastFour: '4242',
          cardBrand: 'Visa',
          status: 'Test Notification',
          statusHistory: [
            { status: 'Test Started', timestamp: new Date().toISOString() },
          ],
        },
      });

      if (error) throw error;

      if (data?.success) {
        setTestResult({ success: true, message: 'Test notification sent successfully! Check your Telegram.' });
      } else {
        setTestResult({ success: false, message: data?.message || 'Failed to send test notification' });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Configure external service integrations</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <Tabs defaultValue="telegram" className="space-y-6">
        <TabsList>
          <TabsTrigger value="telegram" className="gap-2">
            <Send className="h-4 w-4" />
            Telegram Bot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telegram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Telegram Bot Configuration
              </CardTitle>
              <CardDescription>
                Configure your Telegram bot to receive real-time notifications for orders and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>How to set up Telegram notifications</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Open Telegram and search for <strong>@BotFather</strong></li>
                    <li>Send <code>/newbot</code> and follow the instructions to create a bot</li>
                    <li>Copy the bot token and paste it below</li>
                    <li>Add your bot to a group or channel, or use your personal chat</li>
                    <li>Get the Chat ID by sending a message and visiting: <br />
                      <code className="text-xs">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code>
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Enable Telegram Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send real-time alerts when orders and payments are made
                  </p>
                </div>
                <Switch
                  checked={telegram.enabled}
                  onCheckedChange={(checked) => setTelegram({ ...telegram, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token</Label>
                <div className="relative">
                  <Input
                    id="botToken"
                    type={showToken ? 'text' : 'password'}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={telegram.botToken}
                    onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The token you received from @BotFather
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chatId">Chat ID</Label>
                <Input
                  id="chatId"
                  placeholder="-1001234567890 or 123456789"
                  value={telegram.chatId}
                  onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Your personal chat ID or group/channel ID (use negative number for groups)
                </p>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{testResult.success ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleTestTelegram}
                  disabled={testing || !telegram.botToken || !telegram.chatId}
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {testing ? 'Sending...' : 'Send Test Notification'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                What notifications will be sent to Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="font-medium">New Order</p>
                    <p className="text-sm text-muted-foreground">
                      Order ID, product, quantity, amount, buyer info, seller info, shipping address
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID, amount, card details (last 4), customer info, status
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-medium">Status Changes</p>
                    <p className="text-sm text-muted-foreground">
                      Complete audit trail with timestamps for all status changes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
