'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useTaskStore, Task } from '../store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Column } from './Column';
import { DateSelector } from './DateSelector';
import { Plus, RefreshCw, X, Loader2, AlertCircle } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { selectedDate, tasks, isLoading, error, fetchTasksByDate, updateTaskStatus, addTask, editTask, deleteTask } = useTaskStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editStatus, setEditStatus] = useState<'To Do' | 'In Progress' | 'Done'>('To Do');
  const [editTagInput, setEditTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-teal-500" /></div>;
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
        tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
      });

      setTitle('');
      setTagInput('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error creating task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditTagInput(task.tags ? task.tags.join(', ') : '');
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    setIsEditing(true);
    try {
      await editTask(editingTask.id, {
        title: editTitle.trim(),
        priority: editPriority,
        status: editStatus,
        tags: editTagInput.split(',').map(t => t.trim()).filter(Boolean),
      });
      setEditingTask(null);
    } catch (err: any) {
      console.error(err);
      alert(`Error updating task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } catch (err: any) {
      console.error(err);
      alert(`Error deleting task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
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
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
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
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg hover:shadow-teal-900/30 hover:scale-[1.02] transition active:scale-[0.98]"
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
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
              <p className="text-slate-400 font-medium text-sm mt-4">Loading tasks...</p>
            </div>
          ) : (
            <>
              <Column id="To Do" title="To Do" tasks={todoTasks} onEdit={handleEditClick} onDelete={handleDeleteClick} />
              <Column id="In Progress" title="In Progress" tasks={inProgressTasks} onEdit={handleEditClick} onDelete={handleDeleteClick} />
              <Column id="Done" title="Done" tasks={doneTasks} onEdit={handleEditClick} onDelete={handleDeleteClick} />
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
                  className="bg-white/5 border border-white/10 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="bg-[#0B0F19] border border-white/10 focus:border-teal-500/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition cursor-pointer"
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
                  className="bg-white/5 border border-white/10 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide-out Panel / Modal for editing tasks */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-5">Edit Task</h3>

            <form onSubmit={handleEditTaskSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Review code architecture"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="bg-[#0B0F19] border border-white/10 focus:border-teal-500/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'To Do' | 'In Progress' | 'Done')}
                    className="bg-[#0B0F19] border border-white/10 focus:border-teal-500/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="frontend, design, refactor"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isEditing}
                className="flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 mt-2 disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Task</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{deletingTask.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeletingTask(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTaskConfirm}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
