'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side loader for the Adam simulator. The simulator owns a Three.js
 * WebGL canvas and reads window dimensions for its initial panel state, so it
 * is loaded with ssr:false (only possible from a Client Component in Next 15).
 */
const AdamSimulator = dynamic(() => import('./AdamSimulator'), { ssr: false });

export default function AdamSimulatorLoader() {
  return <AdamSimulator />;
}
