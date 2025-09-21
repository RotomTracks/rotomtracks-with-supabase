"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminLayout
        title="Dashboard"
        description="Vista general del sistema y métricas de solicitudes de organizador"
      >
        <AdminDashboard />
      </AdminLayout>
    </AdminRoute>
  );
}