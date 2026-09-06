import { useState, useEffect, useCallback } from 'react';
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

  const { config, loading: configLoading } = useUiConfig();

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

  // 首屏只等待同源的 ui.json；仓库数据异步到达，
  // 由 Stats/Projects 各自的骨架屏承接，避免整页白屏等待慢速 API。
  const isLoading = configLoading;

  if (!config) {
    return <div>配置加载失败</div>;
  }

  if (isLoading) {
    return (
      <div className="app-loading-overlay">
        <div className="loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  return (
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
