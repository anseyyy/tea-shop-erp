"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { productAPI, salesAPI } from '../../api/apiService';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Button, Loader, ErrorState, EmptyState } from '../../component/common';
import { icons } from '../../constData';
import ProductCard from '../../component/products/ProductCard';

function SalesPOS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing.quantity === 1) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      await salesAPI.createSale({ items: cart });
      showNotification('Sale completed successfully!', 'success');
      setCart([]);
    } catch (err) {
      showNotification(err.message || 'Failed to submit sale', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <MainLayout>
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
          {/* Products Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
              <h2 className="text-lg font-bold text-gray-900">Menu / Items</h2>
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <icons.searchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>

            {loading ? (
              <Loader message="Loading items..." />
            ) : error ? (
              <ErrorState onRetry={loadProducts} description={error} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState title="No products found" description="Try searching for another item or add new products." />
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 content-start">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.productId === product._id);
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      cartItem={cartItem}
                      onAdd={() => addToCart(product)}
                      onRemove={() => removeFromCart(product._id)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart / Billing Panel */}
          <div className="w-full lg:w-96 flex flex-col bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[300px] lg:h-full">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <span>Current Bill</span>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])}
                  className="text-xs text-gray-400 hover:text-red-500 font-semibold"
                >
                  Clear All
                </button>
              )}
            </h2>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <icons.salesIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Cart is empty. Select items to checkout.</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                {/* Cart Items list */}
                <div className="flex-1 overflow-y-auto pr-2 divide-y divide-gray-150 space-y-1 pb-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{item.name}</span>
                        <div className="text-gray-400 mt-0.5">₹{item.price} each</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-gray-600 border border-gray-300 rounded p-1 transition-colors"
                          >
                            <icons.minusIcon className="h-2.5 w-2.5" />
                          </button>
                          <span className="font-bold text-gray-800 min-w-[12px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="text-gray-400 hover:text-gray-600 border border-gray-300 rounded p-1 transition-colors"
                          >
                            <icons.plusIcon className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900 w-12 text-right">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{getCartTotal()}</span>
                  </div>
                  <div className="flex items-center justify-between text-base border-t border-dashed border-gray-150 pt-3">
                    <span className="font-bold text-gray-900">Total Bill</span>
                    <span className="font-black text-amber-800 text-lg">₹{getCartTotal()}</span>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full text-base py-3"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? 'Submitting...' : 'CONFIRM SALE'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function SalesPage() {
  return (
    <NotificationProvider>
      <SalesPOS />
    </NotificationProvider>
  );
}
