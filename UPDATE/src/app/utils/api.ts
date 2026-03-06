import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-19717bce`;

export interface ListItem {
  id: string;
  title: string;
  comment: string;
  category: string;
  eventDate: string | null;
  photo: string | null;
  reminderEnabled: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  repeatCount?: number;
  createdBy: string;
  createdAt: string;
  status: 'pending' | 'done';
  updatedAt?: string;
  tags?: string[];
  // Campos específicos para lembretes (categoria alarm)
  reminderTime?: string; // Horário do lembrete (formato HH:mm)
  reminderDays?: string[]; // Dias da semana ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  reminderForMateus?: boolean; // Lembrete ativo para Mateus
  reminderForAmanda?: boolean; // Lembrete ativo para Amanda
  reminderActive?: boolean; // Status do lembrete (ativo/desativado)
  // Campos específicos para Top 3
  top3Mateus?: {
    position1: string;
    position2: string;
    position3: string;
  };
  top3Amanda?: {
    position1: string;
    position2: string;
    position3: string;
  };
  // Campos específicos para Mural
  muralContentType?: 'text' | 'image' | 'video' | 'audio';
  muralContent?: string;
  viewedBy?: string[]; // Lista de usuários que visualizaram o post
}

export interface Settings {
  coupleName: string;
  themeColor: string;
  notificationsEnabled: boolean;
}

const fetchAPI = async (endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers as Record<string, string>,
  };

  console.log(`[API] Making request to ${endpoint}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
      keepalive: false,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        console.error(`Server returned HTML error page for ${endpoint}`);
        throw new Error('Servidor temporariamente indisponível. Usando modo offline.');
      }
      
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`API Error for ${endpoint}:`, error);
      
      throw new Error(error.error || 'API request failed');
    }

    const clone = response.clone();
    
    try {
      return await response.json();
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      const text = await clone.text();
      console.error('Response text:', text.substring(0, 200));
      throw new Error('Erro ao processar resposta do servidor');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry logic for connection errors
    if (retries > 0 && (
      (error instanceof Error && error.name === 'AbortError') ||
      (error instanceof TypeError && error.message.includes('fetch'))
    )) {
      console.log(`Retrying request to ${endpoint}... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchAPI(endpoint, options, retries - 1);
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout for ${endpoint}`);
      throw new Error('Tempo limite excedido. Usando modo offline.');
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`Network error: Cannot reach server at ${BASE_URL}${endpoint}`);
      throw new Error('Não foi possível conectar ao servidor. Usando modo offline.');
    }
    throw error;
  }
};

export const api = {
  // Authentication
  login: async (profile: 'Amanda' | 'Mateus', password: string): Promise<any> => {
    return await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ profile, password }),
    });
  },

  // Items
  getItems: async (): Promise<ListItem[]> => {
    const data = await fetchAPI('/items');
    return data.items;
  },

  getItemPhoto: async (id: string): Promise<string | null> => {
    try {
      // Use timeout menor para fotos (10s) e permite 1 retry
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BASE_URL}/items/${id}/photo`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.photo;
    } catch (error) {
      // Silenciosamente retorna null (sem logs)
      return null;
    }
  },

  createItem: async (item: Partial<ListItem>): Promise<ListItem> => {
    const data = await fetchAPI('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return data.item;
  },

  updateItem: async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
    const data = await fetchAPI(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.item;
  },

  deleteItem: async (id: string): Promise<void> => {
    await fetchAPI(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const data = await fetchAPI('/settings');
    return data.settings;
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const data = await fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.settings;
  },
};