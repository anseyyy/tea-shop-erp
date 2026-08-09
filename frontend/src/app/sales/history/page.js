"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../component/layout/ProtectedRoute';
import MainLayout from '../../../component/layout/MainLayout';
import { salesAPI } from '../../../api/apiService';
import { useNotification, NotificationProvider } from '../../../component/common/Notification';
import { Button, Loader, ErrorState, EmptyState, ConfirmDialog, Modal } from '../../../component/common';
import { icons } from '../../../constData';

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filterToday, setFilterToday] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showNotification } = useNotification();

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await salesAPI.getSales();
      setSales(data);
    } catch (err) {
      setError(err.message || 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadSales();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await salesAPI.deleteSale(deleteId);
      showNotification('Sale deleted successfully', 'success');
      setSales(sales.filter(s => s._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete sale', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getFilteredSales = () => {
    if (!filterToday) return sales;
    
    // Filter sales to today in UTC
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startOfToday && saleDate <= endOfToday;
    });
  };

  const filteredSales = getFilteredSales();

  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sales History</h2>
              <p className="mt-1 text-xs text-gray-500">Track and review past customer billing transactions</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={filterToday ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterToday(!filterToday)}
              >
                {filterToday ? "Showing: Today Only" : "Show Today Only"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSales} 
                disabled={loading}
                icon={icons.refreshIcon}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Table (Desktop) / Cards (Mobile) */}
          {loading ? (
            <Loader message="Loading sales..." />
          ) : error ? (
            <ErrorState onRetry={loadSales} description={error} />
          ) : filteredSales.length === 0 ? (
            <EmptyState title="No transactions found" description="There are no billing logs recorded matching this period." />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase">
                      <th className="p-4 pl-6">Time (UTC)</th>
                      <th className="p-4">Sold Items</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Billed By</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {filteredSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50/50">
                        <td className="p-4 pl-6 text-gray-500 text-xs">
                          {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </td>
                        <td className="p-4">
                          <span className="truncate block max-w-xs text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                            {sale.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">₹{sale.totalAmount}</td>
                        <td className="p-4 text-xs text-gray-500">{sale.createdBy?.name || 'N/A'}</td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                            View
                          </Button>
                          {user?.role === 'admin' && (
                            <Button variant="danger" size="sm" onClick={() => setDeleteId(sale._id)}>
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden space-y-4">
                {filteredSales.map((sale) => (
                  <div key={sale._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded">
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                      </span>
                      <span className="font-bold text-gray-900 text-base">₹{sale.totalAmount}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="text-gray-700">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-gray-400 mx-1">×</span>
                          <span className="font-semibold text-gray-600">{item.quantity}</span>
                          <span className="float-right text-gray-400">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">By: {sale.createdBy?.name || 'N/A'}</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                          Details
                        </Button>
                        {user?.role === 'admin' && (
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(sale._id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Details Modal */}
          {selectedSale && (
            <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Transaction Details" size="sm">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-gray-800">{new Date(selectedSale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Time (UTC)</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(selectedSale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Billed By</span>
                  <span className="font-semibold text-gray-800">{selectedSale.createdBy?.name || 'N/A'}</span>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider text-gray-400">Items Billed</h4>
                  <div className="divide-y divide-gray-100">
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-900">{item.name}</span>
                          <div className="text-gray-400 mt-0.5">₹{item.price} each</div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <span className="font-bold text-gray-600">×{item.quantity}</span>
                          <span className="font-bold text-gray-900 w-12 text-right">₹{item.subtotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between border-t border-dashed border-gray-200 pt-4 text-base">
                  <span className="font-bold text-gray-900">Total Billed</span>
                  <span className="font-black text-amber-800">₹{selectedSale.totalAmount}</span>
                </div>
              </div>
            </Modal>
          )}

          {/* Delete Dialog */}
          <ConfirmDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Sale Transaction"
            message="Are you sure you want to remove this sale transaction log? Today's profit/revenue will decrease."
            loading={deleteLoading}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function HistoryPage() {
  return (
    <NotificationProvider>
      <SalesHistory />
    </NotificationProvider>
  );
}
