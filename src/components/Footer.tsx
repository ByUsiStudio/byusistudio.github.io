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
    </footer>
  );
}