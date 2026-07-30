import type { Board, Task, UserProfile } from '../types';
import { INITIAL_BOARDS, INITIAL_TASKS, PREDEFINED_USERS, supabase } from '../lib/supabase';

const BOARDS_KEY = 'appfabric_boards_v1';
const TASKS_KEY = 'appfabric_tasks_v1';
const USER_KEY = 'appfabric_active_user_v1';
const BACKGROUNDS_KEY = 'appfabric_user_backgrounds_v1';

export class AppService {
  // --- User Auth & Session ---
  static getActiveUser(): UserProfile {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    const defaultUser = PREDEFINED_USERS[0];
    localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }

  static setActiveUser(user: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static getUsers(): UserProfile[] {
    return PREDEFINED_USERS;
  }

  // --- Background Wallpapers ---
  static getUserBackground(userId: string): string {
    try {
      const savedMap = localStorage.getItem(BACKGROUNDS_KEY);
      if (savedMap) {
        const map = JSON.parse(savedMap);
        if (map[userId]) return map[userId];
      }
    } catch {
      // ignore
    }
    const user = PREDEFINED_USERS.find(u => u.id === userId);
    return user?.background_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80';
  }

  static setUserBackground(userId: string, backgroundUrl: string) {
    try {
      const savedMap = localStorage.getItem(BACKGROUNDS_KEY);
      const map = savedMap ? JSON.parse(savedMap) : {};
      map[userId] = backgroundUrl;
      localStorage.setItem(BACKGROUNDS_KEY, JSON.stringify(map));

      supabase.from('profiles').update({ background_url: backgroundUrl }).eq('id', userId);
    } catch (e) {
      console.error('Error saving background:', e);
    }
  }

  // --- Boards ---
  static getBoards(): Board[] {
    try {
      const saved = localStorage.getItem(BOARDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => a.position - b.position);
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(BOARDS_KEY, JSON.stringify(INITIAL_BOARDS));
    return INITIAL_BOARDS;
  }

  static saveBoards(boards: Board[]) {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  }

  static addBoard(title: string): Board {
    const current = this.getBoards();
    const newBoard: Board = {
      id: 'board_' + Date.now(),
      title,
      position: current.length,
      color: '#f1f2f4'
    };
    const updated = [...current, newBoard];
    this.saveBoards(updated);
    return newBoard;
  }

  static updateBoard(boardId: string, updates: Partial<Board>): Board[] {
    const current = this.getBoards();
    const updated = current.map(b => (b.id === boardId ? { ...b, ...updates } : b));
    this.saveBoards(updated);
    return updated;
  }

  static deleteBoard(boardId: string): Board[] {
    const current = this.getBoards();
    const updated = current.filter(b => b.id !== boardId);
    this.saveBoards(updated);
    
    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.filter(t => t.board_id !== boardId);
    this.saveTasks(updatedTasks);

    return updated;
  }

  // --- Tasks ---
  static getTasks(): Task[] {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => a.position - b.position);
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }

  static saveTasks(tasks: Task[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  static addTask(boardId: string, title: string, creatorId: string): Task {
    const current = this.getTasks();
    const boardTasks = current.filter(t => t.board_id === boardId);
    
    const newTask: Task = {
      id: 'task_' + Date.now(),
      board_id: boardId,
      title,
      description: '',
      is_completed: false,
      assigned_to: creatorId,
      created_by: creatorId,
      position: boardTasks.length,
      created_at: new Date().toISOString()
    };

    const updated = [...current, newTask];
    this.saveTasks(updated);
    return newTask;
  }

  static updateTask(taskId: string, updates: Partial<Task>): Task[] {
    const current = this.getTasks();
    const updated = current.map(t => (t.id === taskId ? { ...t, ...updates } : t));
    this.saveTasks(updated);
    return updated;
  }

  static toggleTaskCompletion(taskId: string): Task[] {
    const current = this.getTasks();
    const updated = current.map(t => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
    this.saveTasks(updated);
    return updated;
  }

  static deleteTask(taskId: string): Task[] {
    const current = this.getTasks();
    const updated = current.filter(t => t.id !== taskId);
    this.saveTasks(updated);
    return updated;
  }
}
