import { ClipboardList, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { TaskCard } from '../components/TaskCard';

type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

interface Task {
  id: string;
  name: string;
  status?: TaskStatus;
}

interface TaskListScreenProps {
  groupName: string;
  groupCode: string;
  tasks: Task[];
  onCreateTask: () => void;
  onTaskClick: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userAlias?: string;
  userName?: string;
}

export function TaskListScreen({
  groupName,
  groupCode,
  tasks,
  onCreateTask,
  onTaskClick,
  onEditTask,
  onLogout,
  isAdmin,
  userAlias,
  userName,
}: TaskListScreenProps) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <Header
        title="Mis Tareas"
        groupName={groupName}
        groupCode={groupCode}
        userAlias={userAlias}
        userName={userName}
        isAdmin={isAdmin}
        onLogout={onLogout}
      />

      <main className="flex-1 px-6 py-6 overflow-y-auto" aria-label="Lista de tareas">
        {tasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            aria-live="polite"
          >
            <ClipboardList size={52} className="text-[#BDBDBD] mb-4" aria-hidden="true" />
            <h2 className="font-bold text-lg text-[#212121] mb-2">
              {isAdmin ? 'No hay tareas aún' : 'No tienes tareas asignadas'}
            </h2>
            {isAdmin && (
              <p className="text-[#757575] text-sm px-8">
                Crea la primera tarea para empezar a organizar las actividades del hogar
              </p>
            )}
          </div>
        ) : (
          <div role="list" aria-label="Tareas del hogar" className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                taskName={task.name}
                taskStatus={task.status}
                onClick={() => onTaskClick(task.id)}
                onEdit={onEditTask ? () => onEditTask(task.id) : undefined}
                showEditButton={isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      {isAdmin && (
        <div className="px-6 pb-6">
          <Button onClick={onCreateTask} aria-label="Crear nueva tarea">
            <Plus size={18} className="mr-2" aria-hidden="true" />
            Nueva tarea
          </Button>
        </div>
      )}
    </div>
  );
}
