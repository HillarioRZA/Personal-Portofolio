'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { initCustomCursor } from '@/lib/cursor';
import type { Lang } from '@/lib/types';

/** Desktop fine-pointer contextual pill cursor. Hidden on touch devices. */
export default function CustomCursor() {
  const { lang } = useLanguage();
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;

  useEffect(() => {
    try {
      return initCustomCursor(() => langRef.current);
    } catch (err) {
      console.error('Custom cursor init warning:', err);
      return undefined;
    }
  }, []);

  return (
    <>
      <div id="cursor-dot" aria-hidden="true" />
      <div id="cursor-pill" aria-hidden="true">
        <span id="cursor-label" />
      </div>
    </>
  );
}
