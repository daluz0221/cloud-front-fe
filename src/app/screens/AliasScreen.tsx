import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface AliasScreenProps {
  onContinue: (alias: string) => void;
  onBack: () => void;
}

export function AliasScreen({ onContinue, onBack }: AliasScreenProps) {
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!alias.trim()) {
      setError('El alias es obligatorio');
      return;
    }
    if (alias.trim().length < 2) {
      setError('El alias debe tener al menos 2 caracteres');
      return;
    }
    onContinue(alias.trim());
  };

  return (
    <main className="flex flex-col h-screen bg-white px-6 py-8 overflow-y-auto" aria-label="Configuración de alias">
      <div className="flex-1 flex flex-col justify-center">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#E0F2F1] flex items-center justify-center mb-4">
            <Tag size={32} className="text-[#00BFA5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121] text-center">¿Cómo te llaman en casa?</h1>
          <p className="text-[#757575] text-sm mt-2 text-center">
            Este alias se mostrará al asignarte tareas
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Tu alias"
            placeholder="Ej: Mamá, Papá, Juan..."
            value={alias}
            onChange={(e) => { setAlias(e.target.value); setError(''); }}
            error={error}
            hint="Un apodo corto con el que te identifican en el hogar"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Volver
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Finalizar registro
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
