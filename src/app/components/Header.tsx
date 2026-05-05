import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  groupName?: string;
  groupCode?: string;
  userName?: string;
  userAlias?: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
}

export function Header({ title, groupName, groupCode, userName, userAlias, showBack, onBack, onLogout, isAdmin }: HeaderProps) {
  if (groupName && groupCode) {
    return (
      <header className="bg-[#00BFA5] text-white px-4 py-4" role="banner">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3">
            {showBack && (
              <button
                onClick={onBack}
                aria-label="Volver"
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="rounded-md border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        <div className="mt-4">
          <h1 className="font-bold text-xl mb-1">{title || 'Mis Tareas'}</h1>
          {isAdmin && userAlias ? (
            <p className="text-sm opacity-90">Admin: <span className="font-semibold">{userAlias}</span></p>
          ) : userName ? (
            <>
              <p className="text-sm opacity-90">Usuario: <span className="font-semibold">{userName}</span></p>
              {userAlias && (
                <p className="text-sm opacity-90">Alias: <span className="font-semibold">{userAlias}</span></p>
              )}
            </>
          ) : userAlias ? (
            <p className="text-sm opacity-90">Alias: <span className="font-semibold">{userAlias}</span></p>
          ) : null}
          <p className="text-sm opacity-90">Grupo: <span className="font-semibold">{groupName}</span></p>
          <p className="text-sm opacity-90">
            Código: <span className="font-mono font-bold tracking-widest">{groupCode}</span>
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#00BFA5] text-white px-4 py-4 flex items-center gap-3" role="banner">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver a la pantalla anterior"
          className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
      )}
      <h1 className="font-bold text-xl">{title}</h1>
    </header>
  );
}
