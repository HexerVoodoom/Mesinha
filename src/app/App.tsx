import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { subscribeToSync } from './utils/realtimeChannel';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { initFirebaseMessaging, onForegroundMessage } from './utils/firebase';
import { api } from './utils/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [userProfile, setUserProfile] = useState<'Amanda' | 'Mateus' | null>(null);

  useEffect(() => {
    // Verificar se já existe um perfil salvo no localStorage
    const initializeApp = async () => {
      console.log('[App] Initializing app...');

      const profile = localStorage.getItem('userProfile') as 'Amanda' | 'Mateus' | null;
      console.log('[App] Stored profile:', profile);

      if (profile && (profile === 'Amanda' || profile === 'Mateus')) {
        console.log('[App] Profile found, setting authenticated');
        setIsAuthenticated(true);
        setUserProfile(profile);
      } else {
        console.log('[App] No valid profile found');
      }

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // When authenticated, request Firebase notification permission and grab token
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    // Ask for Firebase Notification permission and get token
    initFirebaseMessaging().then(token => {
      if (token) {
        // Save token to Supabase through your API
        api.saveFCMToken(userProfile, token);
      }
    });

    // Start listening for foreground messages (Firebase)
    onForegroundMessage();

    // Subscribe to realtime sync
    const unsubscribe = subscribeToSync((event) => {
      console.log("Realtime sync event:", event);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, userProfile]);

  const handleLoginSuccess = (profile: 'Amanda' | 'Mateus') => {
    console.log('[App] Login success callback:', { profile });
    setUserProfile(profile);
    setIsAuthenticated(true);
    console.log('[App] Authentication state updated');
  };

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  // Mostrar loading screen primeiro
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (isLoading) {
    return null; // Não precisa mostrar nada enquanto carrega após loading screen
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  );
}