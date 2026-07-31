import type { Board, Task, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

const BOARDS_KEY = 'appfabric_boards_v2';
const TASKS_KEY = 'appfabric_tasks_v2';
const USER_KEY = 'appfabric_active_user_v2';
const USERS_LIST_KEY = 'appfabric_users_list_v4';
const BACKGROUNDS_KEY = 'appfabric_user_backgrounds_v2';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const DEFAULT_BACKGROUND =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80';
const PROFILE_COLUMNS =
  'id,email,full_name,avatar_url,background_url,role,is_allowed,created_at';

type AdminActionResult = {
  profile?: UserProfile;
};

const profileFromRow = (row: Record<string, unknown>): UserProfile => ({
  id: String(row.id),
  email: String(row.email),
  full_name: String(row.full_name),
  avatar_url: typeof row.avatar_url === 'string' && row.avatar_url ? row.avatar_url : DEFAULT_AVATAR,
  background_url:
    typeof row.background_url === 'string' && row.background_url
      ? row.background_url
      : DEFAULT_BACKGROUND,
  role: row.role === 'admin' ? 'admin' : 'user',
  is_allowed: row.is_allowed === true,
  created_at: typeof row.created_at === 'string' ? row.created_at : undefined
});

const errorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
};

export class AppService {
  private static saveUsersToCache(users: UserProfile[]) {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }

  private static saveBoardsToCache(boards: Board[]) {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  }

  private static saveTasksToCache(tasks: Task[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  private static setActiveUser(user: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private static async fetchProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(
        'Bu Auth hesabına bağlı, giriş izni olan bir AppFabric profili bulunamadı.'
      );
    }

    const profile = profileFromRow(data as Record<string, unknown>);
    if (!profile.is_allowed) {
      throw new Error(`"${profile.full_name}" kullanıcısının giriş izni kapalıdır.`);
    }
    return profile;
  }

  private static async invokeAdminAction(
    action: string,
    payload: Record<string, unknown>
  ): Promise<AdminActionResult> {
    const { data, error } = await supabase.functions.invoke('user-admin', {
      body: { action, ...payload }
    });

    if (error) {
      throw new Error(errorMessage(error, 'Kullanıcı yönetimi işlemi tamamlanamadı.'));
    }
    if (data?.error) {
      throw new Error(String(data.error));
    }
    return (data ?? {}) as AdminActionResult;
  }

  static async restoreSession(): Promise<UserProfile | null> {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    try {
      const profile = await this.fetchProfile(user.id);
      this.setActiveUser(profile);
      return profile;
    } catch {
      await supabase.auth.signOut();
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  static async loginWithSupabase(emailInput: string, passwordInput: string): Promise<UserProfile> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new Error('E-posta adresi veya şifre hatalı.');
    }

    try {
      const profile = await this.fetchProfile(data.user.id);
      this.setActiveUser(profile);
      await this.syncFromSupabase();
      return profile;
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  }

  static async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem(USER_KEY);
  }

  static async syncFromSupabase(): Promise<UserProfile[]> {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Geçerli bir Supabase oturumu bulunamadı.');
    }

    const [profilesResult, boardsResult, tasksResult] = await Promise.all([
      supabase.from('profiles').select(PROFILE_COLUMNS).order('full_name'),
      supabase.from('boards').select('*').order('position', { ascending: true }),
      supabase.from('tasks').select('*').order('position', { ascending: true })
    ]);

    const firstError = profilesResult.error || boardsResult.error || tasksResult.error;
    if (firstError) {
      throw new Error(errorMessage(firstError, 'Supabase verileri eşitlenemedi.'));
    }

    const users = (profilesResult.data ?? []).map((row) =>
      profileFromRow(row as Record<string, unknown>)
    );
    const boards = (boardsResult.data ?? []) as Board[];
    const tasks = (tasksResult.data ?? []) as Task[];

    this.saveUsersToCache(users);
    this.saveBoardsToCache(boards);
    this.saveTasksToCache(tasks);

    const active = users.find((item) => item.id === user.id);
    if (!active?.is_allowed) {
      await this.logout();
      throw new Error('Bu hesabın AppFabric giriş izni kaldırılmış.');
    }
    this.setActiveUser(active);
    return users;
  }

  static getUsers(): UserProfile[] {
    try {
      const saved = localStorage.getItem(USERS_LIST_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static getActiveUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? (JSON.parse(saved) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
    newPassword?: string
  ): Promise<UserProfile[]> {
    const result = await this.invokeAdminAction('update_self', {
      user_id: userId,
      full_name: updates.full_name,
      email: updates.email,
      avatar_url: updates.avatar_url,
      password: newPassword || undefined
    });
    if (!result.profile) {
      throw new Error('Güncellenmiş profil sunucudan alınamadı.');
    }

    const users = this.getUsers();
    const updatedUsers = users.map((user) =>
      user.id === userId ? result.profile! : user
    );
    this.saveUsersToCache(updatedUsers);
    this.setActiveUser(result.profile);
    return updatedUsers;
  }

  static async toggleUserAccess(userId: string): Promise<UserProfile[]> {
    const users = this.getUsers();
    const target = users.find((user) => user.id === userId);
    if (!target) throw new Error('Kullanıcı bulunamadı.');

    const result = await this.invokeAdminAction('set_access', {
      user_id: userId,
      is_allowed: !target.is_allowed
    });
    if (!result.profile) throw new Error('Kullanıcı izni güncellenemedi.');

    const updatedUsers = users.map((user) =>
      user.id === userId ? result.profile! : user
    );
    this.saveUsersToCache(updatedUsers);
    return updatedUsers;
  }

  static async addUser(
    fullName: string,
    email: string,
    password: string,
    avatarUrl?: string
  ): Promise<UserProfile[]> {
    const result = await this.invokeAdminAction('create_user', {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar_url: avatarUrl?.trim() || DEFAULT_AVATAR
    });
    if (!result.profile) throw new Error('Yeni kullanıcı oluşturulamadı.');

    const users = [...this.getUsers(), result.profile];
    this.saveUsersToCache(users);
    return users;
  }

  static async deleteUser(userId: string): Promise<UserProfile[]> {
    const active = this.getActiveUser();
    if (!active) throw new Error('Geçerli oturum bulunamadı.');
    if (active.id === userId) throw new Error('Aktif kendi hesabınızı silemezsiniz.');

    await this.invokeAdminAction('delete_user', { user_id: userId });
    const users = this.getUsers().filter((user) => user.id !== userId);
    this.saveUsersToCache(users);
    return users;
  }

  static getUserBackground(userId: string): string {
    try {
      const savedMap = localStorage.getItem(BACKGROUNDS_KEY);
      const map = savedMap ? JSON.parse(savedMap) : {};
      if (typeof map[userId] === 'string') return map[userId];
    } catch {
      // Cache is optional.
    }
    return (
      this.getUsers().find((user) => user.id === userId)?.background_url ||
      DEFAULT_BACKGROUND
    );
  }

  static async setUserBackground(userId: string, backgroundUrl: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ background_url: backgroundUrl })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single();
    if (error || !data) {
      throw new Error(errorMessage(error, 'Arka plan kaydedilemedi.'));
    }

    const mapRaw = localStorage.getItem(BACKGROUNDS_KEY);
    const map = mapRaw ? JSON.parse(mapRaw) : {};
    map[userId] = backgroundUrl;
    localStorage.setItem(BACKGROUNDS_KEY, JSON.stringify(map));

    const profile = profileFromRow(data as Record<string, unknown>);
    const users = this.getUsers().map((user) => (user.id === userId ? profile : user));
    this.saveUsersToCache(users);
    this.setActiveUser(profile);
  }

  static getBoards(): Board[] {
    try {
      const saved = localStorage.getItem(BOARDS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.sort((a: Board, b: Board) => a.position - b.position)
        : [];
    } catch {
      return [];
    }
  }

  static async saveBoards(boards: Board[]) {
    const activeUserId = this.getActiveUser()?.id;
    const payload = boards.map(({ id, title, position, color, created_by }) => ({
      id,
      title,
      position,
      color,
      created_by: created_by || activeUserId
    }));
    const { error } = await supabase.from('boards').upsert(payload);
    if (error) throw new Error(errorMessage(error, 'Pano sırası kaydedilemedi.'));
    this.saveBoardsToCache(boards);
  }

  static async addBoard(title: string, creatorId: string): Promise<Board> {
    const board: Board = {
      id: crypto.randomUUID(),
      title: title.trim(),
      position: this.getBoards().length,
      color: '#f1f2f4',
      created_by: creatorId
    };
    const { data, error } = await supabase
      .from('boards')
      .insert(board)
      .select('*')
      .single();
    if (error || !data) throw new Error(errorMessage(error, 'Pano eklenemedi.'));

    const savedBoard = data as Board;
    this.saveBoardsToCache([...this.getBoards(), savedBoard]);
    return savedBoard;
  }

  static async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board[]> {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select('*')
      .single();
    if (error || !data) throw new Error(errorMessage(error, 'Pano güncellenemedi.'));

    const boards = this.getBoards().map((board) =>
      board.id === boardId ? (data as Board) : board
    );
    this.saveBoardsToCache(boards);
    return boards;
  }

  static async deleteBoard(boardId: string): Promise<Board[]> {
    const { error } = await supabase.from('boards').delete().eq('id', boardId);
    if (error) throw new Error(errorMessage(error, 'Pano silinemedi.'));

    const boards = this.getBoards().filter((board) => board.id !== boardId);
    const tasks = this.getTasks().filter((task) => task.board_id !== boardId);
    this.saveBoardsToCache(boards);
    this.saveTasksToCache(tasks);
    return boards;
  }

  static getTasks(): Task[] {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.sort((a: Task, b: Task) => a.position - b.position)
        : [];
    } catch {
      return [];
    }
  }

  static async saveTasks(tasks: Task[]) {
    const { error } = await supabase.from('tasks').upsert(tasks);
    if (error) throw new Error(errorMessage(error, 'Görev sırası kaydedilemedi.'));
    this.saveTasksToCache(tasks);
  }

  static async addTask(boardId: string, title: string, creatorId: string): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      board_id: boardId,
      title: title.trim(),
      description: '',
      is_completed: false,
      assigned_to: creatorId,
      created_by: creatorId,
      position: this.getTasks().filter((item) => item.board_id === boardId).length,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select('*')
      .single();
    if (error || !data) throw new Error(errorMessage(error, 'Görev eklenemedi.'));

    const savedTask = data as Task;
    this.saveTasksToCache([...this.getTasks(), savedTask]);
    return savedTask;
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();
    if (error || !data) throw new Error(errorMessage(error, 'Görev güncellenemedi.'));

    const tasks = this.getTasks().map((task) =>
      task.id === taskId ? (data as Task) : task
    );
    this.saveTasksToCache(tasks);
    return tasks;
  }

  static async toggleTaskCompletion(taskId: string): Promise<Task[]> {
    const task = this.getTasks().find((item) => item.id === taskId);
    if (!task) throw new Error('Görev bulunamadı.');
    return this.updateTask(taskId, { is_completed: !task.is_completed });
  }

  static async deleteTask(taskId: string): Promise<Task[]> {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw new Error(errorMessage(error, 'Görev silinemedi.'));

    const tasks = this.getTasks().filter((task) => task.id !== taskId);
    this.saveTasksToCache(tasks);
    return tasks;
  }
}
