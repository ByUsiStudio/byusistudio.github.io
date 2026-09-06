import { useState, useEffect, useCallback } from 'react';
import { useUiConfig } from '../context/uiConfig';
import { useTheme } from '../context/theme';

const CHECK_INTERVAL_MS = 120000; // 每 2 分钟检查一次
const SEEN_VERSION_KEY = 'byusi_ui_version_seen';

async function readRemoteConfigVersion(): Promise<number | null> {
  try {
    const response = await fetch(`/ui.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { head?: { configVersion?: number } };
    const version = data.head?.configVersion;
    return typeof version === 'number' && Number.isFinite(version) ? version : null;
  } catch {
    return null;
  }
}

/**
 * 配置热更新提示：ui.json 增加 head.configVersion 后，
 * 本地记录的版本与线上不一致（或轮询发现变化）时提示刷新。
 */
export function ConfigUpdateBanner() {
  const { config } = useUiConfig();
  const { theme } = useTheme();
  const [outdated, setOutdated] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<number | null>(null);

  const applyVersion = useCallback((version: number) => {
    try {
      localStorage.setItem(SEEN_VERSION_KEY, String(version));
    } catch {
      // ignore
    }
    setOutdated(false);
    setPendingVersion(null);
  }, []);

  useEffect(() => {
    const version = config?.head?.configVersion;
    if (!version || typeof version !== 'number') return;

    let seen: number | null = null;
    try {
      const raw = localStorage.getItem(SEEN_VERSION_KEY);
      const parsed = raw ? Number(raw) : null;
      seen = parsed !== null && Number.isFinite(parsed) ? parsed : null;
    } catch {
      // ignore
    }

    if (seen === null) {
      applyVersion(version);
      return;
    }

    if (seen !== version) {
      setPendingVersion(version);
      setOutdated(true);
      return;
    }

    let cancelled = false;
    const check = async () => {
      const remote = await readRemoteConfigVersion();
      if (cancelled || remote === null) return;
      if (remote !== seen) {
        setPendingVersion(remote);
        setOutdated(true);
      }
    };

    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [config, applyVersion]);

  if (!outdated) return null;

  return (
    <div
      className="config-update-banner"
      role="status"
      style={
        {
          '--primary': theme.primary,
          '--dark-gray': theme['dark-gray'],
        } as React.CSSProperties
      }
    >
      <i className="fas fa-sync-alt"></i>
      <span>
        站点配置已更新
        {pendingVersion !== null ? `（v${pendingVersion}）` : ''}，刷新后生效
      </span>
      <button type="button" className="config-update-btn" onClick={() => window.location.reload()}>
        立即刷新
      </button>
      <button
        type="button"
        className="config-update-dismiss"
        aria-label="稍后再说"
        title="稍后再说"
        onClick={() => {
          if (pendingVersion !== null) applyVersion(pendingVersion);
          else setOutdated(false);
        }}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
