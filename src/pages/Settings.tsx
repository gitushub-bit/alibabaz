import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Lock,
    Globe,
    Eye,
    Shield,
    Mail,
    MessageSquare,
    ShoppingCart,
    Package,
    CreditCard,
    Smartphone,
    CheckCircle2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user } = useAuth();
    const { currency, setCurrency, countryCode, setCountryCode } = useCurrency();
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: false,
        newMessages: true,
        priceAlerts: true,
        newsletter: false,
        smsNotifications: false
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: true
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleSaveNotifications = () => {
        // TODO: Save to database
        toast({
            title: 'Settings saved',
            description: 'Your notification preferences have been updated.'
        });
    };

    const handleSavePrivacy = () => {
        // TODO: Save to database
        toast({
            title: 'Privacy settings updated',
            description: 'Your privacy preferences have been saved.'
        });
    };

    const handleEnable2FA = () => {
        // TODO: Implement 2FA setup flow
        setTwoFactorEnabled(!twoFactorEnabled);
        toast({
            title: twoFactorEnabled ? '2FA disabled' : '2FA enabled',
            description: twoFactorEnabled
                ? 'Two-factor authentication has been disabled.'
                : 'Two-factor authentication is now active on your account.'
        });
    };

    if (!user) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
            <Helmet>
                <title>Settings - B2B Marketplace</title>
                <meta name="description" content="Manage your account settings, notifications, privacy, and preferences" />
            </Helmet>

            <Header />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account preferences and settings
                    </p>
                </div>

                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                        <TabsTrigger value="notifications">
                            <Bell className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Privacy</span>
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Lock className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences">
                            <Globe className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Notifications</CardTitle>
                                <CardDescription>
                                    Choose what email notifications you want to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="order-updates">Order Updates</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about order status, shipping, and delivery
                                        </p>
                                    </div>
                                    <Switch
                                        id="order-updates"
                                        checked={notifications.orderUpdates}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, orderUpdates: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="new-messages">New Messages</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Alerts when you receive messages from suppliers
                                        </p>
                                    </div>
                                    <Switch
                                        id="new-messages"
                                        checked={notifications.newMessages}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, newMessages: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="price-alerts">Price Alerts</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Notify me when prices drop on my wishlist items
                                        </p>
                                    </div>
                                    <Switch
                                        id="price-alerts"
                                        checked={notifications.priceAlerts}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, priceAlerts: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="promotions">Promotions & Deals</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Special offers, discounts, and promotional campaigns
                                        </p>
                                    </div>
                                    <Switch
                                        id="promotions"
                                        checked={notifications.promotions}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, promotions: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="newsletter">Newsletter</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Weekly digest of trending products and industry news
                                        </p>
                                    </div>
                                    <Switch
                                        id="newsletter"
                                        checked={notifications.newsletter}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, newsletter: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="sms">SMS Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive important updates via text message
                                        </p>
                                    </div>
                                    <Switch
                                        id="sms"
                                        checked={notifications.smsNotifications}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, smsNotifications: checked })
                                        }
                                    />
                                </div>

                                <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                                    Save Notification Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>
                                    Control who can see your information and contact you
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                                    <Select
                                        value={privacy.profileVisibility}
                                        onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                                    >
                                        <SelectTrigger id="profile-visibility">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public - Anyone can view</SelectItem>
                                            <SelectItem value="verified">Verified Users Only</SelectItem>
                                            <SelectItem value="private">Private - Hidden from search</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Control who can see your profile and business information
                                    </p>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-email">Show Email Address</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display your email on your public profile
                                        </p>
                                    </div>
                                    <Switch
                                        id="show-email"
                                        checked={privacy.showEmail}
                                        onCheckedChange={(checked) =>
                                            setPrivacy({ ...privacy, showEmail: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show-phone">Show Phone Number</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display your phone number on your public profile
                                        </p>
                                    </div>
                                    <Switch
                                        id="show-phone"
                                        checked={privacy.showPhone}
                                        onCheckedChange={(checked) =>
                                            setPrivacy({ ...privacy, showPhone: checked })
                                        }
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow-messages">Allow Direct Messages</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let suppliers and buyers contact you directly
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow-messages"
                                        checked={privacy.allowMessages}
                                        onCheckedChange={(checked) =>
                                            setPrivacy({ ...privacy, allowMessages: checked })
                                        }
                                    />
                                </div>

                                <Button onClick={handleSavePrivacy} className="w-full sm:w-auto">
                                    Save Privacy Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Change your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <Button>Update Password</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Two-Factor Authentication
                                    {twoFactorEnabled && (
                                        <Badge variant="default" className="gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Enabled
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Add an extra layer of security to your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
                                </p>
                                <Button
                                    variant={twoFactorEnabled ? 'destructive' : 'default'}
                                    onClick={handleEnable2FA}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>
                                    Manage devices where you're currently logged in
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Current Device</p>
                                            <p className="text-sm text-muted-foreground">Windows • Chrome • Last active: Now</p>
                                        </div>
                                        <Badge variant="secondary">Active</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Sign Out All Other Sessions
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Language & Region</CardTitle>
                                <CardDescription>
                                    Set your preferred language and regional settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                        <SelectTrigger id="language">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="de">Deutsch</SelectItem>
                                            <SelectItem value="zh">中文</SelectItem>
                                            <SelectItem value="ar">العربية</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={currency.code} onValueChange={(code) => {
                                        const currencies: Record<string, { code: string; symbol: string; name: string }> = {
                                            USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
                                            EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
                                            GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
                                            CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
                                        };
                                        setCurrency(currencies[code as keyof typeof currencies] || currencies.USD);
                                    }}>
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                                            <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Time Zone</Label>
                                    <Select defaultValue="utc">
                                        <SelectTrigger id="timezone">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                                            <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                                            <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                                            <SelectItem value="cet">Central European Time (GMT+1)</SelectItem>
                                            <SelectItem value="cst">China Standard Time (GMT+8)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Display Preferences</CardTitle>
                                <CardDescription>
                                    Customize how information is displayed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date-format">Date Format</Label>
                                    <Select defaultValue="mdy">
                                        <SelectTrigger id="date-format">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="number-format">Number Format</Label>
                                    <Select defaultValue="comma">
                                        <SelectTrigger id="number-format">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="comma">1,234.56</SelectItem>
                                            <SelectItem value="period">1.234,56</SelectItem>
                                            <SelectItem value="space">1 234.56</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNav />
        </div>
    );
}
