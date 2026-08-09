"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { adminAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, EmptyState, ConfirmDialog, Modal, PageHeader } from '../../component/common';
import EmployeeForm from '../../component/employees/EmployeeForm';
import { icons } from '../../constData';

function EmployeesView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showNotification } = useNotification();

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingEmployee) {
        const updated = await adminAPI.updateEmployee(editingEmployee._id, formData);
        showNotification('Employee details updated successfully', 'success');
        setEmployees(employees.map(e => e._id === editingEmployee._id ? { ...e, ...updated } : e));
      } else {
        const added = await adminAPI.createEmployee(formData);
        showNotification('Employee account created successfully', 'success');
        setEmployees([...employees, added]);
      }
      setFormOpen(false);
      setEditingEmployee(null);
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
      await adminAPI.deleteEmployee(deleteId);
      showNotification('Employee account deleted successfully', 'success');
      setEmployees(employees.filter(e => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete employee', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <PageHeader
            title="Employees"
            subtitle="Manage tea shop cashier and employee login accounts"
            action={
              <Button 
                variant="primary" 
                onClick={() => {
                  setEditingEmployee(null);
                  setFormOpen(true);
                }}
                icon={icons.plusIcon}
              >
                Add Employee
              </Button>
            }
          />

          {/* List display */}
          {loading ? (
            <Loader message="Loading employee accounts..." />
          ) : error ? (
            <ErrorState onRetry={loadEmployees} description={error} />
          ) : employees.length === 0 ? (
            <EmptyState title="No employee accounts" description="Cashier and employee records are empty. Click Add Employee to register." />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase">
                      <th className="p-4 pl-6">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50/50">
                        <td className="p-4 pl-6 font-bold text-gray-900">{emp.name}</td>
                        <td className="p-4 text-gray-500">{emp.email}</td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-md capitalize">
                            {emp.role}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingEmployee(emp);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(emp._id)}>
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
                {employees.map((emp) => (
                  <div key={emp._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-sm">{emp.name}</h3>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded capitalize">
                        {emp.role}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 truncate">{emp.email}</div>

                    <div className="border-t border-gray-100 pt-3 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingEmployee(emp);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(emp._id)}>
                        Delete
                      </Button>
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
                setEditingEmployee(null);
              }} 
              title={editingEmployee ? "Modify Employee Account" : "Register New Employee"}
              size="sm"
            >
              <EmployeeForm 
                employee={editingEmployee} 
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
            title="Delete Employee Account"
            message="Are you sure you want to delete this employee account? They will lose access to login."
            loading={deleteLoading}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function EmployeesPage() {
  return (
    <NotificationProvider>
      <EmployeesView />
    </NotificationProvider>
  );
}
