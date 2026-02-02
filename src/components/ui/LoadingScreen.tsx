import { Skeleton } from '@/components/ui/skeleton';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo/Icon Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        
        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full mx-auto" />
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        
        {/* Loading indicator */}
        <div className="flex justify-center">
          <div className="animate-pulse text-sm text-muted-foreground">
            로딩 중...
          </div>
        </div>
      </div>
    </div>
  );
}
