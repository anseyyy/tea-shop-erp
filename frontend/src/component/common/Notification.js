import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border animate-slide-in max-w-sm
          bg-white border-gray-150"
        >
          {notification.type === 'success' ? (
            <FiCheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
          ) : (
            <FiAlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-700 mr-8">{notification.message}</span>
          <button 
            onClick={clearNotification}
            className="text-gray-400 hover:text-gray-500 rounded p-0.5 transition-colors absolute right-3"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
