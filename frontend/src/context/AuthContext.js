'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { firebaseAuth } from '@/lib/firebase';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const router = useRouter();

  useEffect(() => onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (!firebaseUser) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.success ? res.data : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await api.post('/auth/firebase', { idToken });
      setUser(res.data.user);
      if (res.data.user.isFirstLogin || !res.data.user.hasSeenTour) setShouldStartTour(true);
    } catch (error) {
      console.error('Failed to establish application session:', error);
      await signOut(firebaseAuth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }), []);

  const login = (nextUser) => {
    setUser(nextUser);
    if (!nextUser.hasSeenTour) setShouldStartTour(true);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      await signOut(firebaseAuth);
    } finally {
      setUser(null);
      setShouldStartTour(false);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    if (res.success) setUser(res.data);
  };

  const skipTour = async () => {
    setShouldStartTour(false);
    await api.patch('/users/complete-tour');
    await refreshUser();
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, refreshUser, setUser, isAdmin, isSuperAdmin,
      shouldStartTour, setShouldStartTour, openTour: () => setShouldStartTour(true),
      skipTour, completeTour: skipTour,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
