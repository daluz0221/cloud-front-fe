import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface RegisterScreenProps {
  onContinue: (data: { name: string; lastName: string; email: string; password: string }) => void;
  onBack: () => void;
}

export function RegisterScreen({ onContinue, onBack }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/@gmail\.com$/.test(email)) {
      newErrors.email = 'Debe ser un correo @gmail.com válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!/^[a-zA-Z0-9@#$%&*]{6,10}$/.test(password)) {
      newErrors.password = 'Entre 6 y 10 caracteres: letras, números y @, #, $, %, &, *';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue({ name, lastName, email, password });
    }
  };

  return (
    <main className="flex flex-col h-screen bg-white px-6 py-8 overflow-y-auto" aria-label="Pantalla de registro">
      <div className="flex-1 flex flex-col justify-center">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#E0F2F1] flex items-center justify-center mb-4">
            <UserPlus size={32} className="text-[#00BFA5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121]">Crear cuenta</h1>
          <p className="text-[#757575] text-sm mt-1">Únete a tu grupo familiar</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            error={errors.name}
            required
          />

          <Input
            label="Apellido"
            placeholder="Tu apellido"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: '' })); }}
            error={errors.lastName}
            required
          />

          <Input
            label="Correo electrónico"
            placeholder="nombre@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            type="email"
            error={errors.email}
            required
          />

          <Input
            label="Contraseña"
            placeholder="Entre 6 y 10 caracteres"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
            type="password"
            error={errors.password}
            hint="Usa letras, números y los símbolos: @, #, $, %, &, *"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Volver
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Continuar
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
