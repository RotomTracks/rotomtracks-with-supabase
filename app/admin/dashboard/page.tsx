"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useTypedTranslation } from '@/lib/i18n';

export default function AdminDashboardPage() {
  const { tPages } = useTypedTranslation();
  
  return (
    <AdminRoute>
      <AdminLayout
        title={tPages('admin.dashboard.title')}
        description={tPages('admin.dashboard.description')}
      >
        <AdminDashboard />
      </AdminLayout>
    </AdminRoute>
  );
}