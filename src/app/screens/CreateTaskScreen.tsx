import { useState, useId } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';

interface CreateTaskScreenProps {
  onBack: () => void;
  onTaskCreated: (task: {
    name: string;
    description: string;
    dueDate: string;
    assignedTo: string;
  }) => void | Promise<boolean>;
  existingTaskNames: string[];
  members: string[];
  groupName: string;
  groupCode: string;
  userAlias?: string;
  userName?: string;
  isAdmin?: boolean;
}

export function CreateTaskScreen({ onBack, onTaskCreated, existingTaskNames, members, groupName, groupCode, userAlias, userName, isAdmin }: CreateTaskScreenProps) {
  const dateId = useId();
  const selectId = useId();

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'El nombre de la tarea es obligatorio';
    if (name.length < 3 || name.length > 60) return 'Debe tener entre 3 y 60 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(name)) return 'Solo letras, números, espacios, tildes y ñ';
    if (existingTaskNames.includes(name.toLowerCase())) return 'Ya existe una tarea con ese nombre';
    return null;
  };

  const validateDescription = (desc: string): string | null => {
    if (!desc) return null;
    const wordCount = desc.trim().split(/\s+/).length;
    if (wordCount > 100) return 'La descripción no puede superar las 100 palabras';
    return null;
  };

  const validateDate = (date: string): string | null => {
    if (!date) return 'La fecha límite es obligatoria';
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return 'La fecha no puede estar en el pasado';
    return null;
  };

  const handleSubmit = async () => {
    const nameError = validateName(taskName);
    const descError = validateDescription(description);
    const dateError = validateDate(dueDate);

    const newErrors: Record<string, string> = {};
    if (nameError) newErrors.name = nameError;
    if (descError) newErrors.description = descError;
    if (dateError) newErrors.dueDate = dateError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setErrors((p) => ({ ...p, submit: '' }));
    try {
      const ok = await Promise.resolve(
        onTaskCreated({ name: taskName, description, dueDate, assignedTo: '' })
      );
      if (ok === false) {
        setErrors((p) => ({
          ...p,
          submit: 'No se pudo guardar la tarea. Revisa la conexión o los datos.',
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <Header
        title="Nueva tarea"
        groupName={groupName}
        groupCode={groupCode}
        userAlias={userAlias}
        userName={userName}
        isAdmin={isAdmin}
        showBack
        onBack={onBack}
      />

      <main className="flex-1 px-6 py-6 overflow-y-auto" aria-label="Formulario de nueva tarea">
        <div className="space-y-6">

          <Input
            label="Nombre de la tarea"
            value={taskName}
            onChange={(e) => { setTaskName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            placeholder="Ej: Lavar los platos"
            error={errors.name}
            maxLength={60}
            showCounter
            required
          />

          <TextArea
            label="Descripción (opcional)"
            value={description}
            onChange={(v) => { setDescription(v); setErrors(p => ({ ...p, description: '' })); }}
            placeholder="Detalles adicionales sobre la tarea..."
            error={errors.description}
            maxWords={100}
          />

          {/* Fecha límite */}
          <div>
            <label htmlFor={dateId} className="block text-[#212121] font-medium mb-2">
              Fecha límite <span className="text-red-600" aria-hidden="true">*</span>
              <span className="sr-only">(obligatorio)</span>
            </label>
            <input
              id={dateId}
              type="date"
              value={dueDate}
              min={today}
              onChange={(e) => { setDueDate(e.target.value); setErrors(p => ({ ...p, dueDate: '' })); }}
              aria-required="true"
              aria-invalid={!!errors.dueDate}
              className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#00BFA5] focus:border-transparent"
            />
            {errors.dueDate && (
              <p role="alert" className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
            )}
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

          {errors.submit && (
            <p role="alert" className="text-red-600 text-sm">
              {errors.submit}
            </p>
          )}
        </div>
      </main>

      <div className="px-6 pb-6">
        <Button onClick={handleSubmit} disabled={saving} aria-label="Crear nueva tarea">
          {saving ? 'Guardando...' : 'Crear tarea'}
        </Button>
      </div>
    </div>
  );
}
