import { useState } from 'react';
import { Users } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface JoinGroupScreenProps {
  onJoinSuccess: () => void;
}

export function JoinGroupScreen({ onJoinSuccess }: JoinGroupScreenProps) {
  const { joinGroup } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setError('');

    if (!code.trim()) {
      setError('El código del grupo es obligatorio');
      return;
    }

    setLoading(true);
    const result = await joinGroup(code.trim().toUpperCase());
    setLoading(false);

    if (result.success) {
      onJoinSuccess();
    } else {
      setError(result.error || 'No se pudo unir al grupo. Verifica el código e intenta de nuevo.');
    }
  };

  return (
    <main className="flex flex-col h-screen bg-white px-6 py-8 overflow-y-auto" aria-label="Unirse a un grupo familiar">
      <div className="flex-1 flex flex-col justify-center">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#E0F2F1] flex items-center justify-center mb-4">
            <Users size={32} className="text-[#00BFA5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121] text-center">Unirse a un grupo</h1>
          <p className="text-[#757575] text-sm mt-2 text-center">
            Ingresa el código que te compartió el administrador de tu hogar
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Código del grupo"
            placeholder="Ej: FAM123"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            error={error}
            hint="El código tiene 6 caracteres en mayúsculas. Pídelo al jefe de hogar."
            required
          />

          <div className="pt-2">
            <Button onClick={handleJoin} disabled={loading}>
              {loading ? 'Verificando...' : 'Unirse al grupo'}
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
