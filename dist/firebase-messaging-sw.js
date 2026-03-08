importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDHStR6pb17U_005yraz-GC0nFL3sha6Yg",
    authDomain: "mesinha-8890e.firebaseapp.com",
    projectId: "mesinha-8890e",
    storageBucket: "mesinha-8890e.firebasestorage.app",
    messagingSenderId: "155231442025",
    appId: "1:155231442025:web:c093e0e834916a84573ef8"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Recebeu notificação em background ', payload);
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'Mesinha';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});
