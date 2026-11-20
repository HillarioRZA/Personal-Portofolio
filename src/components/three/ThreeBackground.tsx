'use client';

import React, { useEffect, useRef } from 'react';
import { initThreeBackground, type SceneControl } from '@/lib/three-background';

/** Fixed global WebGL background. Loaded with ssr: false by the shell. */
export default function ThreeBackground({ sceneControl }: { sceneControl: SceneControl }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    try {
      return initThreeBackground(canvasRef.current, sceneControl);
    } catch (err) {
      console.error('Background 3D init warning:', err);
      return undefined;
    }
  }, [sceneControl]);

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />;
}
