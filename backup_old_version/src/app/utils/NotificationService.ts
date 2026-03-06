export class NotificationService {
    /**
     * Request permission to send notifications
     */
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Has permission?
     */
    static hasPermission(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * Trigger a notification using ServiceWorker to support Android WebApk/TWA properly
     */
    static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
        const hasPerm = await this.requestPermission();
        if (!hasPerm) return;

        try {
            // Try to use ServiceWorker first (required for Android TWA)
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration && registration.showNotification) {
                    await registration.showNotification(title, {
                        icon: '/pwa-192x192.png',
                        badge: '/mask-icon.png',
                        vibrate: [200, 100, 200],
                        ...options
                    } as NotificationOptions & { vibrate?: number[] });
                    return;
                }
            }

            // Fallback to normal Notification API
            new Notification(title, {
                icon: '/pwa-192x192.png',
                ...options
            });
        } catch (e) {
            console.error('Error showing notification', e);
        }
    }
}
