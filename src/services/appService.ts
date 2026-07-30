import type { Board, Task, UserProfile } from '../types';
import { INITIAL_BOARDS, INITIAL_TASKS, PREDEFINED_USERS, supabase } from '../lib/supabase';

const BOARDS_KEY = 'appfabric_boards_v1';
const TASKS_KEY = 'appfabric_tasks_v1';
const USER_KEY = 'appfabric_active_user_v1';
const USERS_LIST_KEY = 'appfabric_users_list_v3';
const BACKGROUNDS_KEY = 'appfabric_user_backgrounds_v1';
const AUTH_SESSION_KEY = 'appfabric_is_authenticated_v1';

export class AppService {
  // --- User Authentication & Session ---
  static getUsers(): UserProfile[] {
    try {
      const saved = localStorage.getItem(USERS_LIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(PREDEFINED_USERS));
    return PREDEFINED_USERS;
  }

  static saveUsers(users: UserProfile[]) {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }

  static isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_SESSION_KEY) === 'true';
  }

  static loginWithEmailAndPassword(emailInput: string, passwordInput: string): UserProfile {
    const users = this.getUsers();
    const targetEmail = emailInput.trim().toLowerCase();

    const user = users.find(u => u.email.trim().toLowerCase() === targetEmail);

    if (!user) {
      throw new Error('Girdiğiniz e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
    }

    if (!user.is_allowed) {
      throw new Error(`"${user.full_name}" kullanıcısının yetkili giriş izni kilitlidir.`);
    }

    const expectedPassword = user.password || '1234';
    if (passwordInput.trim() !== expectedPassword) {
      throw new Error('Hatalı şifre girdiniz. Lütfen tekrar deneyin.');
    }

    // Set active user & save persistent authenticated session
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_SESSION_KEY, 'true');

    return user;
  }

  static getActiveUser(): UserProfile {
    const users = this.getUsers();
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = users.find(u => u.id === parsed.id && u.is_allowed);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
    const allowedUser = users.find(u => u.is_allowed) || users[0];
    localStorage.setItem(USER_KEY, JSON.stringify(allowedUser));
    return allowedUser;
  }

  static setActiveUser(user: UserProfile) {
    if (!user.is_allowed) {
      throw new Error('Bu kullanıcının yetkili giriş izni yoktur.');
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile[] {
    const users = this.getUsers();
    const updated = users.map(u => (u.id === userId ? { ...u, ...updates } : u));
    this.saveUsers(updated);

    const active = this.getActiveUser();
    if (active.id === userId) {
      const updatedActive = { ...active, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedActive));
    }

    supabase.from('profiles').update(updates).eq('id', userId);

    return updated;
  }

  static toggleUserAccess(userId: string): UserProfile[] {
    const users = this.getUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, is_allowed: !u.is_allowed };
      }
      return u;
    });
    this.saveUsers(updated);
    return updated;
  }

  static addUser(fullName: string, email: string, passwordInput?: string, avatarUrl?: string): UserProfile[] {
    const users = this.getUsers();
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email: email.trim(),
      full_name: fullName.trim(),
      password: passwordInput?.trim() || '1234',
      avatar_url: avatarUrl?.trim() || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      background_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
      role: 'user',
      is_allowed: true
    };

    const updated = [...users, newUser];
    this.saveUsers(updated);

    supabase.from('profiles').insert([{
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      avatar_url: newUser.avatar_url,
      background_url: newUser.background_url
    }]);

    return updated;
  }

  static deleteUser(userId: string): UserProfile[] {
    const active = this.getActiveUser();
    if (active.id === userId) {
      throw new Error('Aktif kendi hesabınızı silemezsiniz.');
    }

    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    this.saveUsers(updatedUsers);

    const currentTasks = this.getTasks();
    const updatedTasks = currentTasks.map(t => {
      if (t.assigned_to === userId) {
        return { ...t, assigned_to: active.id };
      }
      return t;
    });
    this.saveTasks(updatedTasks);

    supabase.from('profiles').delete().eq('id', userId);

    return updatedUsers;
  }

  static logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
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
    const user = this.getUsers().find(u => u.id === userId);
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
