import React, { useState } from 'react';
import type { Board, Task } from '../../types';
import { TaskCard } from '../Task/TaskCard';
import { BoardHeaderMenu } from './BoardHeaderMenu';
import { Plus, MoreHorizontal, X, FilePlus } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface BoardColumnProps {
  board: Board;
  tasks: Task[];
  index: number;
  onAddTask: (boardId: string, title: string) => void;
  onToggleCompleteTask: (taskId: string, e: React.MouseEvent) => void;
  onSelectTask: (task: Task) => void;
  onUpdateBoardTitle: (boardId: string, title: string) => void;
  onUpdateBoardColor: (boardId: string, color: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  board,
  tasks,
  index,
  onAddTask,
  onToggleCompleteTask,
  onSelectTask,
  onUpdateBoardTitle,
  onUpdateBoardColor,
  onDeleteBoard
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(board.id, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <Draggable draggableId={board.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-72 sm:w-80 shrink-0 flex flex-col rounded-2xl max-h-full shadow-lg transition-shadow duration-200 select-none ${
            snapshot.isDragging ? 'ring-2 ring-blue-400 shadow-2xl opacity-95' : ''
          }`}
          style={{
            backgroundColor: board.color || '#f1f2f4',
            ...provided.draggableProps.style
          }}
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="p-3.5 flex items-center justify-between relative border-b border-black/5"
          >
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              <h3 className="font-bold text-sm text-slate-800 truncate tracking-tight">
                {board.title}
              </h3>
            </div>

            {/* Task Count Badge & Menu */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 px-1.5 py-0.5 rounded-md">
                {tasks.length}
              </span>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-md hover:bg-slate-200/80 text-slate-600 transition-colors"
                title="Pano Seçenekleri"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <BoardHeaderMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              boardTitle={board.title}
              currentColor={board.color}
              onUpdateTitle={(title) => onUpdateBoardTitle(board.id, title)}
              onUpdateColor={(color) => onUpdateBoardColor(board.id, color)}
              onDeleteBoard={() => onDeleteBoard(board.id)}
            />
          </div>

          {/* Droppable Task Cards Container */}
          <Droppable droppableId={board.id} type="TASK">
            {(providedDrop, snapshotDrop) => (
              <div
                ref={providedDrop.innerRef}
                {...providedDrop.droppableProps}
                className={`p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar flex-1 min-h-[50px] transition-colors duration-150 ${
                  snapshotDrop.isDraggingOver ? 'bg-black/5 rounded-xl' : ''
                }`}
              >
                {tasks.map((task, taskIndex) => (
                  <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                    {(providedDrag) => (
                      <div
                        ref={providedDrag.innerRef}
                        {...providedDrag.draggableProps}
                        {...providedDrag.dragHandleProps}
                      >
                        <TaskCard
                          task={task}
                          index={taskIndex}
                          onToggleComplete={onToggleCompleteTask}
                          onSelectTask={onSelectTask}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDrop.placeholder}
              </div>
            )}
          </Droppable>

          {/* Column Footer: Inline Task Creation Flow */}
          <div className="p-2.5 border-t border-black/5">
            {isAddingTask ? (
              <form onSubmit={handleCreateTask} className="space-y-2.5 animate-fadeIn">
                <textarea
                  rows={2}
                  autoFocus
                  placeholder="Bir başlık girin veya bir bağlantı yapıştırın"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateTask();
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                    >
                      Görev Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTaskTitle('');
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition-colors"
                      title="Vazgeç"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between text-slate-600 hover:text-slate-900">
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="flex-1 flex items-center space-x-2 px-2 py-1.5 hover:bg-slate-200/70 rounded-lg font-medium text-xs transition-colors text-left"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Görev ekle</span>
                </button>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 transition-colors"
                  title="Hızlı Görev Ekle"
                >
                  <FilePlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
