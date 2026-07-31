import React, { useState, useEffect } from 'react';
import type { Board, Task, UserProfile } from './types';
import { AppService } from './services/appService';
import { Navbar } from './components/Header/Navbar';
import { BoardColumn } from './components/Board/BoardColumn';
import { AddBoardCard } from './components/Board/AddBoardCard';
import { AuthLockScreen } from './components/Auth/AuthLockScreen';
import { BackgroundPickerModal } from './components/Background/BackgroundPickerModal';
import { TaskDetailModal } from './components/Task/TaskDetailModal';
import { UserManagementModal } from './components/User/UserManagementModal';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modals
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const profile = await AppService.restoreSession();
        if (!profile) return;
        const syncedUsers = await AppService.syncFromSupabase();
        setAllUsers(syncedUsers);
        setCurrentUser(profile);
        setBackgroundUrl(AppService.getUserBackground(profile.id));
        setBoards(AppService.getBoards());
        setTasks(AppService.getTasks());
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Oturum geri yüklenemedi:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };
    void bootstrap();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setBackgroundUrl(AppService.getUserBackground(currentUser.id));
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAllUsers(AppService.getUsers());
    setBoards(AppService.getBoards());
    setTasks(AppService.getTasks());
  };

  const handleUpdateProfile = async (
    userId: string,
    updates: Partial<UserProfile>,
    newPassword?: string
  ) => {
    try {
      const updatedUsers = await AppService.updateUserProfile(userId, updates, newPassword);
      setAllUsers(updatedUsers);
      setCurrentUser(AppService.getActiveUser());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Profil güncellenemedi.');
      throw error;
    }
  };

  const handleToggleUserAccess = async (userId: string) => {
    try {
      setAllUsers(await AppService.toggleUserAccess(userId));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kullanıcı izni güncellenemedi.');
    }
  };

  const handleAddUser = async (
    fullName: string,
    email: string,
    password: string,
    avatarUrl?: string
  ) => {
    try {
      setAllUsers(await AppService.addUser(fullName, email, password, avatarUrl));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı.');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setAllUsers(await AppService.deleteUser(userId));
      const syncedUsers = await AppService.syncFromSupabase();
      setAllUsers(syncedUsers);
      setTasks(AppService.getTasks());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kullanıcı silinemedi.');
    }
  };

  const handleSelectBackground = async (url: string) => {
    if (!currentUser) return;
    try {
      await AppService.setUserBackground(currentUser.id, url);
      setBackgroundUrl(url);
      setCurrentUser(AppService.getActiveUser());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Arka plan kaydedilemedi.');
    }
  };

  const handleAddBoard = async (title: string) => {
    if (!currentUser) return;
    try {
      await AppService.addBoard(title, currentUser.id);
      setBoards(AppService.getBoards());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Pano eklenemedi.');
    }
  };

  const handleUpdateBoardTitle = async (boardId: string, title: string) => {
    try {
      setBoards(await AppService.updateBoard(boardId, { title }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Pano güncellenemedi.');
    }
  };

  const handleUpdateBoardColor = async (boardId: string, color: string) => {
    try {
      setBoards(await AppService.updateBoard(boardId, { color }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Pano rengi güncellenemedi.');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      setBoards(await AppService.deleteBoard(boardId));
      setTasks(AppService.getTasks());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Pano silinemedi.');
    }
  };

  const handleAddTask = async (boardId: string, title: string) => {
    if (!currentUser) return;
    try {
      await AppService.addTask(boardId, title, currentUser.id);
      setTasks(AppService.getTasks());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Görev eklenemedi.');
    }
  };

  const handleToggleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskBefore = tasks.find((t) => t.id === taskId);
    try {
      setTasks(await AppService.toggleTaskCompletion(taskId));
      if (taskBefore && !taskBefore.is_completed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Görev güncellenemedi.');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setTasks(await AppService.updateTask(taskId, updates));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Görev güncellenemedi.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks(await AppService.deleteTask(taskId));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Görev silinemedi.');
    }
  };

  // --- Drag and Drop Logic ---
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'BOARD') {
      const reordered = Array.from(boards);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const updatedWithPositions = reordered.map((board, idx) => ({
        ...board,
        position: idx
      }));

      setBoards(updatedWithPositions);
      void AppService.saveBoards(updatedWithPositions).catch((error) => {
        alert(error instanceof Error ? error.message : 'Pano sırası kaydedilemedi.');
      });
      return;
    }

    if (type === 'TASK') {
      const destBoardId = destination.droppableId;

      const updatedTasks = Array.from(tasks);
      const taskIndex = updatedTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return;

      const [targetTask] = updatedTasks.splice(taskIndex, 1);
      targetTask.board_id = destBoardId;

      const destBoardTasks = updatedTasks.filter((t) => t.board_id === destBoardId);
      destBoardTasks.splice(destination.index, 0, targetTask);

      destBoardTasks.forEach((t, idx) => {
        t.position = idx;
      });

      const otherBoardTasks = updatedTasks.filter((t) => t.board_id !== destBoardId);
      const finalTasks = [...otherBoardTasks, ...destBoardTasks].sort(
        (a, b) => a.position - b.position
      );

      setTasks(finalTasks);
      void AppService.saveTasks(finalTasks).catch((error) => {
        alert(error instanceof Error ? error.message : 'Görev sırası kaydedilemedi.');
      });
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await AppService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAllUsers([]);
    setBoards([]);
    setTasks([]);
  };

  if (isBootstrapping) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Güvenli oturum doğrulanıyor...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthLockScreen onLogin={handleLogin} />;
  }
  if (!currentUser) return null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative select-none">
      {/* Dynamic Background Image with Smooth Fade */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 -z-10"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-black/25 backdrop-brightness-95"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenBackgroundPicker={() => setIsBgPickerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Horizontal Boards Scroll Container */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-boards" direction="horizontal" type="BOARD">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex items-start space-x-4 h-full pb-4"
              >
                {boards.map((board, index) => {
                  const boardTasks = tasks
                    .filter((t) => t.board_id === board.id)
                    .sort((a, b) => a.position - b.position);

                  return (
                    <BoardColumn
                      key={board.id}
                      board={board}
                      tasks={boardTasks}
                      index={index}
                      allUsers={allUsers}
                      onAddTask={handleAddTask}
                      onToggleCompleteTask={handleToggleCompleteTask}
                      onSelectTask={(task) => setSelectedTask(task)}
                      onUpdateBoardTitle={handleUpdateBoardTitle}
                      onUpdateBoardColor={handleUpdateBoardColor}
                      onDeleteBoard={handleDeleteBoard}
                    />
                  );
                })}
                {provided.placeholder}

                <AddBoardCard onAddBoard={handleAddBoard} />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* Modals */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onUpdateProfile={handleUpdateProfile}
        onToggleUserAccess={handleToggleUserAccess}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />

      <BackgroundPickerModal
        isOpen={isBgPickerOpen}
        onClose={() => setIsBgPickerOpen(false)}
        currentBackground={backgroundUrl}
        onSelectBackground={handleSelectBackground}
      />

      <TaskDetailModal
        task={selectedTask}
        boards={boards}
        allUsers={allUsers}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};

export default App;
