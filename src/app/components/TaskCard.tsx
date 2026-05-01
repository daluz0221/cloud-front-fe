import { Pencil } from 'lucide-react';

interface TaskCardProps {
  taskName: string;
  taskStatus?: string;
  onClick: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export function TaskCard({ taskName, taskStatus, onClick, onEdit, showEditButton }: TaskCardProps) {
  return (
    <div className="relative" role="listitem">
      <button
        onClick={onClick}
        aria-label={`Ver detalle de la tarea: ${taskName}${taskStatus ? `, estado: ${taskStatus}` : ''}`}
        className="w-full bg-[#B2DFDB] px-4 py-4 rounded-xl text-left text-[#212121] font-medium hover:bg-[#80CBC4] focus:outline-none focus:ring-2 focus:ring-[#00BFA5] transition-colors pr-14"
      >
        <span className="block truncate">{taskName}</span>
        {taskStatus && (
          <span className="text-xs text-[#424242] mt-1 block capitalize">{taskStatus}</span>
        )}
      </button>
      {showEditButton && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Editar tarea: ${taskName}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00BFA5] transition-colors shadow-sm"
        >
          <Pencil size={18} className="text-[#00BFA5]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
