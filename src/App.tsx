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
import { fetchRepos } from './services/api';
import type { Repo } from './types/ui';
import './App.css';

function AppContent() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config, loading: configLoading } = useUiConfig();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRepos()
      .then((data) => {
        if (!cancelled) {
          setRepos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '未知错误');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (configLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!config) {
    return <div>配置加载失败</div>;
  }

  const { layout } = config;

  return (
    <ThemeProvider>
      <HeadConfig />
      {layout.navbar.sticky && <Header />}
      {layout.hero.show && <Hero />}
      {layout.stats.show && <Stats repos={repos} loading={loading} error={error} />}
      {layout.projects.show && <Projects repos={repos} loading={loading} error={error} />}
      {layout.team.show && <Team />}
      {layout.footer.show && <Footer repos={repos} />}
    </ThemeProvider>
  );
}

function App() {
  return (
    <UiConfigProvider>
      <AppContent />
    </UiConfigProvider>
  );
}

export default App;
