import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Bell,
  ShoppingCart,
  CreditCard,
  Shield,
  Clock,
  Hash,
  Lock,
  Smartphone
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminTelegram() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingDemo, setSendingDemo] = useState(false);

  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '',
    chatId: '',
    enabled: false,
    notifyOrders: true,
    notifyPayments: true,
    notifyRFQs: true,
    notifyMessages: false,
  });

  const [cardSettings, setCardSettings] = useState({
    otpEnabled: true,
    otpLength: 6,
    otpExpirySeconds: 60,
    otpMaxAttempts: 3,
    otpChannel: 'mock_sms',
    requireCardVerification: true,
    allowedCardBrands: ['visa', 'mastercard', 'amex', 'discover'],
    testMode: true,
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value');

      if (settings) {
        settings.forEach((setting) => {
          // Telegram settings
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
          if (setting.key === 'telegram_notify_orders') {
            setTelegramSettings(prev => ({
              ...prev,
              notifyOrders: setting.value !== false && setting.value !== 'false'
            }));
          }
          if (setting.key === 'telegram_notify_payments') {
            setTelegramSettings(prev => ({
              ...prev,
              notifyPayments: setting.value !== false && setting.value !== 'false'
            }));
          }
          if (setting.key === 'telegram_notify_rfqs') {
            setTelegramSettings(prev => ({
              ...prev,
              notifyRFQs: setting.value !== false && setting.value !== 'false'
            }));
          }
          if (setting.key === 'telegram_notify_messages') {
            setTelegramSettings(prev => ({
              ...prev,
              notifyMessages: setting.value === true || setting.value === 'true'
            }));
          }

          // Card/OTP settings
          if (setting.key === 'card_otp_enabled') {
            setCardSettings(prev => ({
              ...prev,
              otpEnabled: setting.value !== false && setting.value !== 'false'
            }));
          }
          if (setting.key === 'card_otp_length') {
            setCardSettings(prev => ({
              ...prev,
              otpLength: Number(setting.value) || 6
            }));
          }
          if (setting.key === 'card_otp_expiry_seconds') {
            setCardSettings(prev => ({
              ...prev,
              otpExpirySeconds: Number(setting.value) || 60
            }));
          }
          if (setting.key === 'card_otp_max_attempts') {
            setCardSettings(prev => ({
              ...prev,
              otpMaxAttempts: Number(setting.value) || 3
            }));
          }
          if (setting.key === 'card_otp_channel') {
            setCardSettings(prev => ({
              ...prev,
              otpChannel: String(setting.value).replace(/"/g, '') || 'mock_sms'
            }));
          }
          if (setting.key === 'card_require_verification') {
            setCardSettings(prev => ({
              ...prev,
              requireCardVerification: setting.value !== false && setting.value !== 'false'
            }));
          }
          if (setting.key === 'payment_test_mode') {
            setCardSettings(prev => ({
              ...prev,
              testMode: setting.value !== false && setting.value !== 'false'
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
      const settingsToSave = [
        // Telegram settings
        { key: 'telegram_bot_token', value: telegramSettings.botToken },
        { key: 'telegram_chat_id', value: telegramSettings.chatId },
        { key: 'telegram_notifications_enabled', value: telegramSettings.enabled },
        { key: 'telegram_notify_orders', value: telegramSettings.notifyOrders },
        { key: 'telegram_notify_payments', value: telegramSettings.notifyPayments },
        { key: 'telegram_notify_rfqs', value: telegramSettings.notifyRFQs },
        { key: 'telegram_notify_messages', value: telegramSettings.notifyMessages },
        // Card/OTP settings
        { key: 'card_otp_enabled', value: cardSettings.otpEnabled },
        { key: 'card_otp_length', value: cardSettings.otpLength },
        { key: 'card_otp_expiry_seconds', value: cardSettings.otpExpirySeconds },
        { key: 'card_otp_max_attempts', value: cardSettings.otpMaxAttempts },
        { key: 'card_otp_channel', value: cardSettings.otpChannel },
        { key: 'card_require_verification', value: cardSettings.requireCardVerification },
        { key: 'payment_test_mode', value: cardSettings.testMode },
      ];

      for (const setting of settingsToSave) {
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
      await handleSave();

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

  const sendDemoPayment = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({
        title: 'Missing Telegram settings',
        description: 'Please configure Bot Token and Chat ID first',
        variant: 'destructive'
      });
      return;
    }

    setSendingDemo(true);

    try {
      await handleSave();

      const demoData = {
        type: 'payment',
        paymentId: `DEMO-${Date.now()}`,
        orderIds: [`ORD-${Date.now()}`],
        orderId: `ORD-${Date.now()}`,
        amount: 299.99,
        currency: 'USD',
        productName: 'Demo Product Bundle (3 items)',
        quantity: 3,
        buyerName: 'John Demo',
        buyerEmail: 'john.demo@example.com',
        buyerPhone: '+1 555-123-4567',
        shippingAddress: '123 Demo Street, Test City, TC 12345, United States',
        cardLastFour: '4242',
        cardBrand: 'Visa',
        cardHolder: 'JOHN DEMO',
        expiryDate: '12/26',
        otpVerified: true,
        otpCode: '123456',
        status: 'confirmed',
        securityLevel: 'HIGH_SECURITY',
        // Include card settings in demo
        otpSettings: {
          enabled: cardSettings.otpEnabled,
          length: cardSettings.otpLength,
          expirySeconds: cardSettings.otpExpirySeconds,
          maxAttempts: cardSettings.otpMaxAttempts,
          channel: cardSettings.otpChannel,
        },
      };

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: demoData,
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: 'Demo payment notification sent!' });
      } else {
        toast({
          title: 'Failed to send demo',
          description: data?.message || 'Could not send notification',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error sending demo',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSendingDemo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="h-8 w-8 text-primary" />
            Telegram & Payment Settings
          </h1>
          <p className="text-muted-foreground">Configure Telegram notifications and card payment security</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bot Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Telegram Bot Configuration
            </CardTitle>
            <CardDescription>
              Enter your Telegram bot credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label>Enable Telegram Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Master switch for all Telegram notifications
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

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
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

              <Button
                variant="secondary"
                onClick={sendDemoPayment}
                disabled={sendingDemo}
              >
                {sendingDemo ? (
                  <>Sending...</>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Send Demo Payment
                  </>
                )}
              </Button>

              {telegramStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Connected!</span>
                </div>
              )}

              {telegramStatus === 'error' && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Failed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Card Payment Security
            </CardTitle>
            <CardDescription>
              Configure OTP verification and card security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label>Sandbox Environment</Label>
                <p className="text-sm text-muted-foreground">
                  Development and testing environment
                </p>
              </div>
              <Switch
                checked={cardSettings.testMode}
                onCheckedChange={(checked) =>
                  setCardSettings({ ...cardSettings, testMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Require OTP Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Verify cards with one-time password
                  </p>
                </div>
              </div>
              <Switch
                checked={cardSettings.otpEnabled}
                onCheckedChange={(checked) =>
                  setCardSettings({ ...cardSettings, otpEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Require Card Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    3D Secure simulation
                  </p>
                </div>
              </div>
              <Switch
                checked={cardSettings.requireCardVerification}
                onCheckedChange={(checked) =>
                  setCardSettings({ ...cardSettings, requireCardVerification: checked })
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label>OTP Channel</Label>
              </div>
              <Select
                value={cardSettings.otpChannel}
                onValueChange={(value) => setCardSettings({ ...cardSettings, otpChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OTP channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock_sms">Mock SMS (Demo)</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* OTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              OTP Configuration
            </CardTitle>
            <CardDescription>
              Fine-tune OTP verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Label>OTP Code Length</Label>
                </div>
                <span className="font-medium">{cardSettings.otpLength} digits</span>
              </div>
              <Slider
                value={[cardSettings.otpLength]}
                onValueChange={([value]) => setCardSettings({ ...cardSettings, otpLength: value })}
                min={4}
                max={8}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Standard: 6 digits. Range: 4-8 digits.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label>OTP Expiry Time</Label>
                </div>
                <span className="font-medium">{cardSettings.otpExpirySeconds} seconds</span>
              </div>
              <Slider
                value={[cardSettings.otpExpirySeconds]}
                onValueChange={([value]) => setCardSettings({ ...cardSettings, otpExpirySeconds: value })}
                min={30}
                max={300}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                How long the OTP code remains valid. Range: 30-300 seconds.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <Label>Max Verification Attempts</Label>
                </div>
                <span className="font-medium">{cardSettings.otpMaxAttempts} attempts</span>
              </div>
              <Slider
                value={[cardSettings.otpMaxAttempts]}
                onValueChange={([value]) => setCardSettings({ ...cardSettings, otpMaxAttempts: value })}
                min={1}
                max={5}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Number of wrong attempts before blocking checkout. Range: 1-5.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Choose which events trigger Telegram notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New orders and status updates
                  </p>
                </div>
              </div>
              <Switch
                checked={telegramSettings.notifyOrders}
                onCheckedChange={(checked) =>
                  setTelegramSettings({ ...telegramSettings, notifyOrders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Successful and failed payments
                  </p>
                </div>
              </div>
              <Switch
                checked={telegramSettings.notifyPayments}
                onCheckedChange={(checked) =>
                  setTelegramSettings({ ...telegramSettings, notifyPayments: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>RFQ Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New requests for quotation
                  </p>
                </div>
              </div>
              <Switch
                checked={telegramSettings.notifyRFQs}
                onCheckedChange={(checked) =>
                  setTelegramSettings({ ...telegramSettings, notifyRFQs: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    New buyer/seller messages
                  </p>
                </div>
              </div>
              <Switch
                checked={telegramSettings.notifyMessages}
                onCheckedChange={(checked) =>
                  setTelegramSettings({ ...telegramSettings, notifyMessages: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Telegram Bot Setup:
            </h4>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
              <li>Open Telegram and search for <strong>@BotFather</strong></li>
              <li>Send <code>/newbot</code> and follow the instructions</li>
              <li>Copy the bot token and paste it above</li>
              <li>Start a chat with your bot or add it to a group</li>
              <li>Get your Chat ID from <strong>@userinfobot</strong></li>
              <li>Click "Test Connection" to verify</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Card Payment Flow:
            </h4>
            <ol className="text-sm text-green-700 dark:text-green-300 space-y-2 list-decimal list-inside">
              <li>User enters card details at checkout</li>
              <li>OTP is sent via configured channel</li>
              <li>User enters OTP code within time limit</li>
              <li>Payment confirmation sent to Telegram</li>
              <li>Order is created and tracked</li>
              <li>Click "Test Connection" to verify integration</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
