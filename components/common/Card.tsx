// components/common/Card.tsx
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: string;
}

export default function Card({ className, children, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-brand-surface border border-brand-border p-6',
        className
      )}
      style={glow ? { boxShadow: `0 0 20px 2px ${glow}20` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
