/**
 * NotificationService
 * Handles browser push notifications for the Mesinha PWA.
 * Works by using the Web Notification API + Supabase realtime events.
 */

const NOTIFICATION_ICON = '/pwa-192x192.png';

// Request permission from the user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('[Notifications] This browser does not support notifications');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        console.warn('[Notifications] Notifications blocked by user');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission result:', permission);
    return permission;
}

// Check if notifications are currently allowed
export function areNotificationsEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}

// Show a notification (used directly when app is in foreground via SW)
export async function showNotification(title: string, body: string, options?: {
    tag?: string;
    url?: string;
}) {
    if (!areNotificationsEnabled()) {
        console.warn('[Notifications] Cannot show notification - permission not granted');
        return;
    }

    // Prefer showing via Service Worker (works when app is in background)
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            body,
            icon: NOTIFICATION_ICON,
            badge: NOTIFICATION_ICON,
            tag: options?.tag || 'mesinha-update',
            data: { url: options?.url || '/' },
        });
    } else {
        // Fallback: direct browser notification
        new Notification(title, {
            body,
            icon: NOTIFICATION_ICON,
            tag: options?.tag || 'mesinha-update',
        });
    }
}

// Map sync events to user-facing notification messages
export async function notifyFromSyncEvent(event: { type: string; data?: any }) {
    if (!areNotificationsEnabled()) return;

    let title = 'Mesinha';
    let body = 'Algo foi atualizado 💕';

    switch (event.type) {
        case 'item_created':
            title = '✨ Novo item adicionado';
            body = event.data?.title
                ? `"${event.data.title}" foi adicionado à lista`
                : 'Um novo item foi adicionado';
            break;
        case 'item_updated':
            title = '✏️ Item atualizado';
            body = event.data?.title
                ? `"${event.data.title}" foi atualizado`
                : 'Um item foi atualizado';
            break;
        case 'item_deleted':
            title = '🗑️ Item removido';
            body = 'Um item foi removido da lista';
            break;
        case 'settings_updated':
            title = '⚙️ Configurações atualizadas';
            body = 'As configurações do app foram alteradas';
            break;
    }

    await showNotification(title, body, { tag: event.type });
}

/**
 * Send user credentials to the Service Worker so it can fetch
 * alarms autonomously in the background.
 */
export async function sendUserConfigToSW(
    userProfile: string,
    baseUrl: string,
    anonKey: string
) {
    if (!('serviceWorker' in navigator)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
            type: 'SET_USER_CONFIG',
            userProfile,
            baseUrl,
            anonKey,
        });
        console.log('[Notifications] Sent user config to SW:', userProfile);
    } catch (error) {
        console.warn('[Notifications] Could not send config to SW:', error);
    }
}
