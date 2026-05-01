import { useState } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { Button } from '../components/Button';
import { UserRole } from '../context/AuthContext';

interface RoleSelectionScreenProps {
  onContinue: (role: UserRole) => void;
  onBack: () => void;
  hasExistingAdmin?: boolean;
}

export function RoleSelectionScreen({ onContinue, onBack, hasExistingAdmin = false }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!selectedRole) {
      setError('Debes seleccionar un rol para continuar');
      return;
    }
    onContinue(selectedRole);
  };

  return (
    <main className="flex flex-col h-screen bg-white px-6 py-8 overflow-y-auto" aria-label="Selección de rol">
      <div className="flex-1 flex flex-col justify-center">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#212121]">¿Cuál es tu rol en el hogar?</h1>
          <p className="text-[#757575] text-sm mt-2">
            Tu rol define las acciones que puedes realizar en la aplicación
          </p>
        </div>

        {/* Selector de roles */}
        <div
          role="radiogroup"
          aria-label="Selecciona tu rol"
          className="space-y-4"
        >
          {/* Administrador */}
          <button
            role="radio"
            aria-checked={selectedRole === 'ADMIN'}
            aria-disabled={hasExistingAdmin}
            disabled={hasExistingAdmin}
            onClick={() => {
              if (!hasExistingAdmin) {
                setSelectedRole('ADMIN');
                setError('');
              }
            }}
            className={[
              'w-full p-5 border-2 rounded-xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#00BFA5]',
              selectedRole === 'ADMIN'
                ? 'border-[#00BFA5] bg-[#E0F2F1]'
                : hasExistingAdmin
                ? 'border-[#E0E0E0] bg-[#F5F5F5] opacity-50 cursor-not-allowed'
                : 'border-[#E0E0E0] hover:border-[#00BFA5] bg-white',
            ].join(' ')}
          >
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${selectedRole === 'ADMIN' ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F5F5] text-[#757575]'}`}>
                <ShieldCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-[#212121]">Jefe de Hogar</p>
                <p className="text-sm text-[#757575] mt-1">
                  Administrador: crea tareas, gestiona el grupo y sus miembros
                </p>
                {hasExistingAdmin && (
                  <p className="text-xs text-amber-700 mt-2 font-medium">
                    Este hogar ya tiene un administrador
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Miembro */}
          <button
            role="radio"
            aria-checked={selectedRole === 'USER'}
            onClick={() => { setSelectedRole('USER'); setError(''); }}
            className={[
              'w-full p-5 border-2 rounded-xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#00BFA5]',
              selectedRole === 'USER'
                ? 'border-[#00BFA5] bg-[#E0F2F1]'
                : 'border-[#E0E0E0] hover:border-[#00BFA5] bg-white',
            ].join(' ')}
          >
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${selectedRole === 'USER' ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F5F5] text-[#757575]'}`}>
                <User size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-[#212121]">Miembro del Hogar</p>
                <p className="text-sm text-[#757575] mt-1">
                  Consulta y completa las tareas que te sean asignadas
                </p>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm mt-4 px-1">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-8">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Volver
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            Continuar
          </Button>
        </div>

      </div>
    </main>
  );
}
