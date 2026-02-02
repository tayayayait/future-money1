import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center bg-black/90">
      <div className="w-full max-w-md min-h-screen bg-background relative shadow-2xl overflow-x-hidden pb-24">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}

