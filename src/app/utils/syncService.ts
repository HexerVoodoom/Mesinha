// Sync service to manage local storage, Supabase, and Google Drive
import { localDB } from './localDB';
import { googleDriveBackup } from './googleDriveBackup';
import { toast } from 'sonner';

export type SyncMode = 'local-only' | 'local-with-drive' | 'local-drive-supabase';

class SyncService {
  private syncMode: SyncMode = 'local-with-drive';
  private autoBackupInterval: number | null = null;
  private lastBackupTime: number = 0;

  constructor() {
    // Load sync mode from localStorage
    const storedMode = localStorage.getItem('sync_mode') as SyncMode;
    if (storedMode) {
      this.syncMode = storedMode;
    }

    // Load last backup time
    const lastBackup = localStorage.getItem('last_backup_time');
    if (lastBackup) {
      this.lastBackupTime = parseInt(lastBackup, 10);
    }
  }

  getSyncMode(): SyncMode {
    return this.syncMode;
  }

  setSyncMode(mode: SyncMode): void {
    this.syncMode = mode;
    localStorage.setItem('sync_mode', mode);

    // Restart auto-backup with new mode
    if (this.autoBackupInterval) {
      this.stopAutoBackup();
      this.startAutoBackup();
    }
  }

  async saveItem(item: any): Promise<void> {
    try {
      // Always save locally first
      await localDB.saveItem(item);
      console.log('[SyncService] Item saved locally:', item.id);

      // Trigger backup based on mode
      if (this.syncMode !== 'local-only') {
        // Don't wait for backup, do it in background
        this.triggerBackupIfNeeded().catch(err =>
          console.error('[SyncService] Background backup failed:', err)
        );
      }
    } catch (error) {
      console.error('[SyncService] Error saving item:', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await localDB.deleteItem(id);
      console.log('[SyncService] Item deleted locally:', id);

      // Trigger backup
      if (this.syncMode !== 'local-only') {
        this.triggerBackupIfNeeded().catch(err =>
          console.error('[SyncService] Background backup failed:', err)
        );
      }
    } catch (error) {
      console.error('[SyncService] Error deleting item:', error);
      throw error;
    }
  }

  async getItems(category?: string): Promise<any[]> {
    try {
      if (category) {
        return await localDB.getItemsByCategory(category);
      }
      return await localDB.getAllItems();
    } catch (error) {
      console.error('[SyncService] Error getting items:', error);
      return [];
    }
  }

  async getItem(id: string): Promise<any | null> {
    try {
      return await localDB.getItem(id);
    } catch (error) {
      console.error('[SyncService] Error getting item:', error);
      return null;
    }
  }

  async saveSettings(settings: any): Promise<void> {
    try {
      await localDB.saveSettings(settings);
      console.log('[SyncService] Settings saved locally');

      if (this.syncMode !== 'local-only') {
        this.triggerBackupIfNeeded().catch(err =>
          console.error('[SyncService] Background backup failed:', err)
        );
      }
    } catch (error) {
      console.error('[SyncService] Error saving settings:', error);
      throw error;
    }
  }

  async getSettings(): Promise<any> {
    try {
      const settings = await localDB.getSettings();
      return settings || {
        coupleName: "You & Partner",
        themeColor: "#81D8D0",
        notificationsEnabled: true,
      };
    } catch (error) {
      console.error('[SyncService] Error getting settings:', error);
      return {
        coupleName: "You & Partner",
        themeColor: "#81D8D0",
        notificationsEnabled: true,
      };
    }
  }

  private async triggerBackupIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastBackup = now - this.lastBackupTime;

    // Backup every 5 minutes at most
    if (timeSinceLastBackup < 5 * 60 * 1000) {
      console.log('[SyncService] Skipping backup, too soon since last backup');
      return;
    }

    await this.performBackup();
  }

  async performBackup(showToast: boolean = false): Promise<void> {
    try {
      if (showToast) {
        toast.loading('Criando backup...', { id: 'backup' });
      }

      const backupData = await localDB.exportData();

      // Backup to Google Drive
      if (this.syncMode === 'local-with-drive' || this.syncMode === 'local-drive-supabase') {
        try {
          await googleDriveBackup.uploadBackup(backupData);
          console.log('[SyncService] Backup uploaded to Google Drive');
        } catch (error) {
          console.error('[SyncService] Failed to backup to Google Drive:', error);
          if (showToast) {
            toast.error('Erro ao fazer backup no Google Drive', { id: 'backup' });
          }
          throw error;
        }
      }

      this.lastBackupTime = Date.now();
      localStorage.setItem('last_backup_time', this.lastBackupTime.toString());

      if (showToast) {
        toast.success('Backup realizado com sucesso!', { id: 'backup' });
      }
    } catch (error) {
      console.error('[SyncService] Backup failed:', error);
      if (showToast) {
        toast.error('Erro ao criar backup', { id: 'backup' });
      }
      throw error;
    }
  }

  async restoreFromGoogleDrive(): Promise<void> {
    try {
      toast.loading('Restaurando backup do Google Drive...', { id: 'restore' });

      const backupData = await googleDriveBackup.downloadBackup();

      if (!backupData) {
        toast.error('Nenhum backup encontrado no Google Drive', { id: 'restore' });
        return;
      }

      await localDB.importData(backupData);

      toast.success('Backup restaurado com sucesso!', { id: 'restore' });

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[SyncService] Restore failed:', error);
      toast.error('Erro ao restaurar backup', { id: 'restore' });
      throw error;
    }
  }

  startAutoBackup(intervalMinutes: number = 30): void {
    this.stopAutoBackup();

    if (this.syncMode === 'local-only') {
      console.log('[SyncService] Auto-backup disabled for local-only mode');
      return;
    }

    console.log(`[SyncService] Starting auto-backup every ${intervalMinutes} minutes`);

    this.autoBackupInterval = window.setInterval(() => {
      console.log('[SyncService] Running scheduled backup...');
      this.performBackup().catch(err =>
        console.error('[SyncService] Auto-backup failed:', err)
      );
    }, intervalMinutes * 60 * 1000);

    // Also do an initial backup
    this.performBackup().catch(err =>
      console.error('[SyncService] Initial backup failed:', err)
    );
  }

  stopAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('[SyncService] Auto-backup stopped');
    }
  }

  getLastBackupTime(): number {
    return this.lastBackupTime;
  }

  async exportLocalBackup(): Promise<Blob> {
    const backupData = await localDB.exportData();
    const json = JSON.stringify(backupData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  async importLocalBackup(file: File): Promise<void> {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      await localDB.importData(backupData);

      toast.success('Backup importado com sucesso!');

      // Reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[SyncService] Import failed:', error);
      toast.error('Erro ao importar backup');
      throw error;
    }
  }
}

export const syncService = new SyncService();
