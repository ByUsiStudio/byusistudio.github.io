import { HeadConfig } from './HeadConfig';
import { Header } from './Header';
import { Hero } from './Hero';
import { Stats } from './Stats';
import { Projects } from './Projects';
import { Team } from './Team';
import { Hitokoto } from './Hitokoto';
import { Footer } from './Footer';
import { ScrollProgress } from './ScrollProgress';
import { BackToTop } from './BackToTop';
import { CookieRecord } from './CookieRecord';
import { MouseFollower } from './MouseFollower';
import type { Repo, UiConfig } from '../types/ui';

interface LayoutProps {
  config: UiConfig;
  repos: Repo[];
  reposLoading: boolean;
  reposError: string | null;
}

export function Layout({ config, repos, reposLoading, reposError }: LayoutProps) {
  const layout = config.layout ?? {};
  const navbar = layout.navbar ?? { sticky: false };
  const hero = layout.hero ?? { show: false };
  const hitokoto = layout.hitokoto ?? { show: false };
  const stats = layout.stats ?? { show: false };
  const projects = layout.projects ?? { show: false };
  const team = layout.team ?? { show: false };
  const footer = layout.footer ?? { show: false };

  return (
    <div className="app-content-wrapper">
      <HeadConfig />
      <MouseFollower />
      <ScrollProgress />
      {navbar.sticky && <Header />}
      {hero.show && <Hero />}
      {hitokoto.show && <Hitokoto />}
      {stats.show && <Stats repos={repos} loading={reposLoading} error={reposError} />}
      {projects.show && <Projects repos={repos} loading={reposLoading} error={reposError} />}
      {team.show && <Team />}
      {footer.show && <Footer repos={repos} />}
      <BackToTop />
      <CookieRecord />
    </div>
  );
}
