
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from './types';

const AUTH_KEY = 'academia-role';

export function useAuth() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRole = sessionStorage.getItem(AUTH_KEY) as UserRole | null;
      setRole(storedRole);
    } catch (error) {
      console.error("Could not read from sessionStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole) => {
    try {
      sessionStorage.setItem(AUTH_KEY, role);
      setRole(role);
    } catch (error) {
      console.error("Could not write to sessionStorage", error);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      setRole(null);
    } catch (error) {
      console.error("Could not remove from sessionStorage", error);
    }
  };

  return { role, login, logout, isLoading };
}
