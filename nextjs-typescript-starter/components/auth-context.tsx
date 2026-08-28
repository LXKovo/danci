'use client';

import { SessionProvider } from 'next-auth/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import AuthPopup from './AuthPopup';

type AuthContextValue = {
  isOpen: boolean;
  redirectTo: string;
  openAuth: (redirectTo?: string) => void;
  closeAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/');

  const openAuth = useCallback((to: string = '/') => {
    setRedirectTo(to);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 未登录访问受保护路由被重定向到 /mine?callbackUrl=... 时自动弹出登录框
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');
  useEffect(() => {
    if (!callbackUrl) return;
    openAuth(callbackUrl);
    // 清理 URL，避免重复弹出
    const url = new URL(window.location.href);
    url.searchParams.delete('callbackUrl');
    window.history.replaceState({}, '', url.toString());
  }, [callbackUrl, openAuth]);

  const value = useMemo(
    () => ({ isOpen, redirectTo, openAuth, closeAuth }),
    [isOpen, redirectTo, openAuth, closeAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      <SessionProvider session={session}>
        {children}
        {isOpen && <AuthPopup />}
      </SessionProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return ctx;
}
