import { useEffect } from 'react';

const revealSelector = '[data-reveal]';

export function useScrollReveal(routeKey: string) {
  useEffect(() => {
    const root = document.getElementById('main-content');
    if (!root) return;

    document.documentElement.classList.add('reveal-enabled');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | null = null;

    const reveal = (element: Element) => {
      element.classList.add('is-visible');
      observer?.unobserve(element);
    };

    if (!reducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) reveal(entry.target);
          }
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -8% 0px',
        },
      );
    }

    const register = () => {
      for (const element of root.querySelectorAll(revealSelector)) {
        if (element.hasAttribute('data-reveal-ready')) continue;
        element.setAttribute('data-reveal-ready', 'true');
        if (reducedMotion) reveal(element);
        else observer?.observe(element);
      }
    };

    register();
    const mutationObserver = new MutationObserver(register);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [routeKey]);
}
