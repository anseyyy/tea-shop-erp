"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { reportsAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, PageHeader } from '../../component/common';
import { icons } from '../../constData';

function ReportsView() {
  const [activeTab, setActiveTab] = useState('monthly'); // daily, weekly, monthly
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date params
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      let data = null;
      if (activeTab === 'daily') {
        data = await reportsAPI.getDaily(date);
      } else if (activeTab === 'weekly') {
        data = await reportsAPI.getWeekly(date);
      } else if (activeTab === 'monthly') {
        data = await reportsAPI.getMonthly(month, year);
      }
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch report aggregates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset filters on tab change
    setDate('');
    setMonth('');
    setYear('');
  }, [activeTab]);

  useEffect(() => {
    loadReport();
  }, [activeTab, date, month, year]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Reports"
            subtitle="Analyze revenue, expenses, net profits and sales volumes"
          />

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 font-semibold text-sm capitalize border-b-2 -mb-[2px] transition-colors
                  ${activeTab === tab 
                    ? 'border-amber-800 text-amber-800' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab} Report
              </button>
            ))}
          </div>

          {/* Filters Area */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
            {activeTab === 'daily' && (
              <div className="w-full sm:max-w-xs space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="w-full sm:max-w-xs space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End of Week Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {activeTab === 'monthly' && (
              <div className="flex gap-3 w-full sm:max-w-md">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Month</label>
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Current Month</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Year</label>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Current Year</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>
            )}
            
            <Button variant="outline" size="sm" onClick={loadReport} disabled={loading} icon={icons.refreshIcon}>
              Refresh Data
            </Button>
          </div>

          {/* Report Data display */}
          {loading ? (
            <Loader message="Querying statistics..." />
          ) : error ? (
            <ErrorState onRetry={loadReport} description={error} />
          ) : !report ? (
            <EmptyState title="No report data" description="No financial transactions could be found for this filter." />
          ) : (
            <div className="space-y-6">
              
              {/* Financial KPI summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Sales (Revenue)</span>
                  <span className="text-3xl font-black text-gray-900 block">₹{report.revenue.toLocaleString()}</span>
                </div>

                {/* Expenses */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Expenses</span>
                  <span className="text-3xl font-black text-gray-900 block text-red-600">₹{report.expenses.toLocaleString()}</span>
                </div>

                {/* Net Profit */}
                <div className="bg-white border border-amber-800/10 rounded-2xl p-6 shadow-sm space-y-2 bg-amber-50/20">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Net Profit</span>
                  <span className={`text-3xl font-black block ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{report.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Operations summary details */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Volume Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-500 font-semibold">Total Bills Logged</span>
                      <span className="font-bold text-gray-900">{report.totalBills} bills</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-500 font-semibold">Total Items Sold</span>
                      <span className="font-bold text-gray-900">{report.itemsSold} items</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1 border-t border-gray-100 pt-3">
                      <span className="text-gray-500 font-semibold">Best Selling Product</span>
                      <span className="font-extrabold text-amber-800 capitalize">
                        {report.bestSeller?.name} ({report.bestSeller?.quantity} sold)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simple relative financial ratio block */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Expense/Revenue Ratio</h3>
                  <div className="space-y-4 py-3">
                    <p className="text-xs text-gray-500">Visual mapping of operational expenditure relative to gross sales.</p>
                    
                    {report.revenue > 0 ? (
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-red-500 h-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (report.expenses / report.revenue) * 100)}%` }}
                          />
                          <div 
                            className="bg-green-500 h-full flex-1 transition-all duration-500"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                          <span>EXPENSES ({Math.round((report.expenses / report.revenue) * 100)}%)</span>
                          <span>NET PROFIT ({Math.max(0, Math.round((report.netProfit / report.revenue) * 100))}%)</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No revenue logged to compute ratio.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function ReportsPage() {
  return (
    <NotificationProvider>
      <ReportsView />
    </NotificationProvider>
  );
}
