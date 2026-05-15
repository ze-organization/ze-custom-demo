'use client';

/**
 * GlobalPayments rich-text scroll reveal: each word is a .gp-reveal-word span. Primary path
 * uses scroll-driven animations (see RichTextBlockGpRevealBody.module.css @keyframes gpRevealColor
 * and animation-timeline: view()). Browsers without support use @supports + IntersectionObserver
 * to toggle .is-revealed (same module).
 */

import type { JSX } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './RichTextBlockGpRevealBody.module.css';

type GpRevealBodyProps = {
  html: string;
};

export function RichTextBlockGpRevealBody({ html }: GpRevealBodyProps): JSX.Element | null {
  const rootRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, '');
  const scopeId = `gp-reveal-scope-${reactId}`;

  const [supportsViewTimeline, setSupportsViewTimeline] = useState(false);

  useEffect(() => {
    setSupportsViewTimeline(
      typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('animation-timeline', 'view()')
    );
  }, []);

  useEffect(() => {
    if (supportsViewTimeline) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rootEl = rootRef.current;
    if (!rootEl) return;

    const words = rootEl.querySelectorAll<HTMLElement>('.gp-reveal-word');
    if (words.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        }
      },
      { root: null, rootMargin: '0px 0px -45% 0px', threshold: 0 }
    );

    words.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [html, supportsViewTimeline]);

  if (!html) return null;

  return (
    <div id={scopeId} className={styles.scope}>
      <div
        ref={rootRef}
        className="gp-reveal-root ck-content"
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    </div>
  );
}
