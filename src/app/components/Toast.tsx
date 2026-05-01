import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
}

const toastConfig = {
  error: {
    bg: 'bg-red-600',
    Icon: AlertCircle,
    role: 'alert' as const,
    label: 'Error',
  },
  success: {
    bg: 'bg-green-600',
    Icon: CheckCircle,
    role: 'status' as const,
    label: 'Éxito',
  },
  info: {
    bg: 'bg-[#424242]',
    Icon: Info,
    role: 'status' as const,
    label: 'Información',
  },
};

export function Toast({ message, isVisible, onClose, type = 'info' }: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role={config.role}
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-4 left-4 right-4 z-50 animate-slide-down max-w-[390px] mx-auto"
    >
      <div
        className={`${config.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}
      >
        <config.Icon size={20} aria-hidden="true" className="shrink-0" />
        <span className="font-medium flex-1 text-sm">{message}</span>
        <button
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="ml-2 p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
