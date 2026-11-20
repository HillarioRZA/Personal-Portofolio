'use client';

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface ToastHandle {
  show: (message: string) => void;
}

/** Non-blocking bottom-right toast. Never uses alert(). */
const Toast = forwardRef<ToastHandle>(function Toast(_, ref) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Email copied to clipboard.');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show(msg: string) {
      setMessage(msg);
      setVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), 2800);
    },
  }));

  return (
    <div
      id="toast"
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 left-5 sm:left-auto z-[90] px-4 py-3 rounded-xl border border-[#38BDF8]/40 bg-[#060810]/95 text-[#F4F4F7] font-mono text-xs shadow-2xl flex items-center gap-2.5 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-emeraldSignal shrink-0" />
      <span id="toast-message">{message}</span>
    </div>
  );
});

export default Toast;
