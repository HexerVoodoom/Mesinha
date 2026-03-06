import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { requestNotificationPermission, notifyFromSyncEvent, sendUserConfigToSW } from './utils/NotificationService';
import { subscribeToSync } from './utils/realtimeChannel';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [userProfile, setUserProfile] = useState<'Amanda' | 'Mateus' | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const profile = localStorage.getItem('userProfile') as 'Amanda' | 'Mateus' | null;

      if (profile && (profile === 'Amanda' || profile === 'Mateus')) {
        setIsAuthenticated(true);
        setUserProfile(profile);
      }

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // When authenticated, request notification permission and subscribe to realtime sync
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    // Ask for notification permission
    requestNotificationPermission().then(permission => {
      if (permission === 'granted') {
        // Send user config to Service Worker for scheduled alarm checking
        const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-19717bce`;
        sendUserConfigToSW(userProfile, baseUrl, publicAnonKey);
      }
    });

    // Subscribe to realtime sync and fire notifications on remote changes
    const unsubscribe = subscribeToSync((event) => {
      notifyFromSyncEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, userProfile]);

  const handleLoginSuccess = (profile: 'Amanda' | 'Mateus') => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (isLoading) {
    return null;
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
