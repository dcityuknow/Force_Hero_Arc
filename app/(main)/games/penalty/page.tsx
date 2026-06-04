// app/(main)/games/penalty/page.tsx
import type { Metadata } from 'next';
import PenaltyGame from '@/games/penalty/components/PenaltyGame';

export const metadata: Metadata = {
  title: 'Penalty Shootout – Force Hero',
  description: 'Choose to shoot or save. 5 rounds — who wins the cup?',
};

export default function PenaltyPage() {
  return <PenaltyGame />;
}
