import { useUiConfig } from '../context/UiConfigContext';
import type { Repo } from '../types/ui';

interface FooterProps {
  repos: Repo[];
}

export function Footer({ repos }: FooterProps) {
  const { config } = useUiConfig();

  if (!config) return null;

  const { footer } = config.layout;
  const footerLinks = footer.columns;

  const handleLinkClick = (href: string, external?: boolean) => {
    if (!external && href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="layui-container">
        <div className="footer-links">
          {footerLinks.map((column, index) => (
            <div key={index} className="footer-column">
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      onClick={(e) => {
                        if (!link.external) {
                          e.preventDefault();
                          handleLinkClick(link.href);
                        }
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>
            {footer.copyright}. {repos.length}个开源项目 | {footer.subtitle}
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: #1a1a2e;
          color: white;
          padding: 60px 0 30px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .footer-column h4 {
          margin-bottom: 20px;
          font-size: 16px;
          font-weight: 600;
        }

        .footer-column ul {
          list-style: none;
          padding: 0;
        }

        .footer-column li {
          margin-bottom: 10px;
        }

        .footer-column a {
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 30px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
      `}</style>
    </footer>
  );
}
