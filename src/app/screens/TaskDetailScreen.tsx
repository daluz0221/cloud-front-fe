import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';

type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
}

interface TaskDetailScreenProps {
  task: Task;
  onBack: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: () => void;
  isAdmin?: boolean;
  groupName: string;
  groupCode: string;
  userAlias?: string;
  userName?: string;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function TaskDetailScreen({ task, onBack, onEdit, isAdmin, groupName, groupCode, userAlias, userName }: TaskDetailScreenProps) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <Header
        title="Detalle de tarea"
        groupName={groupName}
        groupCode={groupCode}
        userAlias={userAlias}
        userName={userName}
        isAdmin={isAdmin}
        showBack
        onBack={onBack}
      />

      <main className="flex-1 px-6 py-6 space-y-5 overflow-y-auto" aria-label={`Detalle de la tarea: ${task.name}`}>

        {/* Nombre */}
        <section aria-labelledby="label-nombre">
          <p id="label-nombre" className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-2">
            Nombre de la tarea
          </p>
          <div className="px-4 py-3 bg-[#E0F2F1] rounded-xl text-[#212121] font-semibold">
            {task.name}
          </div>
        </section>

        {/* Estado */}
        <section aria-labelledby="label-estado">
          <p id="label-estado" className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-2">
            Estado
          </p>
          <StatusBadge status={task.status} />
        </section>

        {/* Descripción */}
        <section aria-labelledby="label-desc">
          <p id="label-desc" className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-2">
            Descripción
          </p>
          <div className="px-4 py-3 bg-blue-50 rounded-xl text-[#212121] min-h-[56px]">
            {task.description
              ? task.description
              : <span className="text-[#9E9E9E] italic">Sin descripción</span>
            }
          </div>
        </section>

        {/* Fecha límite */}
        <section aria-labelledby="label-fecha">
          <p id="label-fecha" className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-2">
            Fecha límite
          </p>
          <div className="px-4 py-3 bg-purple-50 rounded-xl text-[#212121] font-medium capitalize">
            {formatDate(task.dueDate)}
          </div>
        </section>

        {/* Asignado a */}
        <section aria-labelledby="label-asig">
          <p id="label-asig" className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-2">
            Asignado a
          </p>
          <div className="px-4 py-3 bg-green-50 rounded-xl text-[#212121] font-medium">
            {task.assignedTo
              ? task.assignedTo
              : <span className="text-[#9E9E9E] italic">Sin integrante asignado</span>
            }
          </div>
        </section>

      </main>

      <div className="px-6 pb-6 space-y-3">
        {isAdmin && onEdit && (
          <Button onClick={onEdit} aria-label="Editar esta tarea">
            Editar tarea
          </Button>
        )}
        <Button onClick={onBack} variant={isAdmin ? 'outline' : 'primary'} aria-label="Volver a la lista de tareas">
          Volver a la lista
        </Button>
      </div>
    </div>
  );
}
