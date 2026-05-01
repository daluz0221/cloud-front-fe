import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <main className="flex flex-col h-screen bg-white px-6 py-8 overflow-y-auto" aria-label="Pantalla de inicio de sesión">
      <div className="flex-1 flex flex-col justify-center">

        {/* Encabezado visual */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#E0F2F1] flex items-center justify-center mb-4">
            <LogIn size={32} className="text-[#00BFA5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121]">Iniciar sesión</h1>
          <p className="text-[#757575] text-sm mt-1">Accede a tu cuenta familiar</p>
        </div>

        {/* Formulario */}
        <div className="space-y-5">
          <Input
            label="Correo electrónico"
            placeholder="nombre@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            type="email"
            required
          />

          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            type="password"
            required
          />

          {error && (
            <p role="alert" className="text-red-600 text-sm px-1">
              {error}
            </p>
          )}

          <div className="pt-2 space-y-3">
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>

            <button
              onClick={onNavigateToRegister}
              className="w-full text-center text-[#00BFA5] underline underline-offset-2 text-sm py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
            >
              ¿No tienes cuenta? <span className="font-semibold">Regístrate</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
