import type { Metadata } from 'next';
import AdamSimulatorLoader from '@/components/adam/AdamSimulatorLoader';

export const metadata: Metadata = {
  title: 'Adam — 3D Neuro-Architecture & Math Trace Simulator',
  description:
    'Interactive 3D simulation of Adam, a biomimetic digital brain built in Rust: procedural neuro-anatomy, PAD affect dynamics, Ebbinghaus memory, SHA-256 SoulSpec sealing and barge-in reconciliation.',
};

export default function AdamPage() {
  return <AdamSimulatorLoader />;
}
