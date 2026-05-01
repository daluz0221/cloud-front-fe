import { Home, CheckCircle2, Sparkles, Key, Leaf } from 'lucide-react';
import { Button } from '../components/Button';

interface LandingScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
}

export function LandingScreen({ onNavigateToRegister, onNavigateToLogin }: LandingScreenProps) {
  return (
    <main className="flex flex-col w-full bg-gradient-to-b from-[#F9FCFB] via-[#F2F9F6] to-[#F8FBFA] px-4 py-16 overflow-y-auto text-slate-900 scrollbar-thin scrollbar-thumb-[#00BFA5] scrollbar-track-[#E8F6F3]">
      <div className="w-full max-w-[420px] mx-auto px-2 pb-16">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/95 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="relative flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-[#E0F6EE] to-[#C7EFE1] shadow-[0_16px_40px_rgba(0,191,165,0.15)]">
              <div className="absolute inset-0 rounded-[30px] border border-[#7EE0C2]/50" />
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white shadow-sm">
                <Home size={34} className="text-[#06A77D]" aria-hidden="true" />
              </div>
              <div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#00BFA5] text-white shadow-lg">
                <CheckCircle2 size={18} aria-hidden="true" />
              </div>
            </div>

            <div className="mt-8 space-y-3 px-2">
              <h1 className="text-[2.5rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                <span className="block text-[#00BFA5]">MiHogar</span>
                <span>Tareas</span>
              </h1>
              <p className="mx-auto max-w-[320px] text-sm leading-7 text-slate-600 sm:text-base">
                La forma más sencilla de gestionar las tareas del hogar en familia.
                Organiza, asigna y celebra juntos.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-[30px] border border-[#D8F7EE] bg-[#F6FBF9] p-4 shadow-sm">
            <div className="flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#E3F6EE] text-[#00A896]">
                <Sparkles size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Tareas más fáciles</p>
                <p className="text-xs text-slate-500">Organiza las tareas de tu hogar en familia.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#E3F6EE] text-[#00A896]">
                <Key size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Seguridad familiar</p>
                <p className="text-xs text-slate-500">Comparte acceso y control con tu grupo.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#E3F6EE] text-[#00A896]">
                <Leaf size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Crecimiento en equipo</p>
                <p className="text-xs text-slate-500">Celebra cada tarea completada juntos.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button onClick={onNavigateToRegister} className="uppercase tracking-[0.18em]">
              REGISTRARSE
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToLogin}
              className="border-[#00BFA5] text-[#0F172A] hover:bg-[#E8F7F1]"
            >
              INICIAR SESIÓN
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
