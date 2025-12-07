import { 
  LayoutDashboard, 
  GitBranch, 
  Calendar, 
  Globe, 
  Link2, 
  Settings,
  TrendingUp,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Painel", href: "/", icon: LayoutDashboard },
  { name: "Funis", href: "/funnels", icon: GitBranch },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Fontes de Tráfego", href: "/traffic", icon: Globe },
  { name: "Criador de UTM", href: "/utm-builder", icon: Link2 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 sm:hidden p-2 rounded-lg bg-sidebar border border-sidebar-border text-foreground"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          "hidden sm:block", // Hidden on mobile by default
          mobileOpen && "block sm:block", // Show on mobile when open
          collapsed ? "w-16" : "w-64"
        )}
      >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">TrackFlow</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-muted-foreground hover:text-foreground sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                <span className={cn("sm:block", collapsed && "sm:hidden")}>{item.name}</span>
                {isActive && (
                  <div className={cn("ml-auto h-1.5 w-1.5 rounded-full bg-primary", collapsed && "sm:hidden")} />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 p-3">
              <p className="text-xs text-muted-foreground">
                Conectado ao GA4
              </p>
              <p className="text-sm font-medium text-foreground mt-1">
                Propriedade: 123456789
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
