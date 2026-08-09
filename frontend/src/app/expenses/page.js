"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { expensesAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, EmptyState, ConfirmDialog, Modal, PageHeader } from '../../component/common';
import ExpenseForm from '../../component/expenses/ExpenseForm';
import { icons } from '../../constData';

function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterToday, setFilterToday] = useState(false);
  const { showNotification } = useNotification();

  const loadExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await expensesAPI.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingExpense) {
        const updated = await expensesAPI.updateExpense(editingExpense._id, formData);
        showNotification('Expense updated successfully', 'success');
        setExpenses(expenses.map(e => e._id === editingExpense._id ? { ...e, ...updated } : e));
      } else {
        const added = await expensesAPI.createExpense(formData);
        showNotification('Expense logged successfully', 'success');
        setExpenses([added, ...expenses]);
      }
      setFormOpen(false);
      setEditingExpense(null);
    } catch (err) {
      showNotification(err.message || 'Action failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await expensesAPI.deleteExpense(deleteId);
      showNotification('Expense deleted successfully', 'success');
      setExpenses(expenses.filter(e => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete expense', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getFilteredExpenses = () => {
    if (!filterToday) return expenses;

    // Filter to UTC today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfToday && expDate <= endOfToday;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  const getTotalExpensesAmount = () => {
    return filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Expenses"
            subtitle="Record and monitor operational costs and purchases"
            action={
              <Button 
                variant="primary" 
                onClick={() => {
                  setEditingExpense(null);
                  setFormOpen(true);
                }}
                icon={icons.plusIcon}
              >
                Log Expense
              </Button>
            }
          />

          {/* Filters and Today's Summary card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
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
                onClick={loadExpenses} 
                disabled={loading}
                icon={icons.refreshIcon}
              >
                Refresh
              </Button>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Period Cost</span>
              <span className="text-xl font-bold text-gray-900">₹{getTotalExpensesAmount().toLocaleString()}</span>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <Loader message="Loading expenses..." />
          ) : error ? (
            <ErrorState onRetry={loadExpenses} description={error} />
          ) : filteredExpenses.length === 0 ? (
            <EmptyState title="No expenses recorded" description="Operational expense logs for this period are empty." />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase">
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Logged By</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-gray-50/50">
                        <td className="p-4 pl-6 text-xs text-gray-500">
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-900 font-semibold">{exp.description}</td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                            {exp.category || 'General'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">₹{exp.amount}</td>
                        <td className="p-4 text-xs text-gray-500">{exp.createdBy?.name || 'N/A'}</td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingExpense(exp);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(exp._id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden space-y-4">
                {filteredExpenses.map((exp) => (
                  <div key={exp._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded">
                        {new Date(exp.date).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-gray-900 text-base">₹{exp.amount}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{exp.description}</h3>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1 block">
                        Category: {exp.category || 'General'}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">By: {exp.createdBy?.name || 'N/A'}</span>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditingExpense(exp);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(exp._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Form Modal */}
          {formOpen && (
            <Modal 
              isOpen={formOpen} 
              onClose={() => {
                setFormOpen(false);
                setEditingExpense(null);
              }} 
              title={editingExpense ? "Edit Expense details" : "Log New Expense"}
              size="sm"
            >
              <ExpenseForm 
                expense={editingExpense} 
                onSubmit={handleFormSubmit} 
                loading={formLoading}
              />
            </Modal>
          )}

          {/* Delete Dialog */}
          <ConfirmDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Expense Record"
            message="Are you sure you want to delete this expense log? Today's profit/expenses summary will adjust."
            loading={deleteLoading}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function ExpensesPage() {
  return (
    <NotificationProvider>
      <ExpensesView />
    </NotificationProvider>
  );
}
