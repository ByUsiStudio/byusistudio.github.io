import { useEffect } from 'react';

/**
 * 全局滚动显现控制器。
 *
 * 背景：项目里 .scroll-animate 系列类默认 opacity:0，需要元素获得 .animated
 * 才会出现。此前各组件要么自己用 IntersectionObserver，要么根本没触发，
 * 导致多处（含新建的 GitHub 分区、最近动态、语言构成、错误提示等）出现
 * “挂载后永久不可见”的 UI 缺陷。
 *
 * 此组件在布局根部挂载一次：用 IntersectionObserver 统一监听所有
 * .scroll-animate* 元素（含后来异步渲染出来的），进入视口即添加 .animated。
 */
const REVEAL_SELECTOR = [
  '.scroll-animate',
  '.scroll-animate-left',
  '.scroll-animate-right',
  '.scroll-animate-scale',
  '.scroll-animate-fade',
  '.scroll-animate-up',
].join(',');

export function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observed = new Set<Element>();
    let observer: IntersectionObserver | null = null;

    const reveal = (element: Element) => {
      if (observed.has(element)) return;
      observed.add(element);
      observer?.observe(element);
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(reveal);
    };

    scan();

    // 捕获后续异步渲染（仓库数据到达、GitHub 分区挂载等）新增的动画元素
    const mutationObserver = new MutationObserver(() => scan());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
