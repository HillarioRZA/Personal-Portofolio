/**
 * Contextual custom cursor (preview module 13). Desktop fine-pointer only:
 * an instant 7px accent dot plus a 0.17-lerp pill that expands into a filled
 * accent badge showing the localized [data-cursor-en] / [data-cursor-id]
 * label of the hovered interactive element.
 */
import type { Lang } from '@/lib/types';

export function initCustomCursor(getLang: () => Lang): () => void {
  const supportsFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const dot = document.getElementById('cursor-dot');
  const pill = document.getElementById('cursor-pill');
  const label = document.getElementById('cursor-label');
  if (!supportsFine || !dot || !pill || !label) return () => {};

  document.body.classList.add('custom-cursor-active');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let pillX = mouseX;
  let pillY = mouseY;
  let visible = false;
  let rafId = 0;
  let disposed = false;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      pill.style.opacity = '1';
    }
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  };
  const onMouseLeave = () => {
    visible = false;
    dot.style.opacity = '0';
    pill.style.opacity = '0';
  };
  const onMouseOver = (e: MouseEvent) => {
    const target = (e.target as Element | null)?.closest?.('[data-cursor]');
    if (target) {
      const lang = getLang();
      const text = target.getAttribute('data-cursor-' + lang) || target.getAttribute('data-cursor');
      if (text) {
        label.textContent = text;
        pill.classList.add('is-labeled');
        return;
      }
    }
    pill.classList.remove('is-labeled');
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseover', onMouseOver);

  function followLoop() {
    if (disposed) return;
    pillX += (mouseX - pillX) * 0.17;
    pillY += (mouseY - pillY) * 0.17;
    pill!.style.left = pillX + 'px';
    pill!.style.top = pillY + 'px';
    rafId = requestAnimationFrame(followLoop);
  }
  followLoop();

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('mouseover', onMouseOver);
    document.body.classList.remove('custom-cursor-active');
  };
}
