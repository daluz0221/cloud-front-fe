import { useState, useEffect } from 'react';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { AliasScreen } from './screens/AliasScreen';
import { JoinGroupScreen } from './screens/JoinGroupScreen';
import { CreateGroupScreen } from './screens/CreateGroupScreen';
import { TaskListScreen } from './screens/TaskListScreen';
import { CreateTaskScreen } from './screens/CreateTaskScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { EditTaskScreen } from './screens/EditTaskScreen';
import { LandingScreen } from './screens/LandingScreen';
import { Toast } from './components/Toast';

type Screen =
  | 'landing'
  | 'login'
  | 'register'
  | 'roleSelection'
  | 'alias'
  | 'joinGroup'
  | 'createGroup'
  | 'taskList'
  | 'createTask'
  | 'taskDetail'
  | 'editTask';

type TaskStatus = 'pendiente' | 'en proceso' | 'terminada';

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
}

interface RegistrationData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  alias?: string;
}

function AppContent() {
  const { user, register, updateUser, createGroup, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'default-1',
      name: 'Lavar platos',
      description: 'Lavar los platos después de la cena para mantener la cocina ordenada.',
      dueDate: '2026-12-31',
      assignedTo: 'Miembro del hogar',
      status: 'pendiente',
    },
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // ✅ NUEVO: tipo de toast para mostrar éxito de registro
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const members = ['Juan pablo segundo', 'María García', 'Carlos López', 'Ana Martínez'];

  // ── Navegación post-login usando rol del backend ──────────────────────────
  useEffect(() => {
    if (isAuthenticated && user) {
      // No cambiar el screen si estamos en una pantalla de edición o detalle
      if (currentScreen === 'editTask' || currentScreen === 'taskDetail' || currentScreen === 'createTask') {
        return;
      }
      
      if (!user.role) {
        setCurrentScreen('roleSelection');
      } else if (!user.alias) {
        setCurrentScreen('alias');
      } else if (user.role === 'ADMIN' && !user.groupId) {
        setCurrentScreen('createGroup');
      } else if (user.role === 'USER' && !user.groupId) {
        setCurrentScreen('joinGroup');
      } else if (currentScreen === 'landing' || currentScreen === 'login' || currentScreen === 'register') {
        setCurrentScreen('taskList');
      }
    } else if (!isAuthenticated && currentScreen !== 'register'
               && currentScreen !== 'roleSelection'
               && currentScreen !== 'alias'
               && currentScreen !== 'landing') {
      setCurrentScreen('login');
    }
  }, [isAuthenticated, user, currentScreen]);

  const handleLoginSuccess = () => {
    // La navegación la maneja el useEffect según el rol devuelto por el backend
  };

  const handleRegisterContinue = (data: { name: string; lastName: string; email: string; password: string }) => {
    setRegistrationData(data);
    setCurrentScreen('roleSelection');
  };

  const handleRoleSelected = (role: UserRole) => {
    if (registrationData) {
      setRegistrationData({ ...registrationData, role });
      setCurrentScreen('alias');
    } else if (user) {
      updateUser({ role });
    }
  };

  const handleAliasSet = async (alias: string) => {
    if (registrationData && registrationData.role) {
      const result = await register(
        { ...registrationData, alias },
        registrationData.password
      );

      if (result.success) {
        // ✅ Registro OK → limpiar datos temporales y redirigir al LOGIN
        setRegistrationData(null);
        setToastMessage('¡Cuenta creada! Inicia sesión para continuar.');
        setToastType('success');
        setShowToast(true);
        setCurrentScreen('login');
      } else {
        setToastMessage(result.error || 'Error en el registro');
        setToastType('error');
        setShowToast(true);
      }
    } else if (user) {
      updateUser({ alias });
    }
  };

  const handleGroupCreated = (name: string, code: string) => {
    createGroup(name, code);
    setCurrentScreen('taskList');
  };

  const handleJoinGroupSuccess = () => {
    setCurrentScreen('taskList');
  };

  const handleCreateTask = () => {
    setCurrentScreen('createTask');
  };

  const handleTaskCreated = (taskData: {
    name: string;
    description: string;
    dueDate: string;
    assignedTo: string;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pendiente',
    };
    setTasks([...tasks, newTask]);
    setCurrentScreen('taskList');
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      setToastMessage('Tarea no encontrada');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setSelectedTaskId(taskId);
    setCurrentScreen('taskDetail');
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentScreen('editTask');
  };

  const handleTaskUpdated = (taskId: string, updatedData: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleBackToList = () => {
    setCurrentScreen('taskList');
    setSelectedTaskId(null);
  };

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  const isAdmin = user?.role === 'ADMIN';
  const userName = user ? `${user.name} ${user.lastName}`.trim() : '';

  return (
    <div className="w-full h-screen bg-white max-w-[390px] mx-auto shadow-xl relative">
      {currentScreen === 'landing' && (
        <LandingScreen
          onNavigateToRegister={() => setCurrentScreen('register')}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onContinue={handleRegisterContinue}
          onBack={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'roleSelection' && (
        <RoleSelectionScreen
          onContinue={handleRoleSelected}
          onBack={() => {
            setRegistrationData(null);
            setCurrentScreen('register');
          }}
          hasExistingAdmin={false}
        />
      )}

      {currentScreen === 'alias' && (
        <AliasScreen
          onContinue={handleAliasSet}
          onBack={() => setCurrentScreen('roleSelection')}
        />
      )}

      {currentScreen === 'joinGroup' && (
        <JoinGroupScreen onJoinSuccess={handleJoinGroupSuccess} />
      )}

      {currentScreen === 'createGroup' && (
        <CreateGroupScreen
          onGroupCreated={handleGroupCreated}
          onCancel={() => {}}
          isAdmin={isAdmin}
        />
      )}

      {currentScreen === 'taskList' && (
        <TaskListScreen
          groupName={user?.groupName || ''}
          groupCode={user?.groupCode || ''}
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onTaskClick={handleTaskClick}
          onEditTask={isAdmin ? handleEditTask : undefined}
          isAdmin={isAdmin}
          userAlias={user?.alias}
          userName={userName}
        />
      )}

      {currentScreen === 'createTask' && (
        <CreateTaskScreen
          onBack={handleBackToList}
          onTaskCreated={handleTaskCreated}
          existingTaskNames={tasks.map((t) => t.name.toLowerCase())}
          members={members}
          groupName={user?.groupName || ''}
          groupCode={user?.groupCode || ''}
          userAlias={user?.alias}
          userName={userName}
          isAdmin={isAdmin}
        />
      )}

      {currentScreen === 'taskDetail' && selectedTask && (
        <TaskDetailScreen
          task={selectedTask}
          onBack={handleBackToList}
          onStatusChange={handleStatusChange}
          onEdit={isAdmin ? () => handleEditTask(selectedTask.id) : undefined}
          isAdmin={isAdmin}
          groupName={user?.groupName || ''}
          groupCode={user?.groupCode || ''}
          userAlias={user?.alias}
          userName={userName}
        />
      )}

      {currentScreen === 'editTask' && isAdmin && (
        <EditTaskScreen
          task={selectedTask || { id: '', name: '', description: '', dueDate: '', assignedTo: '', status: 'pendiente' }}
          onBack={handleBackToList}
          onTaskUpdated={handleTaskUpdated}
          existingTaskNames={tasks.map((t) => t.name.toLowerCase())}
          members={members}
          groupName={user?.groupName || ''}
          groupCode={user?.groupCode || ''}
          userAlias={user?.alias}
          userName={userName}
          isAdmin={isAdmin}
        />
      )}

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
