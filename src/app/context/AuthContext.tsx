import React, { createContext, useContext, useState, type ReactNode } from 'react';

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

export type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

export interface AppTask {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
  /** Valor de `estado` devuelto por el API (para PUT sin cambiar semántica del backend). */
  backendEstado?: string;
}

/** Valor de `estado` para PUT: conserva el del backend si existe. */
export function resolveBackendEstadoForTask(task: Pick<AppTask, 'status' | 'backendEstado'>): string {
  if (task.backendEstado) return task.backendEstado;
  if (task.status === 'en proceso') return 'EN PROCESO';
  if (task.status === 'terminada') return 'TERMINADA';
  return 'PENDIENTE';
}

const DEFAULT_GROUP_ID = 'default-group';
const DEFAULT_GROUP_NAME = 'Grupo Familiar';
const DEFAULT_GROUP_CODE = 'FAM001';
const DEFAULT_LOGIN_GROUP_CODE = '56381f';
const DEFAULT_TASKS_GROUP_ID = 5;

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
  createTask: (input: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
  }) => Promise<{ success: boolean; task?: AppTask; error?: string }>;
  updateTask: (
    tareaId: string,
    input: { titulo: string; descripcion: string; fechaLimite: string; estado: string }
  ) => Promise<{ success: boolean; task?: AppTask; error?: string }>;
  groupTasks: AppTask[] | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://cloud-back-fe.onrender.com/api';

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

interface LoginResponse {
  id: number | string;
  nombreCompleto: string;
  rol: UserRole;
  redireccion?: string;
  tieneGrupo?: boolean;
}

interface BackendTask {
  id: number | string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  estado: string;
  miembroAsignado: string;
  grupoId: number | string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [groupTasks, setGroupTasks] = useState<AppTask[] | null>(null);

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

  const mapTaskStatus = (status?: string): TaskStatus => {
    const normalized = (status || '').trim().toLowerCase();
    if (normalized === 'en proceso') return 'en proceso';
    if (normalized === 'terminada') return 'terminada';
    return 'pendiente';
  };

  const normalizeDueDate = (raw: string | undefined): string => {
    if (!raw) return '';
    return String(raw).split('T')[0];
  };

  const mapBackendTask = (task: BackendTask): AppTask => ({
    id: String(task.id),
    name: task.titulo || '',
    description: task.descripcion || '',
    dueDate: normalizeDueDate(task.fechaLimite),
    assignedTo: task.miembroAsignado || '',
    status: mapTaskStatus(task.estado),
    backendEstado: task.estado != null && task.estado !== '' ? String(task.estado) : undefined,
  });

  const mapBackendTasks = (payload: unknown): AppTask[] => {
    const list: BackendTask[] = Array.isArray(payload)
      ? (payload as BackendTask[])
      : payload
        ? [payload as BackendTask]
        : [];

    return list.map(mapBackendTask);
  };

  const parseBackendTaskResponse = (raw: unknown): AppTask | null => {
    if (!raw || typeof raw !== 'object') return null;
    const t = raw as Partial<BackendTask> & { id?: number | string };
    if (t.id == null) return null;
    return mapBackendTask(t as BackendTask);
  };

  const resolveGrupoId = (u: User | null): number => {
    const gid = u?.groupId;
    if (gid != null && /^\d+$/.test(String(gid))) return Number(gid);
    return DEFAULT_TASKS_GROUP_ID;
  };

  const createTask = async (input: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
  }): Promise<{ success: boolean; task?: AppTask; error?: string }> => {
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Solo un administrador puede crear tareas' };
    }

    try {
      const response = await fetch(`${API_BASE}/tareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Usuario-Id': String(user.id),
        },
        body: JSON.stringify({
          titulo: input.titulo,
          descripcion: input.descripcion,
          fechaLimite: input.fechaLimite,
          grupoId: resolveGrupoId(user),
        }),
      });

      if (!response.ok) {
        let msg = 'No se pudo crear la tarea';
        try {
          const err = await response.json();
          msg = err?.message || err?.error || msg;
        } catch {
          const text = await response.text();
          if (text) msg = text;
        }
        return { success: false, error: msg };
      }

      const body = await response.json().catch(() => null);
      let mapped = parseBackendTaskResponse(body);
      if (!mapped) {
        mapped = {
          id: String(Date.now()),
          name: input.titulo,
          description: input.descripcion,
          dueDate: normalizeDueDate(input.fechaLimite),
          assignedTo: '',
          status: 'pendiente',
          backendEstado: resolveBackendEstadoForTask({ status: 'pendiente' }),
        };
      }
      return { success: true, task: mapped };
    } catch {
      return { success: false, error: 'Error de red al crear la tarea' };
    }
  };

  const updateTask = async (
    tareaId: string,
    input: { titulo: string; descripcion: string; fechaLimite: string; estado: string }
  ): Promise<{ success: boolean; task?: AppTask; error?: string }> => {
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Solo un administrador puede editar tareas' };
    }

    try {
      const response = await fetch(`${API_BASE}/tareas/${encodeURIComponent(tareaId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Usuario-Id': String(user.id),
        },
        body: JSON.stringify({
          titulo: input.titulo,
          descripcion: input.descripcion,
          estado: input.estado,
          fechaLimite: input.fechaLimite,
        }),
      });

      if (!response.ok) {
        let msg = 'No se pudo actualizar la tarea';
        try {
          const err = await response.json();
          msg = err?.message || err?.error || msg;
        } catch {
          const text = await response.text();
          if (text) msg = text;
        }
        return { success: false, error: msg };
      }

      const body = await response.json().catch(() => null);
      const mapped = parseBackendTaskResponse(body) || {
        id: tareaId,
        name: input.titulo,
        description: input.descripcion,
        dueDate: normalizeDueDate(input.fechaLimite),
        assignedTo: '',
        status: mapTaskStatus(input.estado),
        backendEstado: input.estado,
      };
      return { success: true, task: mapped };
    } catch {
      return { success: false, error: 'Error de red al actualizar la tarea' };
    }
  };

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
        const sesion = (await response.json()) as LoginResponse;

        const rawRol = String(sesion.rol ?? '').toUpperCase();
        const rolNormalizado: UserRole = rawRol === 'ADMIN' ? 'ADMIN' : 'USER';

        const parts: string[] = (sesion.nombreCompleto || '').split(' ');
        const aliasPorDefecto =
          (parts[0] || email.split('@')[0] || '').trim() || 'Usuario';
        let groupData: Pick<User, 'groupId' | 'groupName' | 'groupCode'> = {
          groupId: sesion.tieneGrupo ? 'has-group' : undefined,
          groupName: undefined,
          groupCode: undefined,
        };

        // 1) Si es USER, intentar ingreso automático al grupo por código fijo
        if (rolNormalizado === 'USER') {
          try {
            const joinResponse = await fetch(`${API_BASE}/grupos/ingresar`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Usuario-Id': String(sesion.id),
              },
              body: JSON.stringify({ codigoAcceso: DEFAULT_LOGIN_GROUP_CODE }),
            });

            if (joinResponse.ok) {
              const grupo = await joinResponse.json();
              groupData = {
                groupId: String(grupo.id),
                groupName: grupo.nombre,
                groupCode: grupo.codigoAcceso,
              };
            }
          } catch {
            // Si falla este endpoint, el login igual puede continuar
          }
        }

        // 2) Consultar tareas del grupo requerido para mostrarlas en la app
        try {
          const tasksResponse = await fetch(`${API_BASE}/tareas/grupo/${DEFAULT_TASKS_GROUP_ID}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });

          if (tasksResponse.ok) {
            const backendTasks = await tasksResponse.json();
            setGroupTasks(mapBackendTasks(backendTasks));
          } else {
            setGroupTasks([]);
          }
        } catch {
          setGroupTasks([]);
        }

        const loggedUser: User = {
          id: String(sesion.id),
          name: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email,
          role: rolNormalizado,
          // El backend no envía alias; la app solo exigía alias en el wizard de registro.
          alias: aliasPorDefecto,
          groupId: groupData.groupId,
          groupName: groupData.groupName,
          groupCode: groupData.groupCode,
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
    setGroupTasks(null);
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
    const normalizedRole = role === 'ADMIN' ? 'ADMIN' : role === 'USER' ? 'USER' : undefined;

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

    if (!normalizedRole) {
      return { success: false, error: 'El rol debe ser USER o ADMIN' };
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
          rol: normalizedRole,
        }),
      });

      if (response.ok) {
        // ✅ Registro exitoso en backend → NO llama setUser, el usuario debe hacer login
        return { success: true };
      }

      let backendError = 'No se pudo completar el registro';
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errPayload = await response.json();
          backendError =
            errPayload?.message ||
            errPayload?.error ||
            backendError;
        } else {
          const text = await response.text();
          if (text) backendError = text;
        }
      } catch {
        // Si no se puede parsear el error, conservar mensaje genérico
      }

      if (response.status === 409) {
        return { success: false, error: 'El correo o username ya están registrados' };
      }

      return { success: false, error: backendError };
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
      role: normalizedRole,
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
    setGroupTasks(null);
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
        createTask,
        updateTask,
        groupTasks,
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
