import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#1e2922]',
    error: 'border-rose-500/30 bg-[#291e20]',
    info: 'border-indigo-500/30 bg-[#1e2029]',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-fade-in ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium text-slate-100 flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
