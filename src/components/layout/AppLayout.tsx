import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-0 sm:pl-16 lg:pl-64 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
