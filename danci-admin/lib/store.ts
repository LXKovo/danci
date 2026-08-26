"use client";

import { useCallback, useEffect, useState } from "react";

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

/**
 * 将值持久化到 localStorage 的通用 hook。
 * 用于单词书、管理员等 mock 数据存储。
 */
export function usePersistedState<T>(
  key: string,
  seed: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => read(key, typeof seed === "function" ? (seed as () => T)() : seed));

  useEffect(() => {
    write(key, state);
  }, [key, state]);

  return [state, setState];
}

/** 读取一条前端 mock 列表，供非 hook 场景（如登录）使用 */
export function readList<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

export { read, write };