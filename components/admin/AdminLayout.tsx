"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BarChart3, Users, Settings, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTypedTranslation } from '@/lib/i18n';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Navigation will be defined inside the component to use translations

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, loading } = useAuth();
  const { tUI, tAdmin } = useTypedTranslation();

  const navigation: NavItem[] = [
    {
      name: tAdmin('navigation.dashboard'),
      href: '/admin/dashboard',
      icon: BarChart3,
      description: tAdmin('navigation.dashboardDescription')
    },
    {
      name: tAdmin('navigation.organizerRequests'),
      href: '/admin/organizer-requests',
      icon: Users,
      description: tAdmin('navigation.organizerRequestsDescription')
    },
    {
      name: tAdmin('navigation.settings'),
      href: '/admin/settings',
      icon: Settings,
      description: tAdmin('navigation.settingsDescription')
    }
  ];

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirect if not admin (this should be handled by middleware, but as backup)
  if (!isAdmin) {
    router.push('/auth/unauthorized?reason=admin_required');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tAdmin('panel')}
              </h1>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">{tUI('navigation.home')}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {(title || description) && (
              <div className="mb-8">
                {title && (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}