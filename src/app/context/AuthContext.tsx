import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  alias: string;
  groupId?: string;
  groupName?: string;
  groupCode?: string;
}

const DEFAULT_GROUP_ID = 'default-group';
const DEFAULT_GROUP_NAME = 'Grupo Familiar';
const DEFAULT_GROUP_CODE = 'FAM001';

interface DemoGroup {
  id: string;
  name: string;
  code: string;
  adminId: string;
}

const getDemoGroups = (): DemoGroup[] => {
  const stored = localStorage.getItem('demo_groups');
  return stored ? JSON.parse(stored) : [];
};

const saveDemoGroups = (groups: DemoGroup[]) => {
  localStorage.setItem('demo_groups', JSON.stringify(groups));
};

const ensureDefaultGroupExists = (): DemoGroup => {
  const groups = getDemoGroups();
  let defaultGroup = groups.find(
    (g) => g.code === DEFAULT_GROUP_CODE || g.id === DEFAULT_GROUP_ID
  );

  if (!defaultGroup) {
    defaultGroup = {
      id: DEFAULT_GROUP_ID,
      name: DEFAULT_GROUP_NAME,
      code: DEFAULT_GROUP_CODE,
      adminId: 'system',
    };
    groups.push(defaultGroup);
    saveDemoGroups(groups);
  }

  return defaultGroup;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Partial<User> & { username?: string }, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  joinGroup: (code: string) => Promise<{ success: boolean; error?: string; groupName?: string }>;
  createGroup: (name: string, code: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8080/api';

// ── MODO DEMO: usuarios registrados localmente (sin backend) ───────────────
interface DemoUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  alias: string;
  groupId?: string;
  groupName?: string;
  groupCode?: string;
}

const getDemoUsers = (): DemoUser[] => {
  const stored = localStorage.getItem('demo_users');
  return stored ? JSON.parse(stored) : [];
};

const saveDemoUser = (user: DemoUser) => {
  const users = getDemoUsers();
  users.push(user);
  localStorage.setItem('demo_users', JSON.stringify(users));
};

const findDemoUserByEmail = (email: string): DemoUser | undefined => {
  return getDemoUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

const updateDemoUser = (email: string, updates: Partial<DemoUser>) => {
  const users = getDemoUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('demo_users', JSON.stringify(users));
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // ─── Grupos en memoria (para createGroup / joinGroup que aún no tienen
  //     endpoint dedicado de "listar grupos") ──────────────────────────────
  const [groups, setGroups] = useState<Map<string, { name: string; code: string; adminId: string }>>(
    () => {
      const storedGroups = ensureDefaultGroupExists();
      const allGroups = getDemoGroups();
      return new Map(allGroups.map((group) => [
        group.id,
        { name: group.name, code: group.code, adminId: group.adminId },
      ]));
    }
  );

  // ── LOGIN → intenta con backend, fallback a modo demo ──────────────────
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Campos obligatorios' };
    }

    // ── Intento con backend ───────────────────────────────────────────────
    try {
      const response = await fetch(`${API_BASE}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      if (response.ok) {
        // SesionResponse: { id, nombreCompleto, rol, redireccion, tieneGrupo }
        const sesion = await response.json();

        const parts: string[] = (sesion.nombreCompleto || '').split(' ');
        const loggedUser: User = {
          id: String(sesion.id),
          name: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email,
          role: sesion.rol as UserRole,   // "ADMIN" | "USER"
          alias: '',
          groupId: sesion.tieneGrupo ? 'has-group' : undefined,
        };

        setUser(loggedUser);
        return { success: true };
      }
    } catch {
      // Backend no disponible, continuamos al fallback demo
    }

    // ── Fallback: modo demo (sin backend) ─────────────────────────────────
    const demoUser = findDemoUserByEmail(email);
    if (!demoUser) {
      return { success: false, error: 'Usuario no encontrado. Regístrate primero.' };
    }
    if (demoUser.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Login demo exitoso
    let updatedDemoUser = demoUser;

    if (demoUser.role === 'USER' && !demoUser.groupId) {
      const defaultGroup = ensureDefaultGroupExists();
      updatedDemoUser = {
        ...demoUser,
        groupId: defaultGroup.id,
        groupName: defaultGroup.name,
        groupCode: defaultGroup.code,
      };
      updateDemoUser(email, {
        groupId: defaultGroup.id,
        groupName: defaultGroup.name,
        groupCode: defaultGroup.code,
      });
    }

    const loggedUser: User = {
      id: updatedDemoUser.id,
      name: updatedDemoUser.name,
      lastName: updatedDemoUser.lastName,
      email: updatedDemoUser.email,
      role: updatedDemoUser.role,
      alias: updatedDemoUser.alias,
      groupId: updatedDemoUser.groupId,
      groupName: updatedDemoUser.groupName,
      groupCode: updatedDemoUser.groupCode,
    };
    setUser(loggedUser);
    return { success: true };
  };

  // ── REGISTER → intenta con backend, fallback a modo demo ────────────────
  const register = async (
    userData: Partial<User> & { username?: string },
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { name, lastName, email, role, alias } = userData;
    const username = userData.username || email || '';

    if (!name || !lastName || !email || !password) {
      return { success: false, error: 'Campos obligatorios' };
    }

    const passwordRegex = /^[a-zA-Z0-9@#$%&*]{6,10}$/;
    if (!passwordRegex.test(password)) {
      return {
        success: false,
        error: 'La contraseña debe tener entre 6 y 10 caracteres (letras, números y símbolos: @, #, $, %, &, *)',
      };
    }

    // ── Intento con backend ───────────────────────────────────────────────
    try {
      const response = await fetch(`${API_BASE}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: name,
          apellido: lastName,
          correo: email,
          username,
          contrasena: password,
          rol: role || 'USER',   // "ADMIN" | "USER"
        }),
      });

      if (response.ok) {
        // ✅ Registro exitoso en backend → NO llama setUser, el usuario debe hacer login
        return { success: true };
      }
    } catch {
      // Backend no disponible, continuamos al fallback demo
    }

    // ── Fallback: modo demo (sin backend) ─────────────────────────────────
    // Verificar si el usuario ya existe
    if (findDemoUserByEmail(email)) {
      return { success: false, error: 'El correo ya está registrado' };
    }

    // Crear usuario demo
    const newDemoUser: DemoUser = {
      id: Date.now().toString(),
      name: name,
      lastName: lastName,
      email: email,
      password: password,
      role: role || 'USER',
      alias: alias || '',
    };

    if (newDemoUser.role === 'USER') {
      const defaultGroup = ensureDefaultGroupExists();
      newDemoUser.groupId = defaultGroup.id;
      newDemoUser.groupName = defaultGroup.name;
      newDemoUser.groupCode = defaultGroup.code;
    }

    saveDemoUser(newDemoUser);

    // ✅ Registro demo exitoso → NO llama setUser, el usuario debe hacer login
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      updateDemoUser(user.email, {
        groupId: updatedUser.groupId,
        groupName: updatedUser.groupName,
        groupCode: updatedUser.groupCode,
        alias: updatedUser.alias,
      });
    }
  };

  // ── JOIN GROUP → intenta con backend, fallback a modo demo ─────────────
  const joinGroup = async (code: string): Promise<{ success: boolean; error?: string; groupName?: string }> => {
    if (!code) {
      return { success: false, error: 'El código es obligatorio' };
    }
    if (!user) {
      return { success: false, error: 'No hay sesión activa' };
    }

    // ── Intento con backend ───────────────────────────────────────────────
    try {
      const response = await fetch(`${API_BASE}/grupos/ingresar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': user.id,
        },
        body: JSON.stringify({ codigoAcceso: code }),
      });

      if (response.ok) {
        // GrupoFamiliarResponse: { id, nombre, codigoAcceso, fechaCreacion }
        const grupo = await response.json();
        updateUser({ groupId: String(grupo.id), groupName: grupo.nombre, groupCode: grupo.codigoAcceso });
        return { success: true, groupName: grupo.nombre };
      }
    } catch {
      // Backend no disponible, continuamos al fallback demo
    }

    // ── Fallback: modo demo (sin backend) ─────────────────────────────────
    // Buscar grupo por código en localStorage
    const storedGroups = localStorage.getItem('demo_groups');
    const groups: Array<{ id: string; name: string; code: string }> = storedGroups ? JSON.parse(storedGroups) : [];
    const foundGroup = groups.find(g => g.code === code);

    if (!foundGroup) {
      return { success: false, error: 'Código de grupo inválido o no existe' };
    }

    // Unir al grupo demo
    updateUser({ 
      groupId: foundGroup.id, 
      groupName: foundGroup.name, 
      groupCode: foundGroup.code 
    });
    return { success: true, groupName: foundGroup.name };
  };

  // ── CREATE GROUP → intenta con backend, fallback a modo demo ────────────
  const createGroup = async (name: string, code: string) => {
    if (!user) return;

    // ── Intento con backend ───────────────────────────────────────────────
    try {
      const response = await fetch(`${API_BASE}/grupos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': user.id,
        },
        body: JSON.stringify({ nombre: name }),
      });

      if (response.ok) {
        const grupo = await response.json();
        // Usar el código que devuelve el backend, o el generado localmente como fallback
        const finalCode = grupo.codigoAcceso || code;
        updateUser({ groupId: String(grupo.id), groupName: grupo.nombre, groupCode: finalCode });
        return;
      }
    } catch {
      // Backend no disponible, continuamos al fallback demo
    }

    // ── Fallback: modo demo (sin backend) ─────────────────────────────────
    const groupId = Date.now().toString();
    const newGroup: DemoGroup = { id: groupId, name, code, adminId: user.id };
    
    // Guardar en localStorage para que otros usuarios puedan unirse
    const storedGroups = localStorage.getItem('demo_groups');
    const nextGroups: DemoGroup[] = storedGroups ? JSON.parse(storedGroups) : [];
    nextGroups.push(newGroup);
    saveDemoGroups(nextGroups);
    
    // También guardar en memoria
    const nextGroupMap = new Map(groups);
    nextGroupMap.set(groupId, { name, code, adminId: user.id });
    setGroups(nextGroupMap);
    updateUser({ groupId, groupName: name, groupCode: code });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        joinGroup,
        createGroup,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
