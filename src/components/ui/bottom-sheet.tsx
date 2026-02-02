import * as React from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

interface BottomSheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface BottomSheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface BottomSheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface BottomSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

const BottomSheet = ({
  open,
  onOpenChange,
  children,
  trigger,
}: BottomSheetProps) => {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-2xl fixed bottom-0 left-0 right-0 z-50 max-h-[90vh]">
          {/* Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const BottomSheetContent = ({ children, className }: BottomSheetContentProps) => {
  return (
    <div className={cn('px-4 pb-6 overflow-y-auto', className)}>
      {children}
    </div>
  );
};

const BottomSheetHeader = ({ children, className }: BottomSheetHeaderProps) => {
  return (
    <div className={cn('px-4 pb-4', className)}>
      {children}
    </div>
  );
};

const BottomSheetTitle = ({ children, className }: BottomSheetTitleProps) => {
  return (
    <Drawer.Title className={cn('text-lg font-semibold', className)}>
      {children}
    </Drawer.Title>
  );
};

const BottomSheetDescription = ({ children, className }: BottomSheetDescriptionProps) => {
  return (
    <Drawer.Description className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Drawer.Description>
  );
};

const BottomSheetFooter = ({ children, className }: BottomSheetFooterProps) => {
  return (
    <div className={cn('px-4 py-4 border-t bg-background', className)}>
      {children}
    </div>
  );
};

export {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
};
