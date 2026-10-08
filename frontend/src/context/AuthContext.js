'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const storedToken = api.getToken();
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        setToken(storedToken);

        const userId = res.data._id || res.data.id;
        const seenLocally = typeof window !== 'undefined' && localStorage.getItem(`roundcode_tour_seen_${userId}`);
        if (!res.data.hasSeenTour && !seenLocally) {
          setShouldStartTour(true);
        }
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch {
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (personalEmail, password) => {
    const res = await api.post('/auth/login', { personalEmail, password });
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      const userId = res.data.user._id || res.data.user.id;
      const seenLocally = typeof window !== 'undefined' && localStorage.getItem(`roundcode_tour_seen_${userId}`);
      if (res.data.isFirstLogin || (!res.data.user.hasSeenTour && !seenLocally)) {
        setShouldStartTour(true);
      }

      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      api.setToken(null);
      setToken(null);
      setUser(null);
      setShouldStartTour(false);
      router.push('/login');
    }
  };

  const openTour = () => {
    setShouldStartTour(true);
  };

  const skipTour = async () => {
    setShouldStartTour(false);
    if (!user) return;
    const userId = user._id || user.id;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`roundcode_tour_seen_${userId}`, 'true');
    }
    setUser((prev) => (prev ? { ...prev, hasSeenTour: true } : prev));
    try {
      await api.patch('/users/complete-tour');
    } catch (err) {
      console.error('Failed to complete tour on server:', err);
    }
  };

  const completeTour = async () => {
    await skipTour();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        setUser,
        isAdmin,
        isSuperAdmin,
        shouldStartTour,
        setShouldStartTour,
        openTour,
        skipTour,
        completeTour,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
