import { create } from 'zustand';

export interface Task {
  id: number;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  due_date: string;
  tags: string;
}

interface TaskStore {
  selectedDate: string;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: string) => void;
  fetchTasksByDate: (date: string) => Promise<void>;
  updateTaskStatus: (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Done') => Promise<void>;
  addTask: (taskData: Omit<Task, 'id'>) => Promise<void>;
  editTask: (taskId: number, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  selectedDate: getTodayDateString(),
  tasks: [],
  isLoading: false,
  error: null,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchTasksByDate(date);
  },

  fetchTasksByDate: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/tasks/?date=${date}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data: Task[] = await response.json();
      set({ tasks: data, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching tasks by date:', err);
      set({ error: err.message || 'An error occurred', isLoading: false });
    }
  },

  updateTaskStatus: async (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    const previousTasks = get().tasks;
    const updatedTasks = previousTasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    set({ tasks: updatedTasks });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task on backend');
      }
      
      const updatedTaskFromServer: Task = await response.json();
      set({
        tasks: get().tasks.map((task) =>
          task.id === taskId ? updatedTaskFromServer : task
        ),
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      set({ tasks: previousTasks }); // Rollback
    }
  },

  addTask: async (taskData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const newTask: Task = await response.json();
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (err) {
      console.error('Error adding task:', err);
    }
  },

  editTask: async (taskId, taskData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to edit task');
      }

      const updatedTask: Task = await response.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
    } catch (err) {
      console.error('Error editing task:', err);
    }
  },

  deleteTask: async (taskId) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  },
}));
