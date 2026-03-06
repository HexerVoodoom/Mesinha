/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ────────────────────────────────────────────────────────
// ALARMES AGENDADOS
// O Service Worker verifica a cada minuto se existe algum
// lembrete cujo horário bate com o horário atual e que
// está ativo para o usuário logado neste dispositivo.
// ────────────────────────────────────────────────────────

const ALARM_CHECK_INTERVAL_MS = 60_000; // 1 minuto
let alarmTimer: ReturnType<typeof setInterval> | null = null;

// Dias da semana em inglês (igual ao campo reminderDays da API)
const DAY_CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Guarda os alarmes já disparados neste minuto para evitar repetição
const firedThisMinute = new Set<string>();

async function checkAlarms() {
    // Pegar perfil do usuário guardado pelo app no cliente
    const dbRequest = indexedDB.open('mesinha-sw-db', 1);
    dbRequest.onupgradeneeded = () => {
        dbRequest.result.createObjectStore('kv');
    };

    const db: IDBDatabase = await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result);
        dbRequest.onerror = () => reject(dbRequest.error);
    });

    const userProfile: string | null = await new Promise(resolve => {
        const tx = db.transaction('kv', 'readonly');
        const store = tx.objectStore('kv');
        const req = store.get('userProfile');
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
    });

    if (!userProfile) return;

    const baseUrl: string | null = await new Promise(resolve => {
        const tx = db.transaction('kv', 'readonly');
        const store = tx.objectStore('kv');
        const req = store.get('baseUrl');
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
    });

    const anonKey: string | null = await new Promise(resolve => {
        const tx = db.transaction('kv', 'readonly');
        const store = tx.objectStore('kv');
        const req = store.get('anonKey');
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
    });

    if (!baseUrl || !anonKey) return;

    // Buscar itens da API
    let items: any[] = [];
    try {
        const response = await fetch(`${baseUrl}/items`, {
            headers: { Authorization: `Bearer ${anonKey}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        items = data.items ?? [];
    } catch {
        return;
    }

    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = DAY_CODES[now.getDay()];

    for (const item of items) {
        if (item.category !== 'alarm') continue;
        if (!item.reminderActive) continue;
        if (!item.reminderTime) continue;

        // Verificar se este item é para o usuário atual
        const isForThisUser =
            (userProfile === 'Mateus' && item.reminderForMateus === true) ||
            (userProfile === 'Amanda' && item.reminderForAmanda === true);
        if (!isForThisUser) continue;

        // Verificar horário
        if (item.reminderTime !== currentHHMM) continue;

        // Verificar dia da semana (se configurado)
        if (item.reminderDays && item.reminderDays.length > 0) {
            if (!item.reminderDays.includes(currentDay)) continue;
        }

        // Evitar disparar o mesmo alarme mais de uma vez por minuto
        const alarmKey = `${item.id}-${currentHHMM}`;
        if (firedThisMinute.has(alarmKey)) continue;
        firedThisMinute.add(alarmKey);

        // Limpar o set depois de 90 segundos (2 minutos próximos não vão repetir)
        setTimeout(() => firedThisMinute.delete(alarmKey), 90_000);

        // Disparar notificação
        await self.registration.showNotification(`⏰ Lembrete: ${item.title}`, {
            body: item.comment || 'Hora do lembrete!',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: item.id,
            data: { url: '/' },
        });
    }
}

// Iniciar temporizador de alarmes
function startAlarmScheduler() {
    if (alarmTimer) return;
    alarmTimer = setInterval(checkAlarms, ALARM_CHECK_INTERVAL_MS);
    checkAlarms(); // Checar imediatamente ao iniciar
}

// ────────────────────────────────────────────────────────
// EVENTOS DO SERVICE WORKER
// ────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    startAlarmScheduler();
});

// Quando o usuário clica na notificação, abrir o app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const existing = clients.find(c => c.url.includes(self.location.origin));
            if (existing) {
                existing.focus();
            } else {
                self.clients.openWindow(url);
            }
        })
    );
});

// Mensagens do app para o SW (ex: atualizar dados do usuário)
self.addEventListener('message', async (event) => {
    if (event.data?.type === 'SET_USER_CONFIG') {
        const { userProfile, baseUrl, anonKey } = event.data;

        const dbRequest = indexedDB.open('mesinha-sw-db', 1);
        dbRequest.onupgradeneeded = () => {
            dbRequest.result.createObjectStore('kv');
        };

        const db: IDBDatabase = await new Promise((resolve, reject) => {
            dbRequest.onsuccess = () => resolve(dbRequest.result);
            dbRequest.onerror = () => reject(dbRequest.error);
        });

        const tx = db.transaction('kv', 'readwrite');
        const store = tx.objectStore('kv');
        store.put(userProfile, 'userProfile');
        store.put(baseUrl, 'baseUrl');
        store.put(anonKey, 'anonKey');

        startAlarmScheduler();
    }
});
