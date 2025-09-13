import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Settings,
  Users,
  Building2,
  Shield,
  KeyRound,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Upload de Arquivo',
    href: '/uploads',
    icon: Upload
  },
  {
    title: 'Saudação Personalizada',
    href: '/greetings',
    icon: MessageSquare
  },
  {
    title: 'Configurar Webhooks',
    href: '/webhooks',
    icon: Settings
  },
  {
    title: 'Usuários',
    href: '/users',
    icon: Users
  },
  {
    title: 'Empresas',
    href: '/companies',
    icon: Building2
  },
  {
    title: 'Gerenciar Permissões',
    href: '/permissions',
    icon: Shield
  },
  {
    title: 'Config. Esqueci a Senha',
    href: '/forgot-password-config',
    icon: KeyRound
  }
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-card to-card/90 border-r border-border transition-all duration-300 ease-in-out",
        "lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-72 lg:w-72"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Flow Hub
            </h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "sidebar-item group",
                  isActive && "active"
                )}
                onClick={onToggle}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className={cn(
                  "font-medium transition-colors",
                  isActive ? "text-primary" : "text-foreground group-hover:text-foreground"
                )}>
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Flow Hub v1.0
          </div>
        </div>
      </aside>
    </>
  );
}