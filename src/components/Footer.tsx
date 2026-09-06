import { useState, useEffect } from 'react';
import { useUiConfig } from '../context/uiConfig';
import { loadBeianConfig } from '../services/config';
import type { BeianDisplay } from '../services/config';
import type { Repo } from '../types/ui';

interface FooterProps {
  repos: Repo[];
}

export function Footer({ repos }: FooterProps) {
  const { config } = useUiConfig();
  const [beian, setBeian] = useState<BeianDisplay | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadBeianConfig()
      .then((value) => {
        if (!cancelled) setBeian(value);
      })
      .catch(() => {
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) return null;

  const footer = config.layout?.footer;
  if (!footer) return null;
  const footerLinks = footer.columns || [];

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
                {(column.links || []).map((link, linkIndex) => (
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
          {beian && (beian.icpText || beian.policeText) && (
            <div className="footer-beian">
              {beian.icpText &&
                (beian.icpUrl ? (
                  <a href={beian.icpUrl} target="_blank" rel="noopener noreferrer">
                    {beian.icpText}
                  </a>
                ) : (
                  <span>{beian.icpText}</span>
                ))}
              {beian.icpText && beian.policeText && <span className="footer-beian-sep">|</span>}
              {beian.policeText &&
                (beian.policeUrl ? (
                  <a href={beian.policeUrl} target="_blank" rel="noopener noreferrer">
                    {beian.policeText}
                  </a>
                ) : (
                  <span>{beian.policeText}</span>
                ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
