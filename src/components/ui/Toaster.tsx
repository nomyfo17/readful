"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

export const Toaster = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (event: CustomEvent) => {
      const toast: Toast = {
        id: String(++toastId),
        message: event.detail.message,
        type: event.detail.type || "info",
      };
      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    window.addEventListener("toast", addToast as EventListener);
    return () => window.removeEventListener("toast", addToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          text: "text-green-400",
        };
      case "error":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          text: "text-red-400",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          text: "text-blue-400",
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`flex items-center gap-3 p-4 rounded-lg ${styles.bg} ${styles.border} border backdrop-blur-lg`}
            >
              <div className="flex-shrink-0">{styles.icon}</div>
              <p className={`flex-1 text-sm ${styles.text}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 p-1 rounded hover:${styles.bg} transition-colors`}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show toasts
export const showToast = (message: string, type: Toast["type"] = "info") => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("toast", {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  }
};
