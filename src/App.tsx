import React, { useState, useEffect } from 'react';
import type { Board, Task, UserProfile } from './types';
import { AppService } from './services/appService';
import { Navbar } from './components/Header/Navbar';
import { BoardColumn } from './components/Board/BoardColumn';
import { AddBoardCard } from './components/Board/AddBoardCard';
import { LoginModal } from './components/Auth/LoginModal';
import { BackgroundPickerModal } from './components/Background/BackgroundPickerModal';
import { TaskDetailModal } from './components/Task/TaskDetailModal';
import { UserManagementModal } from './components/User/UserManagementModal';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // --- States ---
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => AppService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => AppService.getActiveUser());
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() =>
    AppService.getUserBackground(currentUser.id)
  );

  const [boards, setBoards] = useState<Board[]>(() => AppService.getBoards());
  const [tasks, setTasks] = useState<Task[]>(() => AppService.getTasks());

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Sync background when user changes
  useEffect(() => {
    const bg = AppService.getUserBackground(currentUser.id);
    setBackgroundUrl(bg);
  }, [currentUser]);

  // --- User Management Handlers ---
  const handleSelectUser = (user: UserProfile) => {
    try {
      AppService.setActiveUser(user);
      setCurrentUser(user);
    } catch (err: any) {
      alert(err.message || 'Giriş yapılamadı.');
    }
  };

  const handleUpdateProfile = (userId: string, updates: Partial<UserProfile>) => {
    const updatedUsers = AppService.updateUserProfile(userId, updates);
    setAllUsers(updatedUsers);
    const updatedActive = AppService.getActiveUser();
    setCurrentUser(updatedActive);
  };

  const handleToggleUserAccess = (userId: string) => {
    const updatedUsers = AppService.toggleUserAccess(userId);
    setAllUsers(updatedUsers);
  };

  const handleAddUser = (fullName: string, email: string, avatarUrl?: string) => {
    const updatedUsers = AppService.addUser(fullName, email, avatarUrl);
    setAllUsers(updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    try {
      const updatedUsers = AppService.deleteUser(userId);
      setAllUsers(updatedUsers);
      setTasks(AppService.getTasks());
    } catch (err: any) {
      alert(err.message || 'Kullanıcı silinemedi.');
    }
  };

  const handleSelectBackground = (url: string) => {
    setBackgroundUrl(url);
    AppService.setUserBackground(currentUser.id, url);
  };

  // Boards CRUD
  const handleAddBoard = (title: string) => {
    AppService.addBoard(title);
    setBoards(AppService.getBoards());
  };

  const handleUpdateBoardTitle = (boardId: string, title: string) => {
    const updated = AppService.updateBoard(boardId, { title });
    setBoards(updated);
  };

  const handleUpdateBoardColor = (boardId: string, color: string) => {
    const updated = AppService.updateBoard(boardId, { color });
    setBoards(updated);
  };

  const handleDeleteBoard = (boardId: string) => {
    const updatedBoards = AppService.deleteBoard(boardId);
    setBoards(updatedBoards);
    setTasks(AppService.getTasks());
  };

  // Tasks CRUD
  const handleAddTask = (boardId: string, title: string) => {
    AppService.addTask(boardId, title, currentUser.id);
    setTasks(AppService.getTasks());
  };

  const handleToggleCompleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskBefore = tasks.find((t) => t.id === taskId);
    const updated = AppService.toggleTaskCompletion(taskId);
    setTasks(updated);

    if (taskBefore && !taskBefore.is_completed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updated = AppService.updateTask(taskId, updates);
    setTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = AppService.deleteTask(taskId);
    setTasks(updated);
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
      AppService.saveBoards(updatedWithPositions);
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
      AppService.saveTasks(finalTasks);
    }
  };

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
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenBackgroundPicker={() => setIsBgPickerOpen(true)}
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
      <LoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
      />

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
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};

export default App;
