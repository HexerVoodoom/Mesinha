import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Palette, Download, Info } from 'lucide-react';
import { api, Settings as SettingsType } from '../utils/api';
import { syncApi } from '../utils/syncApi';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { toast } from 'sonner';

const themeColors = [
  { name: 'Tiffany Blue', value: '#81D8D0' },
  { name: 'Rose', value: '#FFB6C1' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Mint', value: '#98FB98' },
  { name: 'Peach', value: '#FFDAB9' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsType>({
    coupleName: 'Você & Partner',
    themeColor: '#81D8D0',
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Realtime Sync para configurações
  useRealtimeSync({
    onSync: (event) => {
      if (event.type === 'settings_updated') {
        setSettings(event.data);
        toast.info('Configurações atualizadas pelo parceiro! 💕');
      }
    },
    enabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const fetchedSettings = await api.getSettings();
      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: Partial<SettingsType>) => {
    setSaving(true);
    try {
      const updatedSettings = await syncApi.updateSettings({ ...settings, ...updates });
      setSettings(updatedSettings);
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-medium">Configurações</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-6">
          {/* Couple Name Header */}
          <div className="text-center py-6">
            <div className="text-5xl mb-2">💕</div>
            <h2 className="text-2xl font-medium text-foreground">{settings.coupleName}</h2>
            <p className="text-base text-muted-foreground mt-1">Juntos compartilhando tudo</p>
          </div>

          {/* Couple Name */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <label className="text-base font-medium mb-3 block">Nome do Casal</label>
            <input
              type="text"
              value={settings.coupleName}
              onChange={(e) => setSettings({ ...settings, coupleName: e.target.value })}
              onBlur={() => handleSave({ coupleName: settings.coupleName })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: João & Maria"
            />
          </div>

          {/* Theme Color */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-6 h-6" />
              <label className="text-base font-medium">Cor do Tema</label>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleSave({ themeColor: color.value })}
                  className={`aspect-square rounded-xl border-2 transition-all ${
                    settings.themeColor === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <div>
                  <div className="text-base font-medium">Notificações</div>
                  <div className="text-sm text-muted-foreground">Receber lembretes e atualizações</div>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSave({ notificationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-muted peer-checked:bg-primary rounded-full transition-colors cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>

          {/* Backup */}
          <button className="w-full bg-card rounded-xl p-6 border border-border hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6" />
              <div>
                <div className="text-base font-medium">Backup & Exportação</div>
                <div className="text-sm text-muted-foreground">Exportar dados do casal</div>
              </div>
            </div>
          </button>

          {/* App Version */}
          <div className="text-center pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Versão 1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
