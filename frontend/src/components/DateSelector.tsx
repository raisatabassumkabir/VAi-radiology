'use client';

import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const DateSelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useTaskStore();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleShiftDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    if (!isNaN(currentDate.getTime())) {
      currentDate.setDate(currentDate.getDate() + days);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg transition duration-200 hover:border-white/20">
      <button
        onClick={() => handleShiftDate(-1)}
        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
        title="Previous Day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="bg-transparent text-white border-0 focus:ring-0 cursor-pointer text-sm font-semibold outline-none py-0.5 px-1"
        />
      </div>

      <button
        onClick={() => handleShiftDate(1)}
        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
        title="Next Day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
