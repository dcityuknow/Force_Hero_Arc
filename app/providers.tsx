// app/providers.tsx
// Wagmi không còn dùng cho blockchain calls (wallet.js dùng raw provider)
// Chỉ wrap QueryClient để hỗ trợ các hook query khác nếu cần
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
