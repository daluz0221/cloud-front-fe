import React, { useState, useEffect } from 'react';
import {
  AppTask,
  AuthProvider,
  resolveBackendEstadoForTask,
  useAuth,
  UserRole,
} from './context/AuthContext';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from './components/ui/alert-dialog';
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

type Task = AppTask;

interface RegistrationData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  alias?: string;
}

function AppContent() {
  const {
    user,
    register,
    updateUser,
    createTask,
    updateTask,
    groupTasks,
    isAuthenticated,
    logout
  } = useAuth();
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

  useEffect(() => {
    if (groupTasks !== null) {
      setTasks(groupTasks);
    }
  }, [groupTasks]);

  const handleLoginSuccess = () => {
    // Evita que quede un registro a medias y el efecto mande a role/alias del wizard
    setRegistrationData(null);
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

  const handleJoinGroupSuccess = () => {
    setCurrentScreen('taskList');
  };

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogoutRequest = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirmation(false);
    setCurrentScreen('login');
    setSelectedTaskId(null);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const handleCreateTask = () => {
    if (user?.role !== 'ADMIN') return;
    setCurrentScreen('createTask');
  };

  const handleTaskCreated = async (taskData: {
    name: string;
    description: string;
    dueDate: string;
    assignedTo: string;
  }): Promise<boolean> => {
    if (user?.role === 'ADMIN') {
      const result = await createTask({
        titulo: taskData.name,
        descripcion: taskData.description || '',
        fechaLimite: taskData.dueDate,
      });
      if (result.success && result.task) {
        setTasks((prev) => [...prev, result.task!]);
        setCurrentScreen('taskList');
        return true;
      }
      setToastMessage(result.error || 'No se pudo crear la tarea');
      setToastType('error');
      setShowToast(true);
      return false;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pendiente',
    };
    setTasks([...tasks, newTask]);
    setCurrentScreen('taskList');
    return true;
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

  const handleTaskUpdated = async (
    taskId: string,
    updatedData: Partial<Task>
  ): Promise<boolean> => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return false;

    if (user?.role === 'ADMIN') {
      const result = await updateTask(taskId, {
        titulo: updatedData.name ?? existing.name,
        descripcion: updatedData.description ?? existing.description,
        fechaLimite: updatedData.dueDate ?? existing.dueDate,
        estado: resolveBackendEstadoForTask(existing),
      });
      if (result.success && result.task) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...result.task!,
                  assignedTo: result.task!.assignedTo || existing.assignedTo,
                }
              : task
          )
        );
        return true;
      }
      setToastMessage(result.error || 'No se pudo actualizar la tarea');
      setToastType('error');
      setShowToast(true);
      return false;
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
    return true;
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
          onGroupCreated={() => setCurrentScreen('taskList')}
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
          onLogout={handleLogoutRequest}
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
          onLogout={handleLogoutRequest}
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

      <AlertDialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Si seleccionas "Sí", se cerrará tu sesión y regresarás al panel de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Sí</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
