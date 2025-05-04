import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TaskInput({ onAddTask }) {
  const [taskText, setTaskText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState(''); // State for recurrence selection
  const [showDetails, setShowDetails] = useState(false); // Toggle for details
  const [recurrenceRule, setRecurrenceRule] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    // Simple mapping from dropdown value to RRULE string (basic examples)
    // Requires a valid dueDate to be set for recurrence to make sense
    let recurrenceRule = null;
    if (recurrence && dueDate) {
        switch (recurrence) {
            case 'daily':
                recurrenceRule = 'FREQ=DAILY';
                break;
            case 'weekly':
                recurrenceRule = 'FREQ=WEEKLY';
                break;
            case 'monthly':
                recurrenceRule = 'FREQ=MONTHLY';
                break;
            // Add more options (e.g., yearly) or a custom input later
            default:
                recurrenceRule = null;
        }
    } else if (recurrence && !dueDate) {
        alert("Please set a due date for recurring tasks.");
        return; // Prevent adding recurring task without initial due date
    }

    onAddTask({ text: taskText, dueDate, notes, recurrenceRule });

    // Reset form
    setTaskText('');
    setDueDate('');
    setNotes('');
    setRecurrence('');
    setShowDetails(false); // Hide details after adding
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-5 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Main Task Input */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="What do you need to do?"
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-1 ${
            showDetails 
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800' 
              : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title={showDetails ? "Hide details" : "Show details"}
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Details</span>
        </button>
        
        <button
          type="submit"
          className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white rounded-xl hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-all duration-200 flex-shrink-0 font-medium"
        >
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Optional Details Section - Enhanced Design */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-3 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due Date {recurrence ? <span className="text-red-500 dark:text-red-400 text-xs">*</span> : ''}
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required={!!recurrence}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Repeats
                  </label>
                  <div className="relative">
                    <select
                      id="recurrence"
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="appearance-none w-full p-2.5 pr-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
                    >
                      <option value="">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="FREQ=DAILY;INTERVAL=2">Every 2nd day</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add details, links, or references..."
                  rows="3"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default TaskInput; 