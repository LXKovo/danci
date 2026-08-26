"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Role = "super-admin" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const USERS_KEY = "danci:users";
const SESSION_KEY = "danci:session";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function hash(input: string): string {
  // 轻量级 mock 哈希：真实项目应使用服务端加密存储
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return String(h >>> 0);
}

export type AuthError = string | null;

interface AuthContextValue {
  user: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => AuthError;
  addAdmin: (input: {
    name: string;
    email: string;
    password: string;
  }) => AuthError;
  removeAdmin: (id: string) => void;
  signOut: () => void;
  admins: User[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 首次加载时，如果没有任何管理员，预置默认超级管理员
    const existing = read<User[]>(USERS_KEY, []);
    if (existing.length === 0) {
      const defaultAdmin: User = {
        id: "super-admin-default",
        name: "超级管理员",
        email: "admin@danci.com",
        passwordHash: hash("admin123"),
        role: "super-admin",
        createdAt: new Date().toISOString(),
      };
      write(USERS_KEY, [defaultAdmin]);
      setAdmins([defaultAdmin]);
    } else {
      setAdmins(existing);
    }
    setUser(read<Session | null>(SESSION_KEY, null));
    setLoading(false);
  }, []);

  const persistAdmins = useCallback((next: User[]) => {
    setAdmins(next);
    write(USERS_KEY, next);
  }, []);

  const signIn = useCallback(
    (email: string, password: string): AuthError => {
      const list = read<User[]>(USERS_KEY, []);
      const found = list.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!found || found.passwordHash !== hash(password)) {
        return "邮箱或密码不正确";
      }
      const session: Session = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
      };
      setUser(session);
      write(SESSION_KEY, session);
      return null;
    },
    []
  );

  const addAdmin = useCallback(
    ({ name, email, password }: { name: string; email: string; password: string }): AuthError => {
      const list = read<User[]>(USERS_KEY, []);
      const normalized = email.trim().toLowerCase();
      if (list.some((u) => u.email.toLowerCase() === normalized)) {
        return "该邮箱已注册";
      }
      const nextUser: User = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        passwordHash: hash(password),
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      persistAdmins([...list, nextUser]);
      return null;
    },
    [persistAdmins]
  );

  const removeAdmin = useCallback(
    (id: string) => {
      const list = read<User[]>(USERS_KEY, []);
      persistAdmins(list.filter((u) => u.id !== id));
    },
    [persistAdmins]
  );

  const signOut = useCallback(() => {
    setUser(null);
    write(SESSION_KEY, null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, addAdmin, removeAdmin, signOut, admins }),
    [user, loading, signIn, addAdmin, removeAdmin, signOut, admins]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}