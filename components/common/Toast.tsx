// components/common/Toast.tsx
'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeStyles = {
  success: 'border-brand-green/50 text-brand-green bg-brand-green/10',
  error: 'border-brand-red/50 text-brand-red bg-brand-red/10',
  info: 'border-brand-accent/50 text-brand-accent bg-brand-accent/10',
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-body font-bold shadow-xl',
        'animate-[fadeUp_0.3s_ease_forwards]',
        typeStyles[type]
      )}
    >
      {message}
    </div>
  );
}
