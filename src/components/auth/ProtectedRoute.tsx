import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip check for auth and onboarding pages to prevent infinite loops
    const publicPaths = ['/auth', '/onboarding'];
    if (publicPaths.includes(location.pathname)) {
      return;
    }

    // Wait until auth state is determined
    if (isLoading) {
      return;
    }

    // If user is logged in
    if (user) {
      // Check if profile doesn't exist (new user) or onboarding not completed
      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, isLoading, navigate, location.pathname]);

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
