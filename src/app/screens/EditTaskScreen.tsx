import { useState, useId } from 'react';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
  backendEstado?: string;
}

interface EditTaskScreenProps {
  task: Task;
  onBack: () => void;
  onTaskUpdated: (taskId: string, updatedData: Partial<Task>) => void | Promise<boolean>;
  existingTaskNames: string[];
  members: string[];
  groupName: string;
  groupCode: string;
  userAlias?: string;
  userName?: string;
  isAdmin?: boolean;
}

export function EditTaskScreen({ task, onBack, onTaskUpdated, existingTaskNames, members, groupName, groupCode, userAlias, userName, isAdmin }: EditTaskScreenProps) {
  const dateId = useId();
  const selectId = useId();

  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');

    if (!task?.id) {
      setError('Error: Tarea no válida');
      return;
    }

    if (!name.trim()) {
      setError('El nombre de la tarea es obligatorio');
      return;
    }
    if (!dueDate) {
      setError('La fecha límite es obligatoria');
      return;
    }

    const otherNames = existingTaskNames.filter((n) => n !== task.name.toLowerCase());
    if (otherNames.includes(name.toLowerCase())) {
      setError('Ya existe otra tarea con ese nombre');
      return;
    }

    setSaving(true);
    try {
      const ok = await Promise.resolve(onTaskUpdated(task.id, { name, description, dueDate }));
      if (ok === false) {
        setError('No se pudo guardar en el servidor. Intenta de nuevo.');
        return;
      }
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onBack();
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <Header
        title="Editar tarea"
        groupName={groupName}
        groupCode={groupCode}
        userAlias={userAlias}
        userName={userName}
        isAdmin={isAdmin}
        showBack
        onBack={onBack}
      />

      <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto" aria-label="Formulario de edición de tarea">

        <Input
          label="Nombre de la tarea"
          placeholder="Ej: Lavar los platos"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          required
        />

        <TextArea
          label="Descripción (opcional)"
          placeholder="Descripción de la tarea"
          value={description}
          onChange={(v) => setDescription(v)}
        />

        {/* Fecha límite */}
        <div>
          <label htmlFor={dateId} className="block text-[#212121] font-medium mb-2">
            Fecha límite <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id={dateId}
            type="date"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); setError(''); }}
            aria-required="true"
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent"
          />
        </div>

        {/* Asignar a */}
        <div>
          <label htmlFor={selectId} className="block text-[#212121] font-medium mb-2">
            Asignar a <span className="text-[#757575] text-sm font-normal">(opcional)</span>
          </label>
          <select
            id={selectId}
            value=""
            disabled
            className="w-full h-[50px] px-4 py-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent appearance-none cursor-not-allowed opacity-60"
          >
            <option value="">Sin miembro asignado</option>
            {members.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}
      </main>

      <div className="px-6 pb-6 space-y-3">
        <Button onClick={handleSave} disabled={saving} aria-label="Guardar cambios de la tarea">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button onClick={onBack} variant="outline" aria-label="Cancelar edición" disabled={saving}>
          Cancelar
        </Button>
      </div>

      <Toast
        message="¡Cambios guardados correctamente!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </div>
  );
}
