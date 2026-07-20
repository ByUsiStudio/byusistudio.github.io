import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { UiConfigProvider, useUiConfig } from './context/UiConfigContext';
import { HeadConfig } from './components/HeadConfig';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Projects } from './components/Projects';
import { Team } from './components/Team';

import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { CookieRecord } from './components/CookieRecord';
import { MouseFollower } from './components/MouseFollower';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchRepos } from './services/api';
import type { Repo } from './types/ui';
import './App.less';

function AppContent() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config, loading: configLoading } = useUiConfig();

  useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    setError(null);

    fetchRepos()
      .then((data) => {
        if (!cancelled) {
          setRepos(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = configLoading || dataLoading;

  if (!config) {
    return <div>配置加载失败</div>;
  }

  if (isLoading) {
    return (
      <div className="app-loading-overlay">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  const { layout } = config;

  return (
    <ThemeProvider>
      <div className="app-content-wrapper">
        <HeadConfig />
        <MouseFollower />
        <ScrollProgress />
        {layout.navbar.sticky && <Header />}
        {layout.hero.show && <Hero />}
        {layout.stats.show && <Stats repos={repos} loading={dataLoading} error={error} />}
        {layout.projects.show && <Projects repos={repos} loading={dataLoading} error={error} />}
        {layout.team.show && <Team />}
        
        {layout.footer.show && <Footer repos={repos} />}
        <BackToTop />
        <CookieRecord />
      </div>
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