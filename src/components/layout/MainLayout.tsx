import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export function MainLayout({
  children,
  showNavigation = true,
  className,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main
        className={cn(
          'container max-w-md mx-auto',
          showNavigation && 'pb-20',
          className
        )}
      >
        {children}
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
