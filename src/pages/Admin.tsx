import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock, Palette, MessageSquare, Hash, Settings, ArrowLeft, LogOut, Shield, Upload, X, Image, Clock, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BotSettings {
  embedColors: {
    pending: string;
    accepted: string;
    declined: string;
  };
  messages: {
    applicationTitle: string;
    acceptedTitle: string;
    declinedTitle: string;
    acceptedMessage: string;
    declinedMessage: string;
    acceptedImageUrl: string;
    declinedImageUrl: string;
    footerText: string;
    showTimestamp: boolean;
  };
  channels: {
    webhookUrl: string;
    botToken: string;
    resultsChannelId: string;
  };
}

const defaultSettings: BotSettings = {
  embedColors: {
    pending: '#D4AF37',
    accepted: '#00FF00',
    declined: '#FF0000',
  },
  messages: {
    applicationTitle: '📜 New Whitelist Application',
    acceptedTitle: '✅ Application Accepted',
    declinedTitle: '❌ Application Declined',
    acceptedMessage: 'Welcome to the server! Your whitelist application has been approved.',
    declinedMessage: 'Unfortunately, your whitelist application was not approved at this time.',
    acceptedImageUrl: '',
    declinedImageUrl: '',
    footerText: 'Redemption RP • Whitelist System',
    showTimestamp: true,
  },
  channels: {
    webhookUrl: '',
    botToken: '',
    resultsChannelId: '',
  },
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const [settings, setSettings] = useState<BotSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAccepted, setUploadingAccepted] = useState(false);
  const [uploadingDeclined, setUploadingDeclined] = useState(false);
  const acceptedFileRef = useRef<HTMLInputElement>(null);
  const declinedFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (session?.access_token && isAdmin) {
      loadSettings();
    }
  }, [session, isAdmin]);

  const loadSettings = async () => {
    try {
      // Load settings from database
      const { data: dbSettings, error } = await supabase
        .from('bot_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Failed to load settings:', error);
        return;
      }

      if (dbSettings && dbSettings.length > 0) {
        const settingsMap: Record<string, string> = {};
        dbSettings.forEach(s => {
          settingsMap[s.setting_key] = s.setting_value || '';
        });

        setSettings(prev => ({
          embedColors: {
            pending: settingsMap['embed_color_pending'] || prev.embedColors.pending,
            accepted: settingsMap['embed_color_accepted'] || prev.embedColors.accepted,
            declined: settingsMap['embed_color_declined'] || prev.embedColors.declined,
          },
          messages: {
            applicationTitle: settingsMap['msg_application_title'] || prev.messages.applicationTitle,
            acceptedTitle: settingsMap['msg_accepted_title'] || prev.messages.acceptedTitle,
            declinedTitle: settingsMap['msg_declined_title'] || prev.messages.declinedTitle,
            acceptedMessage: settingsMap['msg_accepted_text'] || prev.messages.acceptedMessage,
            declinedMessage: settingsMap['msg_declined_text'] || prev.messages.declinedMessage,
            acceptedImageUrl: settingsMap['msg_accepted_image'] || prev.messages.acceptedImageUrl,
            declinedImageUrl: settingsMap['msg_declined_image'] || prev.messages.declinedImageUrl,
            footerText: settingsMap['msg_footer_text'] || prev.messages.footerText,
            showTimestamp: settingsMap['msg_show_timestamp'] === 'false' ? false : true,
          },
          channels: {
            webhookUrl: settingsMap['discord_webhook_url'] ? '••••••••' : prev.channels.webhookUrl,
            botToken: settingsMap['discord_bot_token'] ? '••••••••' : prev.channels.botToken,
            resultsChannelId: settingsMap['discord_results_channel_id'] || prev.channels.resultsChannelId,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSave = async () => {
    if (!session?.access_token) return;

    setIsSaving(true);
    try {
      // Save settings to database using upsert
      const settingsToSave = [
        { setting_key: 'embed_color_pending', setting_value: settings.embedColors.pending },
        { setting_key: 'embed_color_accepted', setting_value: settings.embedColors.accepted },
        { setting_key: 'embed_color_declined', setting_value: settings.embedColors.declined },
        { setting_key: 'msg_application_title', setting_value: settings.messages.applicationTitle },
        { setting_key: 'msg_accepted_title', setting_value: settings.messages.acceptedTitle },
        { setting_key: 'msg_declined_title', setting_value: settings.messages.declinedTitle },
        { setting_key: 'msg_accepted_text', setting_value: settings.messages.acceptedMessage },
        { setting_key: 'msg_declined_text', setting_value: settings.messages.declinedMessage },
        { setting_key: 'msg_accepted_image', setting_value: settings.messages.acceptedImageUrl },
        { setting_key: 'msg_declined_image', setting_value: settings.messages.declinedImageUrl },
        { setting_key: 'msg_footer_text', setting_value: settings.messages.footerText },
        { setting_key: 'msg_show_timestamp', setting_value: String(settings.messages.showTimestamp) },
        { setting_key: 'discord_results_channel_id', setting_value: settings.channels.resultsChannelId },
      ];

      // Only save webhook URL and Bot Token if they are not the masked value
      if (settings.channels.webhookUrl && settings.channels.webhookUrl !== '••••••••') {
        settingsToSave.push({ setting_key: 'discord_webhook_url', setting_value: settings.channels.webhookUrl });
      }
      if (settings.channels.botToken && settings.channels.botToken !== '••••••••') {
        settingsToSave.push({ setting_key: 'discord_bot_token', setting_value: settings.channels.botToken });
      }

      for (const s of settingsToSave) {
        const { error } = await supabase
          .from('bot_settings')
          .upsert(
            {
              setting_key: s.setting_key,
              setting_value: s.setting_value,
              updated_by: user?.id,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'setting_key' }
          );

        if (error) {
          console.error('Error saving setting:', s.setting_key, error);
          throw error;
        }
      }

      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'accepted' | 'declined') => {
    const setUploading = type === 'accepted' ? setUploadingAccepted : setUploadingDeclined;
    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('bot-images')
        .upload(fileName, file, { upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('bot-images')
        .getPublicUrl(data.path);

      // Update settings
      if (type === 'accepted') {
        setSettings(prev => ({
          ...prev,
          messages: { ...prev.messages, acceptedImageUrl: urlData.publicUrl }
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          messages: { ...prev.messages, declinedImageUrl: urlData.publicUrl }
        }));
      }

      toast.success(`${type === 'accepted' ? 'Accepted' : 'Declined'} image uploaded!`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'accepted' | 'declined') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      handleImageUpload(file, type);
    }
  };

  const removeImage = (type: 'accepted' | 'declined') => {
    if (type === 'accepted') {
      setSettings(prev => ({
        ...prev,
        messages: { ...prev.messages, acceptedImageUrl: '' }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        messages: { ...prev.messages, declinedImageUrl: '' }
      }));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const updateColor = (key: keyof BotSettings['embedColors'], value: string) => {
    setSettings(prev => ({
      ...prev,
      embedColors: { ...prev.embedColors, [key]: value },
    }));
  };

  const updateMessage = (key: keyof BotSettings['messages'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      messages: { ...prev.messages, [key]: value },
    }));
  };

  const updateChannel = (key: keyof BotSettings['channels'], value: string) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [key]: value },
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-western">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="western-heading text-2xl text-gradient-gold">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Logged in as: {user.email}
            </p>
            <div className="flex gap-2">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="ghost" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="western-heading text-xl text-gradient-gold">Bot Customization</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="btn-gold">
              <Settings className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-muted/50">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span className="hidden sm:inline">Channels</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <Card className="card-western">
              <CardHeader>
                <CardTitle className="western-heading flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Embed Colors
                </CardTitle>
                <CardDescription>
                  Customize the colors used in Discord embed messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Pending Application</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded border border-border"
                        style={{ backgroundColor: settings.embedColors.pending }}
                      />
                      <Input
                        type="text"
                        value={settings.embedColors.pending}
                        onChange={(e) => updateColor('pending', e.target.value)}
                        placeholder="#D4AF37"
                        className="input-western flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Gold - awaiting review</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Accepted</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded border border-border"
                        style={{ backgroundColor: settings.embedColors.accepted }}
                      />
                      <Input
                        type="text"
                        value={settings.embedColors.accepted}
                        onChange={(e) => updateColor('accepted', e.target.value)}
                        placeholder="#00FF00"
                        className="input-western flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Green - approved</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Declined</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded border border-border"
                        style={{ backgroundColor: settings.embedColors.declined }}
                      />
                      <Input
                        type="text"
                        value={settings.embedColors.declined}
                        onChange={(e) => updateColor('declined', e.target.value)}
                        placeholder="#FF0000"
                        className="input-western flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Red - rejected</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-3">Preview</h4>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.embedColors.pending }}
                    >
                      ⏳ Pending Review
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.embedColors.accepted }}
                    >
                      ✅ Accepted
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.embedColors.declined }}
                    >
                      ❌ Declined
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="card-western">
              <CardHeader>
                <CardTitle className="western-heading flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  Message Templates
                </CardTitle>
                <CardDescription>
                  Customize the text and images shown in Discord messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Settings Column */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Application Embed Title</Label>
                        <Input
                          value={settings.messages.applicationTitle}
                          onChange={(e) => updateMessage('applicationTitle', e.target.value)}
                          placeholder="📜 New Whitelist Application"
                          className="input-western"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Accepted Title</Label>
                          <Input
                            value={settings.messages.acceptedTitle}
                            onChange={(e) => updateMessage('acceptedTitle', e.target.value)}
                            placeholder="✅ Application Accepted"
                            className="input-western"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Declined Title</Label>
                          <Input
                            value={settings.messages.declinedTitle}
                            onChange={(e) => updateMessage('declinedTitle', e.target.value)}
                            placeholder="❌ Application Declined"
                            className="input-western"
                          />
                        </div>
                      </div>

                      {/* Footer & Timestamp Settings */}
                      <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Footer Text
                          </Label>
                          <Input
                            value={settings.messages.footerText}
                            onChange={(e) => updateMessage('footerText', e.target.value)}
                            placeholder="Redemption RP • Whitelist System"
                            className="input-western"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Show Timestamp
                          </Label>
                          <Switch
                            checked={settings.messages.showTimestamp}
                            onCheckedChange={(checked) => updateMessage('showTimestamp', checked)}
                          />
                        </div>
                      </div>

                      {/* Accepted Message with Image */}
                      <div className="space-y-3 p-4 border border-border rounded-lg bg-card/50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <Label className="text-base font-semibold">Accepted Message</Label>
                        </div>
                        <Textarea
                          value={settings.messages.acceptedMessage}
                          onChange={(e) => updateMessage('acceptedMessage', e.target.value)}
                          placeholder="Welcome to the server!"
                          className="input-western min-h-[80px]"
                        />
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Accepted Image
                          </Label>
                          {settings.messages.acceptedImageUrl ? (
                            <div className="relative inline-block">
                              <img
                                src={settings.messages.acceptedImageUrl}
                                alt="Accepted"
                                className="max-w-xs rounded-lg border border-border"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-6 h-6"
                                onClick={() => removeImage('accepted')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                ref={acceptedFileRef}
                                onChange={(e) => handleFileChange(e, 'accepted')}
                                accept="image/*"
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                onClick={() => acceptedFileRef.current?.click()}
                                disabled={uploadingAccepted}
                                className="border-dashed"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingAccepted ? 'Uploading...' : 'Upload Accepted Image'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Declined Message with Image */}
                      <div className="space-y-3 p-4 border border-border rounded-lg bg-card/50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <Label className="text-base font-semibold">Declined Message</Label>
                        </div>
                        <Textarea
                          value={settings.messages.declinedMessage}
                          onChange={(e) => updateMessage('declinedMessage', e.target.value)}
                          placeholder="Unfortunately, your application was not approved."
                          className="input-western min-h-[80px]"
                        />
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Declined Image
                          </Label>
                          {settings.messages.declinedImageUrl ? (
                            <div className="relative inline-block">
                              <img
                                src={settings.messages.declinedImageUrl}
                                alt="Declined"
                                className="max-w-xs rounded-lg border border-border"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-6 h-6"
                                onClick={() => removeImage('declined')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                ref={declinedFileRef}
                                onChange={(e) => handleFileChange(e, 'declined')}
                                accept="image/*"
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                onClick={() => declinedFileRef.current?.click()}
                                disabled={uploadingDeclined}
                                className="border-dashed"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingDeclined ? 'Uploading...' : 'Upload Declined Image'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Column */}
                  <div className="space-y-6">
                    <div className="sticky top-24">
                      <Label className="text-lg font-semibold mb-4 block">Live Preview</Label>

                      {/* Accepted Preview */}
                      <div className="mb-6">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Accepted State</p>
                        <div className="bg-[#36393f] rounded-lg p-4 font-sans border-l-[4px]" style={{ borderLeftColor: settings.embedColors.accepted }}>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-white font-semibold">Redemption Bot</span>
                                <span className="text-[#a1a1aa] text-xs uppercase bg-[#5865f2] px-1 rounded-[3px] h-[15px] flex items-center">BOT</span>
                                <span className="text-[#a3a6aa] text-xs ml-1">Today at 12:00 PM</span>
                              </div>
                              <div className="mt-2">
                                <h3 className="text-white font-semibold mb-2">{settings.messages.acceptedTitle}</h3>
                                <p className="text-[#dcddde] whitespace-pre-wrap text-sm mb-4">{settings.messages.acceptedMessage}</p>

                                {settings.messages.acceptedImageUrl && (
                                  <div className="rounded-lg overflow-hidden mt-3 max-w-sm">
                                    <img src={settings.messages.acceptedImageUrl} alt="Accepted" className="w-full h-auto object-cover" />
                                  </div>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-[#b9bbbe] text-xs">
                                  <span>{settings.messages.footerText}</span>
                                  {settings.messages.showTimestamp && (
                                    <>
                                      <span>•</span>
                                      <span>Today at 12:00 PM</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Declined Preview */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Declined State</p>
                        <div className="bg-[#36393f] rounded-lg p-4 font-sans border-l-[4px]" style={{ borderLeftColor: settings.embedColors.declined }}>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-white font-semibold">Redemption Bot</span>
                                <span className="text-[#a1a1aa] text-xs uppercase bg-[#5865f2] px-1 rounded-[3px] h-[15px] flex items-center">BOT</span>
                                <span className="text-[#a3a6aa] text-xs ml-1">Today at 12:00 PM</span>
                              </div>
                              <div className="mt-2">
                                <h3 className="text-white font-semibold mb-2">{settings.messages.declinedTitle}</h3>
                                <p className="text-[#dcddde] whitespace-pre-wrap text-sm mb-4">{settings.messages.declinedMessage}</p>

                                {settings.messages.declinedImageUrl && (
                                  <div className="rounded-lg overflow-hidden mt-3 max-w-sm">
                                    <img src={settings.messages.declinedImageUrl} alt="Declined" className="w-full h-auto object-cover" />
                                  </div>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-[#b9bbbe] text-xs">
                                  <span>{settings.messages.footerText}</span>
                                  {settings.messages.showTimestamp && (
                                    <>
                                      <span>•</span>
                                      <span>Today at 12:00 PM</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card className="card-western">
              <CardHeader>
                <CardTitle className="western-heading flex items-center gap-2">
                  <Hash className="w-5 h-5 text-accent" />
                  Channel Configuration
                </CardTitle>
                <CardDescription>
                  Set up Discord channels for applications and results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Discord Webhook URL</Label>
                    <Input
                      type="password"
                      value={settings.channels.webhookUrl}
                      onChange={(e) => updateChannel('webhookUrl', e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="input-western font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a webhook in your Discord channel settings → Integrations → Webhooks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Discord Bot Token</Label>
                    <Input
                      type="password"
                      value={settings.channels.botToken}
                      onChange={(e) => updateChannel('botToken', e.target.value)}
                      placeholder="MTE..."
                      className="input-western font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from the Discord Developer Portal → Bot → Token
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Results Channel ID</Label>
                    <Input
                      value={settings.channels.resultsChannelId}
                      onChange={(e) => updateChannel('resultsChannelId', e.target.value)}
                      placeholder="123456789012345678"
                      className="input-western font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Right-click the channel → Copy Channel ID (enable Developer Mode in Discord settings)
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">How to get these values:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open Discord and go to your server</li>
                    <li>Go to Server Settings → Integrations → Webhooks</li>
                    <li>Create a new webhook and copy the URL</li>
                    <li>Enable Developer Mode in User Settings → App Settings → Advanced</li>
                    <li>Right-click your results channel and copy the ID</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}