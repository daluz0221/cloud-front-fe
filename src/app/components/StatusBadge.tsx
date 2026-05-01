import { Badge } from './ui/badge';
import { cn } from './ui/utils';

type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

interface StatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
}

const statusStyles: Record<TaskStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300',
  'en proceso': 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
  terminada: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
};

const statusLabel: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  'en proceso': 'En proceso',
  terminada: 'Terminada',
};

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const classes = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
    statusStyles[status],
    onClick ? 'cursor-pointer' : 'cursor-default'
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={`Estado actual: ${statusLabel[status]}. Haz clic para cambiar`}
        className={cn(classes, 'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00BFA5]')}
      >
        {statusLabel[status]}
      </button>
    );
  }

  return (
    <span className={classes} aria-label={`Estado: ${statusLabel[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
