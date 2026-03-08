import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDHStR6pb17U_005yraz-GC0nFL3sha6Yg",
    authDomain: "mesinha-8890e.firebaseapp.com",
    projectId: "mesinha-8890e",
    storageBucket: "mesinha-8890e.firebasestorage.app",
    messagingSenderId: "155231442025",
    appId: "1:155231442025:web:c093e0e834916a84573ef8"
};

const app = initializeApp(firebaseConfig);

// Somente inicializa o messaging e pega token se suportado pelo navegador
export const initFirebaseMessaging = async (): Promise<string | null> => {
    try {
        const messaging = getMessaging(app);
        // VAPID Key do projeto
        const vapidKey = "BKffi2bRiXx3ePRUdSeD_Er3DSgkMxVKg1E0rBwUMQkCFzX3SimXWOXDjOzc1RD6r4Au1BMsJHXxFIcAAH3dgCI";

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
            if (currentToken) {
                console.log('[FCM] Token gerado:', currentToken);
                return currentToken;
            } else {
                console.log('[FCM] Nenhum token registrado. Peça permissão e tente de novo.');
                return null;
            }
        } else {
            console.log('[FCM] Permissão de notificação negada');
            return null;
        }
    } catch (err) {
        console.error('[FCM] Erro ao pegar token', err);
        return null;
    }
};

export const onForegroundMessage = () => {
    try {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload: any) => {
            console.log('[FCM] Notificação recebida em foreground ', payload);
            // Aqui podemos disparar um som, toast, ou criar a notificação pela Navigation API
            if (payload.notification) {
                new Notification(payload.notification.title || 'Mesinha', {
                    body: payload.notification.body,
                    icon: '/pwa-192x192.png'
                });
            }
        });
    } catch (error) {
        console.error('Error on onForegroundMessage', error);
    }
};

export { app };
