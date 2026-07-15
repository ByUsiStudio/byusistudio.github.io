import { useState, useEffect, useCallback, useRef } from 'react';

// Cookie 记录数据结构（纯客户端，服务器不记录）
export interface CookieRecord {
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  ip: string;
  ipFetchedAt: string;
}

export type IpStatus = 'idle' | 'loading' | 'success' | 'error';

const COOKIE_KEY = 'byusi_visit_record';
const COOKIE_EXPIRES_DAYS = 365;
// IP 缓存有效期（毫秒）：24 小时内复用缓存，避免每次访问都请求
const IP_CACHE_TTL = 24 * 60 * 60 * 1000;
// 单个请求超时时间
const IP_FETCH_TIMEOUT = 6000;

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
        ipFetchedAt: typeof data.ipFetchedAt === 'string' ? data.ipFetchedAt : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 带超时的 fetch
function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// IP 提供商列表（不同解析路径，多源容错）
const IP_PROVIDERS: Array<{ url: string; extract: (data: any) => string }> = [
  { url: 'https://api.ipify.org?format=json', extract: (d) => d.ip },
  { url: 'https://ipwho.is/', extract: (d) => d.ip },
  { url: 'https://api.ip.sb/jsonip', extract: (d) => d.ip },
  { url: 'https://jsonip.com', extract: (d) => d.ip },
  { url: 'https://ipapi.co/json/', extract: (d) => d.ip },
];

// 手动实现「首胜」语义：任一 promise fulfilled 即 resolve；
// 全部 rejected 则 resolve 空串（避免依赖 Promise.any 的 target 要求）
function firstFulfilled(promises: Promise<string>[]): Promise<string> {
  return new Promise((resolve) => {
    let pending = promises.length;
    if (pending === 0) {
      resolve('');
      return;
    }
    let settled = false;
    promises.forEach((p) => {
      p.then((val) => {
        if (!settled && val) {
          settled = true;
          resolve(val);
        }
      }).catch(() => {
        // 忽略单个失败
      }).finally(() => {
        pending -= 1;
        if (pending === 0 && !settled) {
          resolve('');
        }
      });
    });
  });
}

// 通过多个公共 API 竞速获取 IP（服务器不记录），取最快成功者
async function fetchClientIp(): Promise<string> {
  const tasks = IP_PROVIDERS.map(async ({ url, extract }) => {
    const res = await fetchWithTimeout(url, IP_FETCH_TIMEOUT);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const ip = extract(data);
    if (!ip || typeof ip !== 'string') throw new Error('无效 IP');
    return ip;
  });

  return firstFulfilled(tasks);
}

// 判断缓存 IP 是否仍新鲜
function isIpFresh(fetchedAt: string): boolean {
  if (!fetchedAt) return false;
  const ts = new Date(fetchedAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < IP_CACHE_TTL;
}

export function useCookieRecord(): {
  record: CookieRecord | null;
  ipStatus: IpStatus;
  refreshIp: () => void;
  clearRecord: () => void;
} {
  const [record, setRecord] = useState<CookieRecord | null>(null);
  const [ipStatus, setIpStatus] = useState<IpStatus>('idle');
  const cancelledRef = useRef(false);

  // 拉取 IP 并写入记录
  const requestIp = useCallback(() => {
    setIpStatus('loading');
    fetchClientIp().then((ip) => {
      if (cancelledRef.current) return;
      if (!ip) {
        setIpStatus('error');
        return;
      }
      setIpStatus('success');
      setRecord((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ip, ipFetchedAt: new Date().toISOString() };
        setCookie(COOKIE_KEY, JSON.stringify(updated), COOKIE_EXPIRES_DAYS);
        return updated;
      });
    });
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    const now = new Date().toISOString();
    const existing = parseRecord(getCookie(COOKIE_KEY));

    // 先写入基础记录并展示
    const baseRecord: CookieRecord = existing
      ? {
          visitCount: existing.visitCount + 1,
          firstVisit: existing.firstVisit,
          lastVisit: now,
          ip: existing.ip,
          ipFetchedAt: existing.ipFetchedAt,
        }
      : {
          visitCount: 1,
          firstVisit: now,
          lastVisit: now,
          ip: '',
          ipFetchedAt: '',
        };

    setCookie(COOKIE_KEY, JSON.stringify(baseRecord), COOKIE_EXPIRES_DAYS);
    setRecord(baseRecord);

    // 缓存新鲜则直接复用，否则拉取
    if (baseRecord.ip && isIpFresh(baseRecord.ipFetchedAt)) {
      setIpStatus('success');
    } else {
      requestIp();
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [requestIp]);

  const refreshIp = useCallback(() => {
    requestIp();
  }, [requestIp]);

  const clearRecord = useCallback(() => {
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    const now = new Date().toISOString();
    const fresh: CookieRecord = {
      visitCount: 1,
      firstVisit: now,
      lastVisit: now,
      ip: '',
      ipFetchedAt: '',
    };
    setCookie(COOKIE_KEY, JSON.stringify(fresh), COOKIE_EXPIRES_DAYS);
    setRecord(fresh);
    requestIp();
  }, [requestIp]);

  return { record, ipStatus, refreshIp, clearRecord };
}
