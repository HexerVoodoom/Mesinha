import { useState, useEffect } from 'react';
import { syncService, SyncMode } from '../utils/syncService';
import { googleDriveBackup } from '../utils/googleDriveBackup';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';
import {
  Cloud,
  HardDrive,
  Download,
  Upload,
  Settings,
  RefreshCw,
  LogOut,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

export function BackupSettings() {
  const [syncMode, setSyncMode] = useState<SyncMode>(syncService.getSyncMode());
  const [googleClientId, setGoogleClientId] = useState(
    localStorage.getItem('google_client_id') || '305705048348-jbfvtamh0llghkfiuntt9bqlc48vhukc.apps.googleusercontent.com'
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    googleDriveBackup.isAuthenticated()
  );
  const [lastBackupTime, setLastBackupTime] = useState(
    syncService.getLastBackupTime()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(
    !localStorage.getItem('backup_help_dismissed')
  );

  useEffect(() => {
    // Auto-save client ID if not already saved
    if (!localStorage.getItem('google_client_id')) {
      localStorage.setItem('google_client_id', googleClientId);
    }

    const interval = setInterval(() => {
      setLastBackupTime(syncService.getLastBackupTime());
      setIsAuthenticated(googleDriveBackup.isAuthenticated());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveClientId = () => {
    localStorage.setItem('google_client_id', googleClientId);
    toast.success('Google Client ID salvo!');
  };

  const dismissHelp = () => {
    localStorage.setItem('backup_help_dismissed', 'true');
    setShowHelp(false);
  };

  const handleChangeSyncMode = (mode: SyncMode) => {
    setSyncMode(mode);
    syncService.setSyncMode(mode);
    toast.success('Modo de sincronização alterado!');

    // Restart auto-backup
    if (mode !== 'local-only') {
      syncService.startAutoBackup();
    } else {
      syncService.stopAutoBackup();
    }
  };

  const handleAuthenticateGoogle = async () => {
    try {
      await googleDriveBackup.authenticate();
      setIsAuthenticated(true);
      toast.success('Autenticado com Google Drive!');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Erro ao autenticar com Google Drive');
    }
  };

  const handleLogoutGoogle = () => {
    googleDriveBackup.logout();
    setIsAuthenticated(false);
    toast.success('Desconectado do Google Drive');
  };

  const handleManualBackup = async () => {
    setIsSaving(true);
    try {
      await syncService.performBackup(true);
      setLastBackupTime(syncService.getLastBackupTime());
    } catch (error) {
      console.error('Backup error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    try {
      await syncService.restoreFromGoogleDrive();
    } catch (error) {
      console.error('Restore error:', error);
    }
  };

  const handleExportLocal = async () => {
    try {
      const blob = await syncService.exportLocalBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `couple-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar backup');
    }
  };

  const handleImportLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await syncService.importLocalBackup(file);
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const formatLastBackup = () => {
    if (!lastBackupTime) return 'Nunca';

    const diff = Date.now() - lastBackupTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configurações de Backup</h2>
        <p className="text-sm text-gray-600">
          Gerencie como seus dados são salvos e sincronizados
        </p>
      </div>

      {/* Help Card */}
      {showHelp && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-blue-900">
                  ⚠️ Antes de Começar
                </h3>
                <button
                  onClick={dismissHelp}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>1.</strong> Acesse:{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Google Cloud Console
                  </a>
                </p>
                <p>
                  <strong>2.</strong> Edite suas credenciais OAuth 2.0
                </p>
                <p>
                  <strong>3.</strong> Em "URIs de redirecionamento autorizados", adicione esta URI:
                </p>
                <div className="bg-blue-100 p-2 rounded text-xs space-y-1">
                  <code className="block break-all">
                    {window.location.origin}/oauth-callback.html
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/oauth-callback.html`);
                      toast.success('URI copiada!');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    📋 Copiar URI
                  </button>
                </div>
                <p className="text-xs text-blue-600 font-medium">
                  ⚠️ Sem isso, a autenticação não funcionará!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Google Drive Setup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Google Drive</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Google Client ID
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="Cole seu Google Client ID aqui"
                className="flex-1"
              />
              <Button onClick={handleSaveClientId} variant="outline">
                Salvar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenha em{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          {googleClientId && (
            <div>
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Conectado ao Google Drive</span>
                  </div>
                  <Button
                    onClick={handleLogoutGoogle}
                    variant="outline"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button onClick={handleAuthenticateGoogle} className="w-full">
                  <Cloud className="w-4 h-4 mr-2" />
                  Conectar com Google Drive
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sync Mode */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Modo de Sincronização</h3>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleChangeSyncMode('local-only')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              syncMode === 'local-only'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5" />
              <div>
                <div className="font-semibold">Apenas Local</div>
                <div className="text-sm text-gray-600">
                  Dados salvos apenas no navegador
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleChangeSyncMode('local-with-drive')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              syncMode === 'local-with-drive'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5" />
              <div>
                <div className="font-semibold">Local + Google Drive</div>
                <div className="text-sm text-gray-600">
                  Local com backup automático no Google Drive (Recomendado)
                </div>
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Manual Backup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Backup Manual</h3>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Último backup: <span className="font-medium">{formatLastBackup()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleManualBackup}
              disabled={isSaving || syncMode === 'local-only'}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Backup Agora'}
            </Button>

            <Button
              onClick={handleRestoreFromDrive}
              disabled={syncMode === 'local-only' || !isAuthenticated}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Restaurar
            </Button>
          </div>
        </div>
      </Card>

      {/* Local Export/Import */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Backup Local</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleExportLocal} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <div className="w-full">
            <input
              type="file"
              accept=".json"
              onChange={handleImportLocal}
              className="hidden"
              id="backup-import-input"
            />
            <label htmlFor="backup-import-input">
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
