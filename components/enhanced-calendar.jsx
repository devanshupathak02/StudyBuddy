import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const EnhancedCalendar = ({ onDateSelect, studyPlans = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'

  // Get all dates that have study plans
  const studyPlanDates = studyPlans.reduce((dates, plan) => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  // Custom modifiers for styling
  const modifiers = {
    hasStudyPlan: studyPlanDates,
    today: new Date(),
    selected: selectedDate
  };

  // Custom styles for different states
  const modifiersStyles = {
    hasStudyPlan: {
      backgroundColor: '#E3F2FD',
      color: '#1976D2',
      fontWeight: 'bold'
    },
    today: {
      backgroundColor: '#F5F5F5',
      fontWeight: 'bold'
    },
    selected: {
      backgroundColor: '#1976D2',
      color: 'white'
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded ${
              viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded ${
              viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded ${
              viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays
        fixedWeeks
        components={{
          CaptionLabel: ({ displayMonth }) => (
            <div className="flex items-center space-x-4">
              <select
                value={displayMonth.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(displayMonth);
                  newDate.setMonth(parseInt(e.target.value));
                  setSelectedDate(newDate);
                }}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-sm font-medium"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={displayMonth.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(displayMonth);
                  newDate.setFullYear(parseInt(e.target.value));
                  setSelectedDate(newDate);
                }}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-sm font-medium"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )
        }}
        styles={{
          day: { margin: 0 },
          head_cell: { padding: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' },
          cell: { padding: '0.25rem' },
          button: { width: '100%', height: '100%', fontSize: '0.875rem' },
          nav_button: { display: 'none' },
          caption: { 
            padding: '0.25rem', 
            position: 'relative',
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'flex-end'
          },
          caption_label: { display: 'none' },
          nav: { 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            padding: '0.25rem',
            gap: '0.5rem'
          }
        }}
      />

      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
          <span className="text-sm">Study Plan</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
          <span className="text-sm">Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendar; 