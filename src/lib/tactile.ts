/**
 * Tactile interactions (preview module 9): radial spotlight tracking,
 * 3D card tilt and magnetic buttons. All hover effects are gated on
 * (hover: hover) and (pointer: fine) so touch devices are untouched.
 * Spotlight tracking itself is pointer-position based and harmless on
 * touch, matching the original behaviour.
 */

export function bindCardEffects(root: ParentNode): () => void {
  const scope = root || document;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cleanups: Array<() => void> = [];

  scope.querySelectorAll('.spotlight-card').forEach((node) => {
    const card = node as HTMLElement;
    if (card.dataset.fxBound) return;
    card.dataset.fxBound = '1';

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');

      if (canHover && card.hasAttribute('data-tilt')) {
        const rx = (y / rect.height - 0.5) * -6.5;
        const ry = (x / rect.width - 0.5) * 6.5;
        card.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
      }
    };
    const onLeave = () => {
      if (canHover && card.hasAttribute('data-tilt')) {
        card.style.transform = '';
      }
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      delete card.dataset.fxBound;
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function initMagneticButtons(root: ParentNode): () => void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return () => {};
  const cleanups: Array<() => void> = [];

  root.querySelectorAll('[data-magnetic]').forEach((node) => {
    const btn = node as HTMLElement;
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    };
    const onLeave = () => {
      btn.style.transform = '';
    };
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      btn.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function initTactileInteractions(root: ParentNode): () => void {
  const unbindCards = bindCardEffects(root);
  const unbindMagnetic = initMagneticButtons(root);
  return () => {
    unbindCards();
    unbindMagnetic();
  };
}
