import { useState, useEffect, useCallback } from 'react';

// Cookie 记录数据结构（纯客户端，服务器不记录）
export interface CookieRecord {
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  ip: string;
}

const COOKIE_KEY = 'byusi_visit_record';
const COOKIE_EXPIRES_DAYS = 365;

// 读取单个 cookie 值
function getCookie(name: string): string | null {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(valueParts.join('='));
    }
  }
  return null;
}

// 写入 cookie（仅客户端，不发送到服务端逻辑，path 限定为当前站点）
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  // SameSite=Lax 提升安全性，path=/ 全站可用
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// 解析记录
function parseRecord(raw: string | null): CookieRecord | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (
      typeof data.visitCount === 'number' &&
      typeof data.firstVisit === 'string' &&
      typeof data.lastVisit === 'string'
    ) {
      return {
        visitCount: data.visitCount,
        firstVisit: data.firstVisit,
        lastVisit: data.lastVisit,
        ip: typeof data.ip === 'string' ? data.ip : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 通过公共 API 客户端获取 IP（服务器不记录）
async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return '';
    const data = await res.json();
    return typeof data.ip === 'string' ? data.ip : '';
  } catch {
    return '';
  }
}

export function useCookieRecord(): {
  record: CookieRecord | null;
  clearRecord: () => void;
} {
  const [record, setRecord] = useState<CookieRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date().toISOString();
    const existing = parseRecord(getCookie(COOKIE_KEY));

    // 先写入基础记录并展示（IP 异步补充）
    const baseRecord: CookieRecord = existing
      ? {
          visitCount: existing.visitCount + 1,
          firstVisit: existing.firstVisit,
          lastVisit: now,
          ip: existing.ip,
        }
      : {
          visitCount: 1,
          firstVisit: now,
          lastVisit: now,
          ip: '',
        };

    setCookie(COOKIE_KEY, JSON.stringify(baseRecord), COOKIE_EXPIRES_DAYS);
    setRecord(baseRecord);

    // 客户端获取 IP 并补充写入 Cookie
    fetchClientIp().then((ip) => {
      if (cancelled || !ip) return;
      setRecord((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ip };
        setCookie(COOKIE_KEY, JSON.stringify(updated), COOKIE_EXPIRES_DAYS);
        return updated;
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const clearRecord = useCallback(() => {
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    const now = new Date().toISOString();
    const fresh: CookieRecord = {
      visitCount: 1,
      firstVisit: now,
      lastVisit: now,
      ip: '',
    };
    setCookie(COOKIE_KEY, JSON.stringify(fresh), COOKIE_EXPIRES_DAYS);
    setRecord(fresh);

    // 清除后重新获取 IP
    fetchClientIp().then((ip) => {
      if (!ip) return;
      setRecord((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ip };
        setCookie(COOKIE_KEY, JSON.stringify(updated), COOKIE_EXPIRES_DAYS);
        return updated;
      });
    });
  }, []);

  return { record, clearRecord };
}
