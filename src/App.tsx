import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { UiConfigProvider } from './context/UiConfigContext';
import { useUiConfig } from './context/uiConfig';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchRepos, fetchGithubRepos } from './services/api';
import { loadGithubConfig } from './services/config';
import type { GithubConfig } from './services/config';
import type { Repo } from './types/ui';
import './App.less';

/** 首次访问全屏加载标记（仅展示一次，之后访问直接进入页面） */
const SPLASH_KEY = 'byusi_seen_splash';
const SPLASH_SHOW_MS = 1300;
const SPLASH_FADE_MS = 650; // 与 .app-loading-overlay.fade-out 时长一致

function hasSeenSplash(): boolean {
  try {
    return localStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    localStorage.setItem(SPLASH_KEY, '1');
  } catch {
    // ignore（隐私模式等场景）
  }
}

type SplashState = 'show' | 'fade' | 'done';

function AppContent() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // GitHub 分区：开关在 config.json 的 github 字段
  const [githubConfig, setGithubConfig] = useState<GithubConfig | null>(null);
  const [githubReady, setGithubReady] = useState(false);
  const [githubRepos, setGithubRepos] = useState<Repo[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubTick, setGithubTick] = useState(0);

  // 全屏加载：仅首次访问展示
  const isFirstVisitRef = useRef<boolean>(!hasSeenSplash());
  const [splashState, setSplashState] = useState<SplashState>(() =>
    isFirstVisitRef.current ? 'show' : 'done',
  );

  const { config, loading: configLoading } = useUiConfig();

  useEffect(() => {
    if (!isFirstVisitRef.current) return;
    markSplashSeen();
    const fadeTimer = window.setTimeout(() => setSplashState('fade'), SPLASH_SHOW_MS);
    const hideTimer = window.setTimeout(
      () => setSplashState('done'),
      SPLASH_SHOW_MS + SPLASH_FADE_MS,
    );
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReposLoading(true);
    setReposError(null);

    fetchRepos()
      .then((data) => {
        if (!cancelled) setRepos(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setReposError(err instanceof Error ? err.message : '未知错误');
        }
      })
      .finally(() => {
        if (!cancelled) setReposLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const retryRepos = useCallback(() => {
    setReposLoading(true);
    setReposError(null);
    setReloadTick((tick) => tick + 1);
  }, []);

  // 读取 GitHub 开关（仅一次）
  useEffect(() => {
    let cancelled = false;
    loadGithubConfig()
      .then((cfg) => {
        if (!cancelled) {
          setGithubConfig(cfg);
          setGithubReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGithubConfig(null);
          setGithubReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 开启 GitHub 时拉取仓库
  useEffect(() => {
    if (!githubReady || !githubConfig) return;
    let cancelled = false;
    setGithubLoading(true);
    setGithubError(null);

    fetchGithubRepos(githubConfig)
      .then((data) => {
        if (!cancelled) setGithubRepos(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setGithubError(err instanceof Error ? err.message : '未知错误');
        }
      })
      .finally(() => {
        if (!cancelled) setGithubLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [githubReady, githubConfig, githubTick]);

  const retryGithub = useCallback(() => {
    setGithubLoading(true);
    setGithubError(null);
    setGithubTick((tick) => tick + 1);
  }, []);

  // 全屏层：首次访问期间展示；非首次仅当 ui.json 尚未就绪时短暂兜底
  const showOverlay = splashState !== 'done' || !config;

  return (
    <>
      {showOverlay && (
        <div className={`app-loading-overlay ${splashState === 'fade' ? 'fade-out' : ''}`}>
          <div className="loading-spinner" />
          <p>{isFirstVisitRef.current ? '欢迎来到 ByUsi Studio' : '加载中...'}</p>
        </div>
      )}
      {config ? (
        <ThemeProvider>
          <Layout
            config={config}
            repos={repos}
            reposLoading={reposLoading}
            reposError={reposError}
            onRetryRepos={retryRepos}
            githubEnabled={githubReady && githubConfig !== null}
            githubRepos={githubRepos}
            githubLoading={githubLoading}
            githubError={githubError}
            onRetryGithub={retryGithub}
          />
        </ThemeProvider>
      ) : configLoading ? null : (
        <div>配置加载失败</div>
      )}
    </>
  );
}

function App() {
  return (
    <UiConfigProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </UiConfigProvider>
  );
}

export default App;
