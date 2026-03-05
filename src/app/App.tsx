import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleLoginSuccess = (profile: 'Amanda' | 'Mateus') => {
    console.log('[App] Login success callback:', { profile });
    setUserProfile(profile);
    setIsAuthenticated(true);
    console.log('[App] Authentication state updated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F3] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
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
