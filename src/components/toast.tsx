"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  leaving?: boolean;
}

type Listener = (message: string, type: ToastType) => void;

const listeners = new Set<Listener>();

export function showToast(message: string, type: ToastType = "success") {
  listeners.forEach((listener) => listener(message, type));
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS: Record<ToastType, string> = {
  success: "border-emerald-500/20 text-emerald-400",
  error: "border-red-500/20 text-red-400",
  info: "border-blue-500/20 text-blue-400",
};

const DISPLAY_MS = 3200;
const EXIT_MS = 250;

let idCounter = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    timers.current.delete(id);
  }, []);

  useEffect(() => {
    const handler: Listener = (message, type) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);

      const hideTimer = setTimeout(() => {
        setToasts((prev) =>
          prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast))
        );
        const removeTimer = setTimeout(() => remove(id), EXIT_MS);
        timers.current.set(id, removeTimer);
      }, DISPLAY_MS);

      timers.current.set(id, hideTimer);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [remove]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center"
      style={{ gap: "0.75rem" }}
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center rounded-2xl border bg-zinc-950/90 shadow-2xl shadow-black/40 backdrop-blur-xl ${
              toast.leaving ? "" : "toast-enter"
            } ${ACCENTS[toast.type]}`}
            style={{
              gap: "0.75rem",
              paddingTop: "0.875rem",
              paddingBottom: "0.875rem",
              paddingLeft: "1.25rem",
              paddingRight: "0.875rem",
              opacity: toast.leaving ? 0 : 1,
              transform: toast.leaving ? "translateY(-10px) scale(0.97)" : "translateY(0) scale(1)",
              transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
            }}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-semibold text-white">{toast.message}</span>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              aria-label="Dismiss notification"
              className="ml-1 shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
