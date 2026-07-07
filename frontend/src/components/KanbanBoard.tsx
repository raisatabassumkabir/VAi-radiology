'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Column } from './Column';
import { DateSelector } from './DateSelector';
import { Plus, RefreshCw, X, Loader2, AlertCircle } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { selectedDate, tasks, isLoading, error, fetchTasksByDate, updateTaskStatus, addTask } = useTaskStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (token) {
      fetchTasksByDate(selectedDate);
    }
  }, [selectedDate, fetchTasksByDate, token]);

  if (!token) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.data.current?.taskId;
    const currentStatus = active.data.current?.status;
    const newStatus = over.id as 'To Do' | 'In Progress' | 'Done';

    if (taskId && currentStatus !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        priority,
        status: 'To Do',
        due_date: selectedDate,
        tags: tagInput,
      });

      setTitle('');
      setTagInput('');
      setShowAddForm(false);
      // No need to fetchTasksByDate here, addTask already updates the state locally, but we can if we want
    } catch (err: any) {
      console.error(err);
      alert(`Error creating task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Task Kanban
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Drag and drop tasks to update status. Synchronized in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateSelector />

          <button
            onClick={() => fetchTasksByDate(selectedDate)}
            className="p-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl transition duration-200 shadow-md"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading Overlay or Kanban Columns */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {isLoading && tasks.length === 0 ? (
            <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-slate-400 font-medium text-sm mt-4">Loading tasks...</p>
            </div>
          ) : (
            <>
              <Column id="To Do" title="To Do" tasks={todoTasks} />
              <Column id="In Progress" title="In Progress" tasks={inProgressTasks} />
              <Column id="Done" title="Done" tasks={doneTasks} />
            </>
          )}
        </div>
      </DndContext>

      {/* Slide-out Panel / Modal for adding tasks */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-5">Create New Task</h3>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Review code architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    disabled
                    value={selectedDate}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-slate-400 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="frontend, design, refactor"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
