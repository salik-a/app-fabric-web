import { createClient } from '@supabase/supabase-js';
import type { UserProfile, Board, Task, LandscapeWallpaper } from '../types';

// Supabase Environment variables or fallback demo mode
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-appfabric.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Pre-defined allowed users for login & assignment
export const PREDEFINED_USERS: UserProfile[] = [
  {
    id: 'usr_salika',
    email: 'salika@appfabric.com',
    full_name: 'Salika',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    background_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'usr_ahmet',
    email: 'ahmet@appfabric.com',
    full_name: 'Ahmet Yılmaz',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    background_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'usr_zeynep',
    email: 'zeynep@appfabric.com',
    full_name: 'Zeynep Kaya',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    background_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'
  },
  {
    id: 'usr_admin',
    email: 'admin@appfabric.com',
    full_name: 'Sistem Yöneticisi',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    background_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80'
  }
];

// Sample Landscape Wallpapers (User selectable)
export const LANDSCAPE_WALLPAPERS: LandscapeWallpaper[] = [
  {
    id: 'wall_mountains',
    title: 'Alp Dağları Gün Batımı',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'wall_lake',
    title: 'Göl & Karlı Zirveler',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'wall_aurora',
    title: 'Kuzey Işıkları (Aurora)',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'wall_forest',
    title: 'Sisli Doğa Ormanı',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'wall_night',
    title: 'Gece Gökyüzü & Samanyolu',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'wall_blue_ridge',
    title: 'Mavi Dağ VADİSİ',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=300&q=80'
  }
];

// Initial default boards based on Trello reference screenshots
export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board_1',
    title: 'Pano 1',
    position: 0,
    color: '#f1f2f4'
  },
  {
    id: 'board_2',
    title: 'SafeFood',
    position: 1,
    color: '#f1f2f4'
  },
  {
    id: 'board_3',
    title: 'This Week',
    position: 2,
    color: '#f1f2f4'
  },
  {
    id: 'board_4',
    title: 'Tamamlandı',
    position: 3,
    color: '#f1f2f4'
  }
];

// Initial default tasks based on user screenshots
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    board_id: 'board_1',
    title: 'Görev 1',
    description: 'Pano 1 içindeki ilk görev kartı detayı.',
    is_completed: true,
    assigned_to: 'usr_salika',
    created_by: 'usr_salika',
    position: 0,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'task_2',
    board_id: 'board_1',
    title: 'Görev 2',
    description: 'Pano 1 içindeki ikinci örnek görev.',
    is_completed: false,
    assigned_to: 'usr_salika',
    created_by: 'usr_salika',
    position: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'task_3',
    board_id: 'board_2',
    title: 'App store safe food uygulaması kurulum aşamalarını tamamla',
    description: 'SafeFood uygulaması App Store yayını hazırlıkları ve SDK kurulumları.',
    is_completed: false,
    assigned_to: 'usr_salika',
    created_by: 'usr_salika',
    position: 0,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'task_4',
    board_id: 'board_2',
    title: 'Play console safe food uygulaması kurulum aşamalarını tamamla.',
    description: 'Google Play Console mağaza girişi ve gizlilik politikaları entegrasyonu.',
    is_completed: false,
    assigned_to: 'usr_ahmet',
    created_by: 'usr_salika',
    position: 1,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: 'task_5',
    board_id: 'board_2',
    title: 'Market fiyatı sitesini referans alarak stitch tasarımı oluştur.',
    description: 'Fiyat kıyaslama modülü ve sepet tasarımı Stitch UI.',
    is_completed: false,
    assigned_to: 'usr_zeynep',
    created_by: 'usr_salika',
    position: 2,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'task_6',
    board_id: 'board_3',
    title: 'Shippatonu araştır ve kaydol',
    description: 'Lojistik kargo entegrasyonu için Shippato platformu incelemesi.',
    is_completed: false,
    assigned_to: 'usr_salika',
    created_by: 'usr_salika',
    position: 0,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'task_7',
    board_id: 'board_4',
    title: 'Galley Swipe uygulamasının app store mağazasını yayına hazırla',
    description: 'Görseller ve açıklama metinleri tamamlandı.',
    is_completed: true,
    assigned_to: 'usr_salika',
    created_by: 'usr_salika',
    position: 0,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];
