// components/common/Toast.tsx
// Port toast UI từ style.css #arc-toast
'use client';
import { useWallet } from '@/hooks/useWallet';

export default function Toast() {
  const { toastMsg } = useWallet();
  if (!toastMsg) return null;
  return (
    <div
      id="arc-toast"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full
        bg-[rgba(15,15,40,0.95)] border border-white/10 text-white font-body font-bold text-sm
        shadow-2xl whitespace-nowrap pointer-events-none
        animate-[fadeUp_0.3s_ease_forwards]"
    >
      {toastMsg}
    </div>
  );
}
