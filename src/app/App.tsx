import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { requestNotificationPermission, notifyFromSyncEvent } from './utils/NotificationService';
import { subscribeToSync } from './utils/realtimeChannel';

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
      console.log('[App] Notification permission:', permission);
    });

    // Subscribe to realtime sync and fire notifications on remote changes
    const unsubscribe = subscribeToSync((event) => {
      // Only notify if the event came from the OTHER user
      // We can detect this by checking if the change was made locally (store a flag)
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
