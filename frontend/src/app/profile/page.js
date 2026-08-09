"use client";
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../component/layout/ProtectedRoute';
import MainLayout from '../../component/layout/MainLayout';
import { useNotification, NotificationProvider } from '../../component/common/Notification';
import { Loader, ErrorState, PageHeader } from '../../component/common';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      // Load user profile details from localStorage or direct call.
      // Since localStorage caches user login details, we retrieve it directly,
      // which is clean and completely reliable since it contains name, email, role.
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setProfile(JSON.parse(storedUser));
      } else {
        throw new Error('No user profile session details found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'employee']}>
      <MainLayout>
        <div className="space-y-6 max-w-xl">
          {/* Header */}
          <PageHeader
            title="My Profile"
            subtitle="View your user credentials and permissions configuration"
          />

          {loading ? (
            <Loader message="Loading profile..." />
          ) : error ? (
            <ErrorState onRetry={fetchProfile} description={error} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-amber-800 flex items-center justify-center text-white font-bold text-xl">
                  {profile.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                  <span className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded capitalize">
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">User ID</span>
                  <span className="font-bold text-gray-800 text-xs select-all">{profile._id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Email Address</span>
                  <span className="font-bold text-gray-800">{profile.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Security Role</span>
                  <span className="font-bold text-gray-800 capitalize">{profile.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
