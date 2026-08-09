import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../common/Loader';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      
      // If roles list is specified and user's role is not allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(parsedUser.role)) {
        if (parsedUser.role === 'employee') {
          router.push('/sales');
        } else {
          router.push('/dashboard');
        }
        return;
      }
      
      setAuthorized(true);
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  }, [router, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader message="Verifying access..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
