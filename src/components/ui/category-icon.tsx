import { cn } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import { MoreHorizontal } from 'lucide-react';

interface CategoryIconProps {
  categoryId: string;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
};

export function CategoryIcon({
  categoryId,
  size = 'md',
  showBackground = true,
  className,
}: CategoryIconProps) {
  const category = getCategoryById(categoryId);
  const { container, icon: iconSize } = sizeClasses[size];

  if (!category) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          showBackground && 'bg-muted',
          container,
          className
        )}
      >
        <MoreHorizontal className={cn('text-muted-foreground', iconSize)} />
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        showBackground && category.bgColorClass,
        container,
        className
      )}
    >
      <Icon className={cn(category.colorClass, iconSize)} />
    </div>
  );
}
