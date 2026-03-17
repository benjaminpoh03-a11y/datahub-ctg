'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Store,
  Link2,
  Users,
  Shield,
  Database,
  ArrowLeft,
} from 'lucide-react'

const settingsNav = [
  { href: '/settings/brands', label: 'Brands', icon: Store, description: 'Manage your brands' },
  { href: '/settings/integrations', label: 'Integrations', icon: Link2, description: 'Connect platforms' },
  { href: '/settings/users', label: 'Users', icon: Users, description: 'Team management' },
  { href: '/settings/permissions', label: 'Permissions', icon: Shield, description: 'Access control' },
  { href: '/settings/database', label: 'Database', icon: Database, description: 'Data management' },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Separator className="mb-4" />
        <h2 className="font-semibold mb-2 px-2">Settings</h2>
        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={cn(
                    'text-xs',
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
