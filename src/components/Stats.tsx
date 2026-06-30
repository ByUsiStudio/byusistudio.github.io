import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';
import type { Repo } from '../types/ui';

interface StatsProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
}

export function Stats({ repos }: StatsProps) {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const { stats: statsConfig } = config.layout;

  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeRepos = repos.filter((repo) => new Date(repo.updated_at) > thirtyDaysAgo).length;

  const valueMap: Record<string, string | number> = {
    totalRepos,
    totalStars: totalStars.toLocaleString(),
    totalForks: totalForks.toLocaleString(),
    activeRepos,
  };

  return (
    <section id="stats" className="section">
      <div className="layui-container">
        <div className="stats-container">
          {statsConfig.cards.map((card) => (
            <div key={card.key} className="stat-card">
              <div className="stat-number">{valueMap[card.key] ?? 0}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: ${theme['card-bg']};
          border-radius: 8px;
          padding: 25px;
          box-shadow: ${theme.shadow};
          text-align: center;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 700;
          color: ${theme.primary};
          margin-bottom: 10px;
        }

        .stat-label {
          color: ${theme['dark-gray']};
          font-size: 14px;
        }

        @media (max-width: 992px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
