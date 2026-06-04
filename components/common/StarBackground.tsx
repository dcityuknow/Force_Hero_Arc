// components/common/StarBackground.tsx
'use client';
import { useEffect, useRef } from 'react';

export default function StarBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 120; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 2.5 + 0.5;
      star.className = 'star';
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --duration: ${2 + Math.random() * 4}s;
        --delay: ${Math.random() * 4}s;
      `;
      fragment.appendChild(star);
    }
    container.appendChild(fragment);
  }, []);

  return <div ref={containerRef} className="stars-bg" aria-hidden="true" />;
}
