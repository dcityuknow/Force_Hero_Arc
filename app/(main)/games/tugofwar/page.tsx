// app/(main)/games/tugofwar/page.tsx
import type { Metadata } from 'next';
import TugOfWarGame from '@/games/tugofwar/components/TugOfWarGame';

export const metadata: Metadata = {
  title: 'Tug of War – Force Hero',
  description: 'Type arrow sequences to pull the rope. Reach Level 9 for power items!',
};

export default function TugOfWarPage() {
  return <TugOfWarGame />;
}
