import * as React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(({ title, description, variant = 'default', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex w-full items-start space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-slide-in',
                {
                  'bg-white border-slate-200 text-slate-900': t.variant === 'default',
                  'bg-emerald-50 border-emerald-200 text-emerald-900': t.variant === 'success',
                  'bg-rose-50 border-rose-200 text-rose-900': t.variant === 'destructive',
                  'bg-amber-50 border-amber-200 text-amber-900': t.variant === 'warning',
                  'bg-blue-50 border-blue-200 text-blue-900': t.variant === 'info',
                }
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {t.variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                {t.variant === 'destructive' && <AlertCircle className="h-5 w-5 text-rose-600" />}
                {t.variant === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                {t.variant === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                {t.variant === 'default' && <Info className="h-5 w-5 text-slate-500" />}
              </div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{t.title}</h4>
                {t.description && <p className="mt-1 text-xs opacity-90">{t.description}</p>}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 rounded-lg p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
