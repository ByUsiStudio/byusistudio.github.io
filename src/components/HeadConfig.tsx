import { useEffect } from 'react';
import { useUiConfig } from '../context/UiConfigContext';

interface StylesheetConfig {
  href: string;
  integrity?: string;
  crossorigin?: string;
  referrerpolicy?: string;
}

interface PreloadConfig {
  href: string;
  as: string;
  type?: string;
}

interface HeadConfigType {
  lang: string;
  charset: string;
  viewport: string;
  title: string;
  favicon: {
    href: string;
    type: string;
  };
  stylesheets: StylesheetConfig[];
  preconnect: string[];
  preload: PreloadConfig[];
}

export function HeadConfig() {
  const { config } = useUiConfig();

  useEffect(() => {
    if (!config) return;

    const head = config.head as HeadConfigType;

    // lang
    document.documentElement.lang = head.lang;

    // charset
    const metaCharset = document.querySelector('meta[charset]');
    if (metaCharset) metaCharset.setAttribute('charset', head.charset);
    else {
      const meta = document.createElement('meta');
      meta.setAttribute('charset', head.charset);
      document.head.prepend(meta);
    }

    // viewport
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.setAttribute('name', 'viewport');
      document.head.appendChild(metaViewport);
    }
    metaViewport.setAttribute('content', head.viewport);

    // title
    document.title = head.title;

    // favicon
    let linkFavicon = document.querySelector('link[rel*="icon"]');
    if (!linkFavicon) {
      linkFavicon = document.createElement('link');
      linkFavicon.setAttribute('rel', 'icon');
      document.head.appendChild(linkFavicon);
    }
    linkFavicon.setAttribute('href', head.favicon.href);
    linkFavicon.setAttribute('type', head.favicon.type);

    // stylesheets
    document.querySelectorAll('link[data-ui-managed]').forEach((el) => el.remove());
    head.stylesheets.forEach((sheet) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', sheet.href);
      link.setAttribute('data-ui-managed', 'true');
      if (sheet.integrity) link.setAttribute('integrity', sheet.integrity);
      if (sheet.crossorigin) link.setAttribute('crossorigin', sheet.crossorigin);
      if (sheet.referrerpolicy) link.setAttribute('referrerpolicy', sheet.referrerpolicy);
      document.head.appendChild(link);
    });

    // preconnect
    document.querySelectorAll('link[data-preconnect]').forEach((el) => el.remove());
    head.preconnect.forEach((href) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preconnect');
      link.setAttribute('href', href);
      link.setAttribute('data-preconnect', 'true');
      document.head.appendChild(link);
    });

    // preload
    document.querySelectorAll('link[data-preload]').forEach((el) => el.remove());
    head.preload.forEach((item) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preload');
      link.setAttribute('href', item.href);
      link.setAttribute('as', item.as);
      if (item.type) link.setAttribute('type', item.type);
      link.setAttribute('data-preload', 'true');
      document.head.appendChild(link);
    });
  }, [config]);

  return null;
}
