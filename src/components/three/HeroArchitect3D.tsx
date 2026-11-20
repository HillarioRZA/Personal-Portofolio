'use client';

import React, { useEffect, useRef } from 'react';
import { initIdentity3DArchitect } from '@/lib/three-architect';

/**
 * Frameless hero 3D workstation stage. No card, border, mode buttons,
 * helper text, or stat boxes around it, per the design spec.
 * Loaded with ssr: false by HeroIdentity.
 */
export default function HeroArchitect3D() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stageRef.current || !canvasRef.current) return undefined;
    try {
      return initIdentity3DArchitect(stageRef.current, canvasRef.current);
    } catch (err) {
      console.error('Hero 3D init warning:', err);
      return undefined;
    }
  }, []);

  return (
    <div
      id="identity-3d-stage"
      ref={stageRef}
      data-cursor="3D"
      data-cursor-en="3D"
      data-cursor-id="3D"
      className="relative w-full h-[300px] sm:h-[370px] lg:h-[420px] select-none"
    >
      <div className="stage-floor-glow absolute inset-0 pointer-events-none" />
      <canvas id="identity-3d-canvas" ref={canvasRef} className="relative z-10 w-full h-full block" />
    </div>
  );
}
