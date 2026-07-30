export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  background_url?: string;
  role?: 'admin' | 'user';
  is_allowed?: boolean;
  created_at?: string;
}

export interface Board {
  id: string;
  title: string;
  position: number;
  color: string; // Header or column accent color
  created_by?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  board_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  assigned_to: string; // UserProfile id
  created_by: string; // UserProfile id
  position: number;
  created_at: string;
}

export interface LandscapeWallpaper {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}
