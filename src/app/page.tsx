'use client';

import { AppSidebar } from '@/components/dashboard/sidebar';
import { APP_VERSION } from '@/lib/version';
// BUILD_TIMESTAMP is used for cache busting at build time
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard';
import { FinancialDashboard } from '@/components/dashboard/financial-dashboard';
import { MarketingDashboard } from '@/components/dashboard/marketing-dashboard';
import { ProductDashboard } from '@/components/dashboard/product-dashboard';
import { BrandDashboard } from '@/components/dashboard/brand-dashboard';
import { PlatformDashboard } from '@/components/dashboard/platform-dashboard';
import { ForecastDashboard } from '@/components/dashboard/forecast-dashboard';
import { ConnectionsPage } from '@/components/dashboard/connections-page';
import { SettingsPage } from '@/components/dashboard/settings-page';
import { HelpPage } from '@/components/dashboard/help-page';
import { UserManagementPage } from '@/components/dashboard/user-management-page';
import { AuditLogViewer } from '@/components/dashboard/audit-log-viewer';
import { AIChatPanel } from '@/components/dashboard/ai-chat';
import { DashboardHeaderActions } from '@/components/dashboard/header';
import { LiveIndicator } from '@/components/dashboard/live-indicator';
import { NewsTicker } from '@/components/dashboard/news-ticker';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const dashboardTitles: Record<string, { title: string; description: string }> = {
  executive: {
    title: 'Executive Overview',
    description: 'Real-time business performance across all brands',
  },
  financial: {
    title: 'Financial Dashboard',
    description: 'Revenue, profit, and margin analysis',
  },
  marketing: {
    title: 'Marketing Performance',
    description: 'Ad spend, ROAS, and campaign metrics',
  },
  product: {
    title: 'Product Performance',
    description: 'Product sales and inventory analysis',
  },
  platform: {
    title: 'Platform Performance',
    description: 'Sales channel comparison and metrics',
  },
  brand: {
    title: 'Brand Performance',
    description: 'Brand comparison and growth analysis',
  },
  forecast: {
    title: 'Forecast & Budget',
    description: 'Projections and budget tracking',
  },
  connections: {
    title: 'Connections',
    description: 'Manage integrations and data sources',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your account and preferences',
  },
  help: {
    title: 'Help & Support',
    description: 'Find answers and get support',
  },
  users: {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
  },
  'audit-logs': {
    title: 'Audit Logs',
    description: 'Track user actions and system events',
  },
};

export default function DataHubPage() {
  const { sidebarOpen, activeDashboard } = useUIStore();
  const [currentYear, setCurrentYear] = useState<number>(2024); // Default to avoid hydration mismatch
  const [serverTime, setServerTime] = useState<string>('');

  // Set current year on client-side only
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Fetch server time to verify fresh deployment
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await fetch('/api/version?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setServerTime(data.buildTime);
        }
      } catch {
        // Ignore errors
      }
    };
    void fetchServerTime();
  }, []);

  const renderContent = () => {
    switch (activeDashboard) {
      case 'financial':
        return <FinancialDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'product':
        return <ProductDashboard />;
      case 'platform':
        return <PlatformDashboard />;
      case 'brand':
        return <BrandDashboard />;
      case 'forecast':
        return <ForecastDashboard />;
      case 'connections':
        return <ConnectionsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'users':
        return <UserManagementPage />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'executive':
      default:
        return <ExecutiveDashboard />;
    }
  };

  const currentDashboard = dashboardTitles[activeDashboard] || dashboardTitles.executive;
  const isDashboard = ['executive', 'financial', 'marketing', 'product', 'platform', 'brand', 'forecast'].includes(activeDashboard);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        )}
      >
        {/* News Ticker - Only show on dashboards */}
        {isDashboard && <NewsTicker />}

        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex flex-col gap-1 py-2 lg:flex-row lg:items-center lg:justify-between lg:h-16 lg:gap-4">
            {/* Title Section - Full width on mobile */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile menu spacer */}
              <div className="w-10 lg:hidden shrink-0" />
              <div className="min-w-0 flex-1 lg:flex-none">
                <h1 className="text-lg lg:text-xl font-semibold truncate">{currentDashboard.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {currentDashboard.description}
                </p>
              </div>
            </div>
            {/* Actions Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 overflow-x-auto pb-1 lg:pb-0 lg:shrink-0 scrollbar-hide">
              {isDashboard && (
                <>
                  <NotificationsPanel />
                  <LiveIndicator />
                  <DashboardHeaderActions />
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 pb-16">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 border-t py-3 px-4 lg:px-6 text-center text-sm text-muted-foreground bg-card/80 backdrop-blur-sm z-10">
          <div className={cn('transition-all duration-300 flex items-center justify-center gap-2 lg:gap-4', sidebarOpen ? 'lg:ml-64' : '')}>
            <span className="truncate">DataHub by CTG © {currentYear}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              All systems operational
            </span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">v{APP_VERSION}</span>
          </div>
        </footer>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel />
    </div>
  );
}
