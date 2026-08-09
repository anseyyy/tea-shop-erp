"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { productAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, EmptyState, ConfirmDialog, Modal, PageHeader } from '../../component/common';
import ProductForm from '../../component/products/ProductForm';
import { icons } from '../../constData';

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showNotification } = useNotification();

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productAPI.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        const updated = await productAPI.updateProduct(editingProduct._id, formData);
        showNotification('Product updated successfully', 'success');
        setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p));
      } else {
        const added = await productAPI.createProduct(formData);
        showNotification('Product added successfully', 'success');
        setProducts([added, ...products]);
      }
      setFormOpen(false);
      setEditingProduct(null);
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
      await productAPI.deleteProduct(deleteId);
      showNotification('Product deleted successfully', 'success');
      setProducts(products.filter(p => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      showNotification(err.message || 'Failed to delete product', 'error');
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
            title="Products / Items"
            subtitle="Manage product menu offerings and item pricing"
            action={
              <Button 
                variant="primary" 
                onClick={() => {
                  setEditingProduct(null);
                  setFormOpen(true);
                }}
                icon={icons.plusIcon}
              >
                Add Product
              </Button>
            }
          />

          {/* List display */}
          {loading ? (
            <Loader message="Loading products..." />
          ) : error ? (
            <ErrorState onRetry={loadProducts} description={error} />
          ) : products.length === 0 ? (
            <EmptyState title="No products configured" description="Your menu list is currently empty. Click Add Product to start." />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase">
                      <th className="p-4 pl-6">Image</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/50">
                        <td className="p-4 pl-6">
                          <div className="h-10 w-10 border border-gray-200 rounded-lg overflow-hidden relative bg-gray-50 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                            ) : (
                              <icons.productIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-900 font-bold">{product.name}</td>
                        <td className="p-4 font-bold text-gray-900">₹{product.price}</td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingProduct(product);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(product._id)}>
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
                {products.map((product) => (
                  <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 border border-gray-200 rounded-lg overflow-hidden relative bg-gray-50 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <icons.productIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{product.name}</h3>
                        <span className="text-xs text-gray-500 font-bold block mt-0.5">₹{product.price}</span>
                      </div>
                    </div>

                    <div className="space-x-1.5 flex">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-2.5 py-1 text-xs"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="px-2.5 py-1 text-xs"
                        onClick={() => setDeleteId(product._id)}
                      >
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
                setEditingProduct(null);
              }} 
              title={editingProduct ? "Modify Product Details" : "Add New Menu Item"}
              size="sm"
            >
              <ProductForm 
                product={editingProduct} 
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
            title="Delete Product Item"
            message="Are you sure you want to delete this product? It will be removed from POS choices."
            loading={deleteLoading}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function ProductsPage() {
  return (
    <NotificationProvider>
      <ProductsView />
    </NotificationProvider>
  );
}
