import { useState, useCallback } from 'react';
import { HeadConfig } from './HeadConfig';
import { Header } from './Header';
import { Hero } from './Hero';
import { Stats } from './Stats';
import { Projects } from './Projects';
import { GithubProjects } from './GithubProjects';
import { ActivityFeed } from './ActivityFeed';
import { Team } from './Team';
import { Hitokoto } from './Hitokoto';
import { Footer } from './Footer';
import { ScrollProgress } from './ScrollProgress';
import { ScrollReveal } from './ScrollReveal';
import { BackToTop } from './BackToTop';
import { CookieRecord } from './CookieRecord';
import { MouseFollower } from './MouseFollower';
import { CommandPalette } from './CommandPalette';
import { ConfigUpdateBanner } from './ConfigUpdateBanner';
import { ReadmeModal } from './ReadmeModal';
import { fetchReadme } from '../services/api';
import { useRecentRepos } from '../hooks/useRecentRepos';
import type { Repo, UiConfig } from '../types/ui';

interface LayoutProps {
  config: UiConfig;
  repos: Repo[];
  reposLoading: boolean;
  reposError: string | null;
  onRetryRepos: () => void;
  githubEnabled: boolean;
  githubRepos: Repo[];
  githubLoading: boolean;
  githubError: string | null;
  onRetryGithub: () => void;
}

export function Layout({
  config,
  repos,
  reposLoading,
  reposError,
  onRetryRepos,
  githubEnabled,
  githubRepos,
  githubLoading,
  githubError,
  onRetryGithub,
}: LayoutProps) {
  const layout = config.layout ?? {};
  const navbar = layout.navbar ?? { sticky: false };
  const hero = layout.hero ?? { show: false };
  const hitokoto = layout.hitokoto ?? { show: false };
  const stats = layout.stats ?? { show: false };
  const projects = layout.projects ?? { show: false };
  const activity = layout.activity ?? { show: false };
  const team = layout.team ?? { show: false };
  const footer = layout.footer ?? { show: false };

  // README 弹窗与最近访问上移到布局层统一管理，
  // 供 Projects / 最近访问 / 最近动态 / 命令面板共用。
  const { recentIds, recordRecent, removeRecent, clearRecent } = useRecentRepos();
  const [readmeRepo, setReadmeRepo] = useState<Repo | null>(null);
  const [readmeOpenTime, setReadmeOpenTime] = useState(0);

  const openReadme = useCallback(
    (repo: Repo) => {
      recordRecent(repo.full_name);
      setReadmeOpenTime(Date.now());
      setReadmeRepo(repo);
    },
    [recordRecent],
  );

  return (
    <div className="app-content-wrapper">
      <HeadConfig />
      <ScrollReveal />
      <MouseFollower />
      <ScrollProgress />
      {navbar.sticky && <Header />}
      {hero.show && <Hero />}
      {hitokoto.show && <Hitokoto />}
      {stats.show && (
        <Stats repos={repos} loading={reposLoading} error={reposError} onRetry={onRetryRepos} />
      )}
      {projects.show && (
        <Projects
          repos={repos}
          loading={reposLoading}
          error={reposError}
          onRetry={onRetryRepos}
          recentIds={recentIds}
          removeRecent={removeRecent}
          clearRecent={clearRecent}
          onOpenReadme={openReadme}
        />
      )}
      {githubEnabled && (
        <GithubProjects
          repos={githubRepos}
          loading={githubLoading}
          error={githubError}
          onRetry={onRetryGithub}
        />
      )}
      {activity.show && <ActivityFeed repos={repos} onOpen={openReadme} />}
      {team.show && <Team />}
      {footer.show && <Footer repos={repos} />}
      <BackToTop />
      <CookieRecord />
      <CommandPalette repos={repos} onOpen={openReadme} />
      <ConfigUpdateBanner />
      {readmeRepo && (
        <ReadmeModal
          key={readmeOpenTime}
          repoName={readmeRepo.name}
          repoFullName={readmeRepo.full_name}
          repoUrl={readmeRepo.html_url}
          onFetch={fetchReadme}
          onClose={() => setReadmeRepo(null)}
        />
      )}
    </div>
  );
}
