import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { UiConfigProvider } from './context/UiConfigContext';
import { useUiConfig } from './context/uiConfig';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchRepos } from './services/api';
import type { Repo } from './types/ui';
import './App.less';

function AppContent() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);
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
      <Layout config={config} repos={repos} reposLoading={reposLoading} reposError={reposError} />
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
