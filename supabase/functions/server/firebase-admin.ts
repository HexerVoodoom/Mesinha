import { initializeApp, cert, getApps } from "npm:firebase-admin/app";
import { getMessaging } from "npm:firebase-admin/messaging";

export const initFirebaseAdmin = () => {
    if (getApps().length === 0) {
        const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
        if (!serviceAccountStr) {
            console.error("FIREBASE_SERVICE_ACCOUNT variable not found!");
            return;
        }
        try {
            const serviceAccount = JSON.parse(serviceAccountStr);
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized Successfully");
        } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT config", e);
        }
    }
};

export const sendPushNotification = async (token: string, title: string, body: string, link: string) => {
    initFirebaseAdmin();
    try {
        await getMessaging().send({
            token: token,
            notification: {
                title,
                body
            },
            webpush: {
                fcmOptions: {
                    link
                }
            }
        });
        console.log("Notificação push enviada com sucesso para o webhook/Firebase");
    } catch (error) {
        console.error("Erro ao enviar notificação push:", error);
    }
};
