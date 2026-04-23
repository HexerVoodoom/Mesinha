// Google Drive backup service
const BACKUP_FOLDER_ID = '1ss1CKK_eN-rTV54Y5fYl5oh9MPlU46sM';
const BACKUP_FILE_NAME = 'couple-app-backup.json';

interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class GoogleDriveBackup {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async authenticate(): Promise<void> {
    // Use Google OAuth2 with implicit flow for web apps
    const clientId = localStorage.getItem('google_client_id');

    if (!clientId) {
      console.warn('Google Client ID not configured. Please set it in settings.');
      return;
    }

    // Check if we have a valid token
    const storedToken = localStorage.getItem('google_access_token');
    const storedExpiry = localStorage.getItem('google_token_expiry');

    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime - 60000) { // 1 minute buffer
        this.accessToken = storedToken;
        this.tokenExpiry = expiryTime;
        return;
      }
    }

    // Need to authenticate - open OAuth popup
    await this.openOAuthPopup(clientId);
  }

  private async openOAuthPopup(clientId: string): Promise<void> {
    const redirectUri = `${window.location.origin}/oauth-callback.html`;
    const scope = 'https://www.googleapis.com/auth/drive.file';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}`;

    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      console.log('[GoogleDriveBackup] Opening OAuth popup:', authUrl);

      const popup = window.open(
        authUrl,
        'Google Drive Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error('Failed to open popup. Please allow popups for this site.'));
        return;
      }

      let hasResolved = false;

      // Listen for OAuth callback
      const messageListener = (event: MessageEvent) => {
        console.log('[GoogleDriveBackup] Received message:', event.data);

        if (event.data.type === 'google-oauth-token') {
          const { access_token, expires_in } = event.data;

          console.log('[GoogleDriveBackup] Token received via postMessage');

          this.accessToken = access_token;
          this.tokenExpiry = Date.now() + (expires_in * 1000);

          localStorage.setItem('google_access_token', access_token);
          localStorage.setItem('google_token_expiry', this.tokenExpiry.toString());

          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          clearInterval(checkLocalStorage);

          try {
            popup?.close();
          } catch (e) {
            console.log('[GoogleDriveBackup] Could not close popup');
          }

          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        }
      };

      window.addEventListener('message', messageListener);

      // Fallback: Check localStorage for token (in case postMessage fails)
      const checkLocalStorage = setInterval(() => {
        const token = localStorage.getItem('google_access_token');
        const expiry = localStorage.getItem('google_token_expiry');

        if (token && expiry && !hasResolved) {
          console.log('[GoogleDriveBackup] Token found in localStorage (fallback)');

          this.accessToken = token;
          this.tokenExpiry = parseInt(expiry, 10);

          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          clearInterval(checkLocalStorage);

          try {
            popup?.close();
          } catch (e) {
            console.log('[GoogleDriveBackup] Could not close popup');
          }

          hasResolved = true;
          resolve();
        }
      }, 500);

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          console.log('[GoogleDriveBackup] Popup closed');
          clearInterval(checkClosed);
          clearInterval(checkLocalStorage);
          window.removeEventListener('message', messageListener);

          if (!hasResolved) {
            // Check one last time for token in localStorage
            const token = localStorage.getItem('google_access_token');
            const expiry = localStorage.getItem('google_token_expiry');

            if (token && expiry) {
              console.log('[GoogleDriveBackup] Token found in localStorage after popup closed');
              this.accessToken = token;
              this.tokenExpiry = parseInt(expiry, 10);
              hasResolved = true;
              resolve();
            } else {
              reject(new Error('Authentication cancelled'));
            }
          }
        }
      }, 1000);
    });
  }

  async findBackupFile(): Promise<string | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        `q=name='${BACKUP_FILE_NAME}' and '${BACKUP_FOLDER_ID}' in parents and trashed=false` +
        `&fields=files(id,name,modifiedTime)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search files: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error finding backup file:', error);
      throw error;
    }
  }

  async uploadBackup(backupData: any): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const existingFileId = await this.findBackupFile();

      const metadata = {
        name: BACKUP_FILE_NAME,
        mimeType: 'application/json',
        parents: existingFileId ? undefined : [BACKUP_FOLDER_ID],
      };

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(backupData) +
        closeDelim;

      const url = existingFileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
        : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

      const method = existingFileId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload backup: ${response.statusText}`);
      }

      console.log('Backup uploaded successfully to Google Drive');
    } catch (error) {
      console.error('Error uploading backup:', error);
      throw error;
    }
  }

  async downloadBackup(): Promise<any | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const fileId = await this.findBackupFile();

      if (!fileId) {
        console.log('No backup file found in Google Drive');
        return null;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download backup: ${response.statusText}`);
      }

      const backupData = await response.json();
      console.log('Backup downloaded successfully from Google Drive');
      return backupData;
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry - 60000;
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
  }
}

export const googleDriveBackup = new GoogleDriveBackup();
