'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  DollarSign,
  Target,
  Package,
  Store,
  Tag,
  TrendingUp,
  Settings,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  Cable,
  Database,
  LogOut,
  Users,
  Shield,
} from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { signOut, useSession } from 'next-auth/react';

const mainNavItems = [
  { title: 'Executive Overview', icon: LayoutDashboard, id: 'executive' },
  { title: 'Financial Dashboard', icon: DollarSign, id: 'financial' },
  { title: 'Marketing Performance', icon: Target, id: 'marketing' },
  { title: 'Product Performance', icon: Package, id: 'product' },
  { title: 'Platform Performance', icon: Store, id: 'platform' },
  { title: 'Brand Performance', icon: Tag, id: 'brand' },
  { title: 'Forecast & Budget', icon: TrendingUp, id: 'forecast' },
];

const secondaryNavItems = [
  { title: 'Connections', icon: Cable, id: 'connections' },
  { title: 'Settings', icon: Settings, id: 'settings' },
  { title: 'Help & Support', icon: HelpCircle, id: 'help' },
];

const adminNavItems = [
  { title: 'User Management', icon: Users, id: 'users' },
  { title: 'Audit Logs', icon: Shield, id: 'audit-logs' },
];

export function AppSidebar() {
  const { sidebarOpen, toggleSidebar, activeDashboard, setActiveDashboard } = useUIStore();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">DataHub</h1>
                <p className="text-xs text-muted-foreground">by CTG</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDashboard(item.id as any)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeDashboard === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDashboard(item.id as any)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeDashboard === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </button>
              ))}
            </div>

            {/* Admin Navigation - Only visible to admins */}
            {session?.user && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    Admin
                  </div>
                  {adminNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveDashboard(item.id as any)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        activeDashboard === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </ScrollArea>

          {/* User info & Logout */}
          {session?.user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {session.user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}

          {/* AI Assistant button */}
          <div className="border-t p-4">
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={() => useUIStore.getState().toggleAIChat()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
