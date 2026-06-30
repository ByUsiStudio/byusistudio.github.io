import { useTheme } from '../context/ThemeContext';
import { useUiConfig } from '../context/UiConfigContext';

export function Team() {
  const { theme } = useTheme();
  const { config } = useUiConfig();

  if (!config) return null;

  const { team } = config.layout;

  return (
    <section id="team" className="section">
      <div className="layui-container">
        <h2 className="section-title">{team.title}</h2>
        <div className="team-grid">
          {team.items.map((item, index) => (
            <div key={index} className="team-card">
              <div style={{ fontSize: '40px', color: theme.primary, marginBottom: '15px' }}>
                <i className={item.icon}></i>
              </div>
              <h3 style={{ marginBottom: '15px' }}>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        #team {
          background: ${theme['light-gray']};
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .team-card {
          background: ${theme['card-bg']};
          border-radius: 8px;
          padding: 25px;
          box-shadow: ${theme.shadow};
          text-align: center;
        }

        .team-card h3 {
          color: ${theme.secondary};
        }

        .team-card p {
          color: ${theme['dark-gray']};
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
