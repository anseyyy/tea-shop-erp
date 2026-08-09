"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { dashboardAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, PageHeader } from '../../component/common';
import { icons } from '../../constData';

function DashboardView() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { showNotification } = useNotification();

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await dashboardAPI.getStats();
      const historyData = await dashboardAPI.getHistory();
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch dashboard summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Dashboard"
            subtitle={`Overview of today's shop operations for ${user?.name}`}
            action={
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadDashboardData} 
                disabled={loading}
                icon={icons.refreshIcon}
              >
                Refresh
              </Button>
            }
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={loadDashboardData} className="underline text-xs font-semibold">Try Again</button>
            </div>
          )}

          {loading ? (
            <Loader message="Fetching summaries..." />
          ) : (
            <>
              {/* ========================================================================== */}
              {/* ADMIN LAYOUT */}
              {/* ========================================================================== */}
              {user?.role === 'admin' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Sales</span>
                      <span className="text-2xl font-bold text-gray-900 mt-2 block">₹{(stats?.todayRevenue || 0).toLocaleString()}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Expenses</span>
                      <span className="text-2xl font-bold text-gray-900 mt-2 block">₹{(stats?.todayExpenses || 0).toLocaleString()}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Net Profit</span>
                      <span className={`text-2xl font-bold mt-2 block ${(stats?.todayProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(stats?.todayProfit || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Items Sold</span>
                      <span className="text-2xl font-bold text-gray-900 mt-2 block">{stats?.itemsSold || 0}</span>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Sales History */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Recent Sales</h3>
                      {history.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No sales logged today.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                          {history.slice(0, 5).map((sale) => (
                            <div key={sale._id} className="py-3 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-gray-800">{sale.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}</span>
                                <span className="text-gray-400 block mt-0.5">{sale.time}</span>
                              </div>
                              <span className="font-bold text-gray-900 text-sm">₹{sale.totalAmount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick navigation */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Quick Navigation</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/sales" className="flex flex-col items-center justify-center p-4 border border-gray-150 rounded-xl hover:border-amber-700/30 transition-colors">
                          <icons.salesIcon className="h-6 w-6 text-amber-800 mb-2" />
                          <span className="text-xs font-semibold">Open POS</span>
                        </Link>
                        <Link href="/expenses" className="flex flex-col items-center justify-center p-4 border border-gray-150 rounded-xl hover:border-amber-700/30 transition-colors">
                          <icons.expenseIcon className="h-6 w-6 text-amber-800 mb-2" />
                          <span className="text-xs font-semibold">Log Expense</span>
                        </Link>
                        <Link href="/products" className="flex flex-col items-center justify-center p-4 border border-gray-150 rounded-xl hover:border-amber-700/30 transition-colors">
                          <icons.productIcon className="h-6 w-6 text-amber-800 mb-2" />
                          <span className="text-xs font-semibold">Manage Menu</span>
                        </Link>
                        <Link href="/reports" className="flex flex-col items-center justify-center p-4 border border-gray-150 rounded-xl hover:border-amber-700/30 transition-colors">
                          <icons.reportIcon className="h-6 w-6 text-amber-800 mb-2" />
                          <span className="text-xs font-semibold">View Reports</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================== */}
              {/* EMPLOYEE LAYOUT */}
              {/* ========================================================================== */}
              {user?.role === 'employee' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Sales</span>
                      <span className="text-2xl font-bold text-gray-900 mt-2">₹{(stats?.todayRevenue || 0).toLocaleString()}</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Bills Logged</span>
                      <span className="text-2xl font-bold text-gray-900 mt-2">{stats?.billsCount || 0}</span>
                    </div>
                  </div>

                  {/* POS Call-to-action button */}
                  <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-6 text-center space-y-4">
                    <h3 className="font-bold text-amber-900 text-base">Cashier Panel</h3>
                    <p className="text-xs text-amber-700 max-w-sm mx-auto">Open the Point-of-Sale billing screen to log customer transactions and print invoices.</p>
                    <Button variant="primary" size="lg" className="px-8" onClick={() => router.push('/sales')}>
                      OPEN POS / NEW BILL
                    </Button>
                  </div>

                  {/* Recent sales history list */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">My Recent Sales</h3>
                    {history.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">No sales logged today.</p>
                    ) : (
                      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                        {history.slice(0, 5).map((sale) => (
                          <div key={sale._id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-gray-800">{sale.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}</span>
                              <span className="text-gray-400 block mt-0.5">{sale.time}</span>
                            </div>
                            <span className="font-bold text-gray-900 text-sm">₹{sale.totalAmount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <NotificationProvider>
      <DashboardView />
    </NotificationProvider>
  );
}
