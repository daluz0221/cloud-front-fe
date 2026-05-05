import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface CreateGroupScreenProps {
  /** El grupo ya quedó creado en el servidor; solo navegar. */
  onGroupCreated: () => void;
  onCancel: () => void;
  isAdmin: boolean;
}

export function CreateGroupScreen({ onGroupCreated, onCancel, isAdmin }: CreateGroupScreenProps) {
  const { createGroup } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateGroupName = (name: string): string | null => {
    if (name.length < 6 || name.length > 25) {
      return 'El nombre debe tener entre 6 y 25 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(name)) {
      return 'Solo se permiten letras, números, espacios, tildes y ñ';
    }
    return null;
  };

  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      setShowErrorModal(true);
      return;
    }
    const validationError = validateGroupName(groupName);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError('');
    const fallbackCode = generateCode();
    const result = await createGroup(groupName.trim(), fallbackCode);
    setSubmitting(false);

    if (result.success && result.groupCode) {
      setInvitationCode(result.groupCode);
      setShowSuccessModal(true);
    } else {
      setError(result.error || 'No se pudo crear el grupo. Intenta de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGroupName(value);
    if (value) {
      setError(validateGroupName(value) || '');
    } else {
      setError('');
    }
  };

  return (
    <main className="flex flex-col h-screen bg-white overflow-y-auto" aria-label="Creación del grupo familiar">
      <div className="flex-1 px-6 py-8 flex flex-col">

        <h1 className="font-bold text-xl text-[#212121] mb-6">Crear grupo familiar</h1>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#E0F2F1] rounded-full flex items-center justify-center">
            <Users size={40} className="text-[#00BFA5]" aria-hidden="true" />
          </div>
        </div>

        <p className="text-[#757575] text-center mb-8">
          Crea un grupo para gestionar las tareas del hogar con tu familia
        </p>

        <div className="mb-6">
          <Input
            label="Nombre del grupo"
            value={groupName}
            onChange={handleChange}
            placeholder="Ej: Mi familia"
            error={error}
            hint="Entre 6 y 25 caracteres. Solo letras, números, espacios, tildes y ñ."
            required
          />
        </div>

        <div
          className="bg-[#F5F5F5] p-4 rounded-xl mb-8"
          role="note"
          aria-label="Requisitos del nombre del grupo"
        >
          <p className="font-medium text-[#212121] mb-2">Requisitos:</p>
          <ul className="text-sm text-[#757575] space-y-1 list-disc list-inside">
            <li>Entre 6 y 25 caracteres</li>
            <li>Solo letras, números, espacios, tildes, ñ</li>
          </ul>
        </div>

        <div className="mt-auto space-y-3">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creando grupo...' : 'Crear grupo familiar'}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          )}
        </div>
      </div>

      {/* Modal: sin permisos */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Sin permisos"
      >
        <p className="text-[#757575] mb-4">No tienes permisos para crear grupos familiares.</p>
        <Button onClick={() => setShowErrorModal(false)}>Entendido</Button>
      </Modal>

      {/* Modal: éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title="¡Grupo creado!"
        showCloseButton={false}
      >
        <p className="text-[#757575] mb-2">Tu grupo fue creado exitosamente.</p>
        <div
          className="bg-[#E0F2F1] rounded-xl px-4 py-3 mb-3 text-center"
          aria-label={`Código del grupo: ${invitationCode}`}
        >
          <p className="text-xs text-[#757575] mb-1">Código de invitación</p>
          <p className="text-xl sm:text-2xl font-mono font-bold text-[#00BFA5] tracking-wide break-all">
            {invitationCode}
          </p>
        </div>
        <p className="text-sm text-[#757575] mb-5">
          Comparte este código con los miembros de tu familia para que puedan unirse.
        </p>
        <Button
          onClick={() => {
            setShowSuccessModal(false);
            onGroupCreated();
          }}
        >
          Continuar
        </Button>
      </Modal>
    </main>
  );
}
