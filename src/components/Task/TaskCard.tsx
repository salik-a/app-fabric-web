import React from 'react';
import type { Task, UserProfile } from '../../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  allUsers: UserProfile[];
  onToggleComplete: (taskId: string, e: React.MouseEvent) => void;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  allUsers,
  onToggleComplete,
  onSelectTask
}) => {
  // Find assigned user profile dynamically from allUsers
  const assignedUser = allUsers.find((u) => u.id === task.assigned_to) || {
    full_name: 'Atanmamış',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-slate-300 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none ${
        task.is_completed ? 'bg-slate-50/70 border-slate-200' : ''
      }`}
    >
      <div className="flex items-start space-x-2.5">
        {/* Left Side: Completion Toggle Checkbox */}
        <button
          type="button"
          onClick={(e) => onToggleComplete(task.id, e)}
          className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-500 transition-colors focus:outline-none"
          title={task.is_completed ? 'Tamamlanmadı yap' : 'Tamamlandı işaretle'}
        >
          {task.is_completed ? (
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
            </div>
          ) : (
            <Circle className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-emerald-600 transition-opacity stroke-[1.8]" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug break-words ${
              task.is_completed
                ? 'text-slate-400 line-through decoration-slate-400/60'
                : 'text-slate-800 font-semibold'
            }`}
          >
            {task.title}
          </p>

          {/* Footer Metadata & User Avatar */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            {task.description ? (
              <span className="truncate text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                Açıklama var
              </span>
            ) : (
              <span></span>
            )}

            {/* Assigned User Avatar */}
            {assignedUser && (
              <div
                className="flex items-center space-x-1 ml-auto"
                title={`Atanan: ${assignedUser.full_name}`}
              >
                <img
                  src={assignedUser.avatar_url}
                  alt={assignedUser.full_name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
