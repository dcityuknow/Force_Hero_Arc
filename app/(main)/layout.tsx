// app/(main)/layout.tsx
import Navbar from '@/components/layout/Navbar';
import StarBackground from '@/components/common/StarBackground';
import Toast from '@/components/common/Toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <StarBackground />
      <Navbar />
      <main className="relative z-10 pt-16">{children}</main>
      <Toast />
    </div>
  );
}
