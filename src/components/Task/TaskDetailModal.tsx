import React, { useState, useEffect } from 'react';
import type { Task, Board, UserProfile } from '../../types';
import {
  X,
  User,
  Calendar,
  Trash2,
  FileText,
  Clock,
  Layers
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  boards: Board[];
  allUsers: UserProfile[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  boards,
  allUsers,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedTo(task.assigned_to);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentBoard = boards.find((b) => b.id === task.board_id);
  const creatorUser = allUsers.find((u) => u.id === task.created_by);

  const handleSave = () => {
    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      assigned_to: assignedTo
    });
    onClose();
  };

  const formattedDate = new Date(task.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>PANO:</span>
            <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md">
              {currentBoard?.title || 'Bilinmeyen Pano'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Task Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Görev Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-base font-bold text-white focus:outline-none transition-colors"
              placeholder="Görev başlığı yazın..."
            />
          </div>

          {/* User Assignment & Created At Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
            {/* User Assignment Select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Atanan Kullanıcı</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Created At & Creator info */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Oluşturulma Bilgisi</span>
              </label>
              <div className="text-xs text-slate-300 space-y-1">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Oluşturan:{' '}
                  <strong className="text-slate-200">
                    {creatorUser?.full_name || 'Sistem'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Task Detailed Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Görev Detayı & Açıklama</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Göreve dair detaylı bilgi, açıklama veya notlarınızı buraya ekleyin..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors custom-scrollbar"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Görevi Sil</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
