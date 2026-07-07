'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '../store/useTaskStore';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  id: 'To Do' | 'In Progress' | 'Done';
  title: string;
  tasks: Task[];
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const columnStyles = {
    'To Do': 'border-slate-800/40 bg-slate-950/20 text-slate-400',
    'In Progress': 'border-indigo-900/20 bg-indigo-950/10 text-indigo-400',
    'Done': 'border-emerald-900/20 bg-emerald-950/10 text-emerald-400',
  };

  const badgeStyles = {
    'To Do': 'text-slate-300 bg-slate-500/10',
    'In Progress': 'text-indigo-300 bg-indigo-500/10',
    'Done': 'text-emerald-300 bg-emerald-500/10',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-4 p-5 rounded-3xl border backdrop-blur-lg min-h-[500px] transition duration-200 ${
        columnStyles[id]
      } ${isOver ? 'ring-2 ring-indigo-500/40 border-indigo-500/40 bg-white/5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            id === 'To Do' ? 'bg-slate-400' : id === 'In Progress' ? 'bg-indigo-400' : 'bg-emerald-400'
          }`} />
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${badgeStyles[id]}`}>
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <p className="text-sm text-slate-500 text-center font-medium">Empty Column</p>
          </div>
        )}
      </div>
    </div>
  );
};
