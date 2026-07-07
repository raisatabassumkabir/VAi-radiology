'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../store/useTaskStore';
import { Tag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      taskId: task.id,
      status: task.status,
    },
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : {};

  const priorityColors = {
    Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    High: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative flex flex-col gap-3 p-4 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-2xl shadow-md transition duration-200 cursor-grab active:cursor-grabbing hover:border-white/20 hover:bg-white/[0.08] ${
        isDragging ? 'opacity-40 border-indigo-500/50 shadow-indigo-500/10 shadow-2xl scale-[1.02]' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-slate-100 font-semibold text-base leading-snug group-hover:text-white transition">
          {task.title}
        </h4>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
            priorityColors[task.priority] || priorityColors.Medium
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {task.tags.split(',').map((tag, idx) => {
            const trimmedTag = tag.trim();
            if (!trimmedTag) return null;
            return (
              <span
                key={idx}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"
              >
                <Tag className="w-2.5 h-2.5 text-slate-500" />
                {trimmedTag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
