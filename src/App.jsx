import React, { useState, useEffect } from 'react';
import { RRule } from 'rrule'; // Import RRule
import TaskInput from './components/TaskInput'; // Import the new component
import TaskList from './components/TaskList'; // Import the TaskList component
import WeightTracker from './components/WeightTracker'; // Import WeightTracker
import TaskHistory from './components/TaskHistory'; // Import TaskHistory

const TASKS_STORAGE_KEY = 'todoApp.tasks'; // Define key for localStorage
const WEIGHT_STORAGE_KEY = 'todoApp.weightEntries'; // Key for weight data
const STREAK_STORAGE_KEY = 'todoApp.streakInfo'; // Key for streak data
const THEME_STORAGE_KEY = 'todoApp.theme'; // Key for theme preference

// Helper to get today's date as YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().slice(0, 10);

// Theme Toggle Component
function ThemeToggle({ darkMode, toggleDarkMode }) {
  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-lg transition-all z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        // Sun icon for light mode
        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function App() {
  // Initialize state from localStorage or an empty array
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    // Add basic validation/migration logic if structure changes over time
    try {
        const parsed = storedTasks ? JSON.parse(storedTasks) : [];
        // Ensure tasks have the expected structure (e.g., subtasks array)
        return Array.isArray(parsed) ? parsed.map(t => ({ ...t, subtasks: t.subtasks || [] })) : [];
    } catch (e) {
        console.error("Failed to parse tasks from localStorage:", e);
        return [];
    }
  });

  // Weight State
  const [weightEntries, setWeightEntries] = useState(() => {
    const storedWeight = localStorage.getItem(WEIGHT_STORAGE_KEY);
     try {
        const parsed = storedWeight ? JSON.parse(storedWeight) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse weight entries from localStorage:", e);
        return [];
    }
  });

  // Streak State - Load from localStorage
  const [streakInfo, setStreakInfo] = useState(() => {
      const storedStreak = localStorage.getItem(STREAK_STORAGE_KEY);
      try {
          const parsed = storedStreak ? JSON.parse(storedStreak) : { count: 0, lastCompletionDate: null };
          // Basic validation
          if (typeof parsed.count === 'number' && (parsed.lastCompletionDate === null || typeof parsed.lastCompletionDate === 'string')) {
              return parsed;
          }
      } catch (e) {
           console.error("Failed to parse streak info:", e);
      }
      return { count: 0, lastCompletionDate: null }; // Default
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Theme toggle function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // History Modal State
  const [showHistory, setShowHistory] = useState(false);

  // Effect to save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]); // Dependency array ensures this runs only when tasks change

  // Effect for Weight Persistence
  useEffect(() => {
    localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(weightEntries));
  }, [weightEntries]);

  // Effect for Streak Persistence
  useEffect(() => {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakInfo));
  }, [streakInfo]);

  // Effect to check and potentially reset streak if a day is missed
  useEffect(() => {
    const todayStr = getTodayDateString();
    if (streakInfo.lastCompletionDate && streakInfo.lastCompletionDate !== todayStr) {
        const lastDate = new Date(streakInfo.lastCompletionDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 1) {
            console.log('Streak reset due to missed day.');
            setStreakInfo({ count: 0, lastCompletionDate: null });
        }
    }
    // Run only once on load or if streakInfo changes significantly elsewhere
  }, [streakInfo.lastCompletionDate]); 

  // Effect to advance overdue recurring tasks on load
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
    const todayStr = getTodayDateString(); 
    let needsUpdate = false;

    const updatedTasks = tasks.map(task => {
      if (task.recurrenceRule && task.dueDate) {
        const dueDate = new Date(task.dueDate + 'T00:00:00Z');

        // Check if the task's due date is in the past
        if (dueDate < today) {
           console.log(`Task ${task.id} (${task.text}) is overdue (${task.dueDate}), calculating next occurrence.`);
           try {
                const rule = RRule.fromString(`DTSTART:${task.dueDate.replace(/-/g, '')}T000000Z\nRRULE:${task.recurrenceRule}`);
                // Find the *first* occurrence that is on or after today
                const nextOccurrence = rule.after(new Date(today.getTime() - (24 * 60 * 60 * 1000)), true); // Start search from yesterday to include today
                
                if (nextOccurrence) {
                    const nextDueDateStr = nextOccurrence.toISOString().slice(0, 10);
                     console.log(`   Next occurrence for ${task.id}: ${nextDueDateStr}`);
                     // Only update if the date actually changes or if it was completed before today
                    if (task.dueDate !== nextDueDateStr || (task.completed && task.completedAt && !task.completedAt.startsWith(todayStr))) {
                         needsUpdate = true;
                         return {
                           ...task,
                           dueDate: nextDueDateStr,
                           completed: false, // Reset completion status
                           completedAt: null,
                           subtasks: task.subtasks.map(sub => ({ ...sub, completed: false })) // Reset subtasks
                         };
                    } else {
                         console.log(`   Task ${task.id} already has correct due date (${task.dueDate}) or was completed today.`);
                    }
                } else {
                     console.log(`   Task ${task.id} has no future occurrences.`);
                     // Potentially mark as permanently completed if needed, but likely handled by toggleComplete
                 }
           } catch (error) {
               console.error(`Error processing recurrence for task ${task.id} on load:`, error);
           }
        } else if (task.dueDate === todayStr && task.completed && task.completedAt && !task.completedAt.startsWith(todayStr)) {
           // Handle edge case: task due today but completed on a previous day (e.g., app closed overnight)
           console.log(`Task ${task.id} due today but completed previously, resetting.`);
           needsUpdate = true;
           return {
               ...task,
               completed: false,
               completedAt: null,
               subtasks: task.subtasks.map(sub => ({ ...sub, completed: false }))
           };
        }
      }
      return task; // Return unmodified task if no changes needed
    });

    // Only call setTasks if any tasks were actually updated
    if (needsUpdate) {
        console.log("Updating tasks state with advanced recurring dates.");
        setTasks(updatedTasks);
    }

    // Run only once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means run once

  // --- Streak Calculation Logic ---
  const updateStreak = () => {
    console.log("Recalculating streak...");
    const todayStr = getTodayDateString();
    const yesterday = new Date(); 
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Find any non-recurring tasks completed today
    const nonRecurringCompletedToday = tasks.some(task => 
        !task.recurrenceRule && 
        task.completed && 
        task.completedAt?.startsWith(todayStr)
    );

    console.log(`  Tasks completed today (non-recurring): ${nonRecurringCompletedToday}`);
    console.log(`  Current streak info: count=${streakInfo.count}, lastCompletionDate=${streakInfo.lastCompletionDate}`);

    let newStreakCount = streakInfo.count;
    let newLastCompletionDate = streakInfo.lastCompletionDate;

    if (nonRecurringCompletedToday) {
        // At least one relevant task was completed today
        if (newLastCompletionDate !== todayStr) {
            // Need to update the streak for today
            if (newLastCompletionDate === yesterdayStr) {
                 console.log("  Continuing streak from yesterday.");
                 newStreakCount += 1;
            } else {
                 console.log("  Starting new streak today.");
                 newStreakCount = 1; // Start a new streak
            }
            newLastCompletionDate = todayStr;
        } else {
            console.log("  Streak already updated for today.");
        }
    } else {
        // No relevant tasks completed today
        if (newLastCompletionDate === todayStr) {
            // Streak was previously updated for today, but now it's broken by unchecking
            console.log("  Streak broken for today by unchecking task.");
            // Revert to yesterday's state if the streak was continued from yesterday
            if (streakInfo.count > 1 && tasks.some(task => !task.recurrenceRule && task.completed && task.completedAt?.startsWith(yesterdayStr))) {
                console.log("  Reverting streak to yesterday.");
                newStreakCount -= 1;
                newLastCompletionDate = yesterdayStr;
            } else {
                console.log("  Resetting streak completely.");
                newStreakCount = 0;
                newLastCompletionDate = null; // Or keep yesterday if just count was 1? For simplicity, reset fully.
            }
        } else {
            console.log("  No tasks completed today, and streak wasn't for today anyway.");
        }
    }

    // Only update state if something actually changed
    if (newStreakCount !== streakInfo.count || newLastCompletionDate !== streakInfo.lastCompletionDate) {
        console.log(`  Updating streak state: count=${newStreakCount}, lastCompletionDate=${newLastCompletionDate}`);
        setStreakInfo({ count: newStreakCount, lastCompletionDate: newLastCompletionDate });
    }
  };

  // Effect to update streak whenever tasks change
  useEffect(() => {
      updateStreak();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); // Recalculate streak when tasks array changes
  // --- End Streak Calculation Logic ---

  // Function to add a new task (basic implementation for now)
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      text: taskData.text,
      dueDate: taskData.dueDate || null,
      notes: taskData.notes || '',
      recurrenceRule: taskData.recurrenceRule || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      subtasks: [],
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Toggle completion - Updated for Unchecking and Streak
  const toggleComplete = (taskId, subtaskId = null) => {
    console.log(`App: toggleComplete called - taskId: ${taskId}, subtaskId: ${subtaskId}`);
    // let taskJustCompletedNonRecurring = false; // REMOVED - Handled by useEffect

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          let taskToUpdate = { ...task };
          const wasCompleted = task.completed;
          const newCompletedStatus = !wasCompleted;

          if (subtaskId) {
            console.log(`Toggling subtask ${subtaskId} for task ${taskId}. Current parent completed: ${wasCompleted}`); // DEBUG
            // --- Subtask Logic ---
            console.log('Subtasks before update:', task.subtasks.map(s => ({id: s.id, completed: s.completed}))); // DEBUG
            const updatedSubtasks = task.subtasks.map(sub =>
               sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            );
            console.log('Subtasks after update:', updatedSubtasks.map(s => ({id: s.id, completed: s.completed}))); // DEBUG
            taskToUpdate.subtasks = updatedSubtasks;
            const parentNowComplete = updatedSubtasks.length > 0 && updatedSubtasks.every(sub => sub.completed);
            console.log(`Check if parent should complete: parentNowComplete=${parentNowComplete}, wasCompleted=${wasCompleted}`); // DEBUG

            if (parentNowComplete && !wasCompleted) { // Parent completes via last subtask
                console.log(`Completing parent task ${taskId} via last subtask.`); // DEBUG
                taskToUpdate.completed = true;
                taskToUpdate.completedAt = new Date().toISOString();
                // Only flag non-recurring for streak
                // if(!task.recurrenceRule) {
                //     taskJustCompletedNonRecurring = true;
                // }
            } else if (updatedSubtasks.some(sub => !sub.completed) && wasCompleted) {
                 console.log(`Unchecking subtask ${subtaskId} made parent incomplete. Unchecking parent.`); // DEBUG
                 // If unchecking a subtask makes the parent incomplete
                 taskToUpdate.completed = false; // Automatically uncheck parent
                 taskToUpdate.completedAt = null;
            }
          } else {
            console.log(`Toggling parent task ${taskId}. New status: ${newCompletedStatus}`); // DEBUG
            // --- Parent Task Toggle ---
            taskToUpdate.completed = newCompletedStatus;
            taskToUpdate.completedAt = newCompletedStatus ? new Date().toISOString() : null;

            if (newCompletedStatus) { // Just completed the parent task
                // REMOVED Streak logic - handled by useEffect
                // if (!task.recurrenceRule) { 
                //     taskJustCompletedNonRecurring = true;
                // } 
            } else { // Just un-completed the parent task
                // Reset subtasks if unchecking parent
                taskToUpdate.subtasks = task.subtasks.map(sub => ({ ...sub, completed: false }));
            }
          }
          return taskToUpdate; // Return the updated task 
        }
        return task;
      })
    );

    // --- Side Effects ---
    // REMOVED Streak update logic - handled by useEffect
    // if (taskJustCompletedNonRecurring) { ... }
  };

  // Delete main task OR subtask
  const deleteTask = (taskId, subtaskId = null) => {
    console.log(`App: deleteTask called - taskId: ${taskId}, subtaskId: ${subtaskId}`);
    setTasks(prevTasks => {
      if (subtaskId) {
        // Delete subtask
        return prevTasks.map(task =>
          task.id === taskId
            ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== subtaskId) }
            : task
        );
      } else {
        // Delete parent task
        return prevTasks.filter(task => task.id !== taskId);
      }
    });
  };

  // Update main task OR subtask notes/text/dueDate (pass subtaskId if applicable)
  const updateTask = (taskId, updatedDetails, subtaskId = null) => {
    console.log(`App: updateTask called - taskId: ${taskId}, subtaskId: ${subtaskId}, details:`, updatedDetails);
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          if (subtaskId) {
            // Update subtask
            return {
              ...task,
              subtasks: task.subtasks.map(sub =>
                sub.id === subtaskId ? { ...sub, ...updatedDetails } : sub
              )
            };
          } else {
            // Update parent task (excluding subtasks array itself)
            const { subtasks, ...parentUpdates } = updatedDetails;
            return { ...task, ...parentUpdates };
          }
        }
        return task;
      })
    );
  };

  // Add a new subtask
  const addSubtask = (parentId, subtaskText) => {
      if (!subtaskText.trim()) return;
      const newSubtask = {
          id: Date.now(), // Use timestamp for subtask ID as well
          text: subtaskText,
          completed: false,
      };
      setTasks(prevTasks =>
          prevTasks.map(task =>
              task.id === parentId
                  ? { ...task, subtasks: [...task.subtasks, newSubtask] }
                  : task
          )
      );
  };

  // --- Weight Handlers ---
  const addWeightEntry = (entry) => {
    setWeightEntries(prevEntries => [...prevEntries, entry].sort((a, b) => new Date(a.date) - new Date(b.date))); // Keep sorted by date
  };

  const deleteWeightEntry = (entryId) => {
      setWeightEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
  };

  // Clear Task History
  const clearTaskHistory = () => {
    if (window.confirm("Are you sure you want to permanently delete all completed task history? This cannot be undone.")) {
        setTasks(prevTasks => 
            prevTasks.filter(task => 
                !task.completed || // Keep incomplete tasks
                (task.completed && task.recurrenceRule) // Keep recurring tasks even if completed (they reset)
            )
        );
        setShowHistory(false); // Close history modal after clearing
    }
  };

  // Reset Streak
  const resetStreak = () => {
      if (window.confirm("Are you sure you want to reset your current streak?")) {
          setStreakInfo({ count: 0, lastCompletionDate: null });
      }
  };

  // Calculate tasks completed today for the award counter
  const tasksCompletedToday = tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return completedDate.getFullYear() === today.getFullYear() &&
           completedDate.getMonth() === today.getMonth() &&
           completedDate.getDate() === today.getDate();
  }).length;

  return (
    // Transform to a more beautiful design with custom background - Now with dark mode support
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary-200/20 to-primary-300/10 dark:from-primary-900/20 dark:to-primary-800/10 rounded-bl-full z-0 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-amber-200/10 to-amber-100/20 dark:from-amber-900/10 dark:to-amber-800/20 rounded-tr-full z-0 blur-3xl"></div>
      
      {/* Theme Toggle */}
      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl relative z-10">
        <header className="mb-12 text-center relative">
          {/* Decorative element */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-primary-500/30 to-primary-600/20 dark:from-primary-500/20 dark:to-primary-600/10 rounded-full blur-xl z-0"></div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 tracking-tight mb-6 relative z-10 drop-shadow-sm">
            My Dashboard
          </h1>
          
          {/* Enhanced Stats Cards */}
          <div className="flex flex-wrap justify-center items-stretch gap-4 mb-8">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-primary-100 dark:border-primary-900 transition-all hover:shadow-lg group">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg text-2xl">🏆</div>
                <div className="text-left">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Today</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tasksCompletedToday}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">tasks completed</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={resetStreak}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-primary-100 dark:border-primary-900 transition-all hover:shadow-lg cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title="Click to reset streak"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg text-2xl group-hover:animate-pulse">🔥</div>
                <div className="text-left">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Streak</p>
                  <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">{streakInfo.count}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 group-hover:text-orange-400 dark:group-hover:text-orange-300">consecutive days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="px-5 py-2.5 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 font-medium rounded-full shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex mx-auto items-center gap-2 group"
          >
            <svg className="w-5 h-5 text-primary-500 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Task History
          </button>
        </header>

        <main className="space-y-12">
          {/* Enhanced Task Section */}
          <section className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-7 h-7 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tasks
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tasks.filter(t => !t.completed).length} active tasks
              </div>
            </div>
            <TaskInput onAddTask={addTask} />
            <div className="mt-6">
              <TaskList
                tasks={tasks}
                setTasks={setTasks}
                onToggleComplete={toggleComplete}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onAddSubtask={addSubtask}
              />
            </div>
          </section>

          {/* Enhanced Weight Tracker Section */}
          <section className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <WeightTracker
              weightEntries={weightEntries}
              onAddWeight={addWeightEntry}
              onDeleteWeight={deleteWeightEntry}
            />
          </section>
        </main>

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm py-6 border-t border-gray-200 dark:border-gray-700">
          <p>&copy; {new Date().getFullYear()} Your Personal Dashboard. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Built with React, Tailwind CSS, and Framer Motion</p>
        </footer>

        {/* Render History Modal Conditionally */}
        {showHistory && (
          <TaskHistory
            tasks={tasks}
            onClose={() => setShowHistory(false)}
            onClearHistory={clearTaskHistory}
          />
        )}
      </div>
    </div>
  );
}

export default App; 