import { Home, ListOrdered, CalendarClock, Settings, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center shadow-2xl safe-area-bottom">
      <div className="flex justify-between items-center w-full max-w-md mx-auto relative">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-200",
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        
        <Link
          to="/transactions"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-200",
            isActive("/transactions") ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <ListOrdered className="w-6 h-6" />
          <span className="text-[10px] font-medium">History</span>
        </Link>

        {/* Floating Action Button for Add */}
        <div className="relative -top-8">
          <Link to="/add">
            <button className="size-14 rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(19,236,91,0.4)] flex items-center justify-center transition-transform active:scale-95 hover:scale-105 border-4 border-background">
              <Plus className="w-8 h-8 font-bold" />
            </button>
          </Link>
        </div>

        <Link
          to="/simulation"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-200",
            isActive("/simulation") ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <CalendarClock className="w-6 h-6" />
          <span className="text-[10px] font-medium">Simulation</span>
        </Link>

        <Link
          to="/settings"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors duration-200",
            isActive("/settings") ? "text-primary" : "text-muted-foreground hover:text-primary/70"
          )}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
