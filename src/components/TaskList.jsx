import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';

// Utility function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return null;
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  // Adding time zone offset to prevent date shifting issues
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, options);
};

// Helper to get today's date as YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().slice(0, 10);

// Subtask Item Component with animation - Visually enhanced
function SubtaskItem({ subtask, parentTaskId, onToggleComplete, onDeleteTask, onUpdateTask }) {
    console.log('Rendering SubtaskItem:', { subtaskId: subtask.id, parentId: parentTaskId, text: subtask.text, completed: subtask.completed }); // ADDED LOG
    const [isEditingText, setIsEditingText] = useState(false);
    const [editedText, setEditedText] = useState(subtask.text);

    const variants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0, transition: { type: "spring", damping: 20 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };
    
    // Determine background and border based on completion status
    const subtaskBaseClass = "ml-8 pl-4 py-2 border-l-2 flex items-center justify-between gap-2 transition-colors duration-200 relative";
    const completedClass = subtask.completed 
        ? "bg-green-50/60 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600"
        : "border-primary-300 dark:border-primary-700 hover:border-primary-500 dark:hover:border-primary-600";
        
    const handleSubtaskToggle = () => {
        if (isEditingText) return; // Don't toggle if editing
        console.log(`Subtask checkbox clicked: parentId=${parentTaskId}, subtaskId=${subtask.id}`); // DEBUG
        onToggleComplete(parentTaskId, subtask.id);
    };

    // --- Subtask Text Edit Handlers ---
    const handleTextSave = () => {
        if (editedText.trim() === subtask.text) {
            setIsEditingText(false);
            return; // No change
        }
        if (!editedText.trim()) {
            setEditedText(subtask.text); // Revert if empty
            setIsEditingText(false);
            return;
        }
        console.log(`Saving subtask edit: parentId=${parentTaskId}, subtaskId=${subtask.id}, newText=${editedText.trim()}`); // DEBUG
        onUpdateTask(parentTaskId, { text: editedText.trim() }, subtask.id); // Pass subtaskId here
        setIsEditingText(false);
    };

    const handleTextCancel = () => {
        setEditedText(subtask.text);
        setIsEditingText(false);
    };

    const handleTextKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTextSave();
        } else if (e.key === 'Escape') {
            handleTextCancel();
        }
    };
    // --- End Subtask Text Edit Handlers ---

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`${subtaskBaseClass} ${completedClass} group z-20`}
        >
            {/* Make the main div clickable for toggling */}
            <div
                className={`flex items-center gap-3 flex-grow ${!subtask.completed ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={handleSubtaskToggle}
            >
                <input
                    type="checkbox"
                    checked={subtask.completed}
                    readOnly
                    className={`h-4 w-4 border-gray-300 rounded-sm focus:ring-primary-500 flex-shrink-0 ${!subtask.completed ? 'cursor-pointer' : 'cursor-default'} ${subtask.completed ? 'text-green-600 bg-green-500 border-green-400' : 'text-primary-600'}`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleSubtaskToggle}
                 />
                {isEditingText ? (
                    <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onBlur={handleTextSave}
                        onKeyDown={handleTextKeyDown}
                        autoFocus
                        className="flex-grow p-1 border border-primary-300 dark:border-primary-700 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span
                        className={`text-sm flex-grow ${subtask.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} ${!subtask.completed ? 'group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors' : ''}`}
                        onClick={(e) => {
                            if (!subtask.completed) {
                                e.stopPropagation();
                                setIsEditingText(true);
                            }
                        }}
                        title={!subtask.completed ? "Click to edit subtask" : ""}
                    >
                        {subtask.text}
                    </span>
                )}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(parentTaskId, subtask.id);
                }}
                className="p-1.5 rounded-full text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 text-xs opacity-60 hover:opacity-100 transition-all cursor-pointer"
                aria-label={`Delete subtask ${subtask.text}`}
                title="Delete subtask"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </motion.div>
    );
}

// Individual Task Item Component - Modified for Framer Motion Reorder with Drag Handle - Enhanced Design
function TaskItem({ task, onToggleComplete, onDeleteTask, onUpdateTask, onAddSubtask }) {
  const [showNotes, setShowNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notes);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // Update isDarkMode when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Create a MutationObserver to watch for class changes on the HTML element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleThemeChange();
        }
      });
    });

    // Start observing the HTML element for class changes
    observer.observe(document.documentElement, { attributes: true });

    // Initial check
    handleThemeChange();

    // Clean up the observer when component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  const dragControls = useDragControls(); // Create drag controls

  // Determine if task should be draggable (only if no due date)
  const isDraggable = !task.dueDate;

  // --- Enhanced Highlighting Logic --- 
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  
  // Base styles with improved shadows and transitions
  let itemClasses = 'p-5 rounded-xl border transition-all duration-300 flex flex-col bg-white dark:bg-gray-800 relative overflow-hidden'; 
  let dueDateHighlightClass = '';
  let borderClass = ' border-gray-200 dark:border-gray-700'; 
  let accentClass = ''; // For the accent bar
  let gradientOverlay = ''; // For subtle gradient overlay
  
  if (task.completed) {
    itemClasses += ' bg-green-50 dark:bg-green-900/40'; 
    borderClass = ' border-green-200 dark:border-green-800';
    accentClass = 'before:bg-green-400 dark:before:bg-green-600';
    gradientOverlay = 'after:bg-gradient-to-r after:from-green-100/20 after:to-green-50/10 dark:after:from-green-800/20 dark:after:to-green-900/10';
  } else if (task.dueDate) {
    const dueDate = new Date(task.dueDate + 'T00:00:00');
    if (dueDate < today) {
      itemClasses += ' bg-red-50/50 dark:bg-red-900/20'; 
      borderClass = ' border-red-300 dark:border-red-700';
      accentClass = 'before:bg-red-500 dark:before:bg-red-600';
      gradientOverlay = 'after:bg-gradient-to-r after:from-red-100/20 after:to-red-50/10 dark:after:from-red-800/20 dark:after:to-red-900/10';
      dueDateHighlightClass = 'text-red-600 dark:text-red-400 font-semibold';
    } else if (dueDate.getTime() === today.getTime()) {
      itemClasses += ' bg-yellow-50/50 dark:bg-yellow-900/20'; 
      borderClass = ' border-yellow-300 dark:border-yellow-700';
      accentClass = 'before:bg-yellow-400 dark:before:bg-yellow-500';
      gradientOverlay = 'after:bg-gradient-to-r after:from-yellow-100/20 after:to-yellow-50/10 dark:after:from-yellow-800/20 dark:after:to-yellow-900/10';
      dueDateHighlightClass = 'text-yellow-700 dark:text-yellow-500 font-semibold';
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      itemClasses += ' bg-blue-50/50 dark:bg-blue-900/20'; 
      borderClass = ' border-blue-200 dark:border-blue-800';
      accentClass = 'before:bg-blue-400 dark:before:bg-blue-500';
      gradientOverlay = 'after:bg-gradient-to-r after:from-blue-100/20 after:to-blue-50/10 dark:after:from-blue-800/20 dark:after:to-blue-900/10';
      dueDateHighlightClass = 'text-blue-700 dark:text-blue-400';
    } else {
       borderClass = ' border-gray-200 dark:border-gray-700';
       accentClass = 'before:bg-primary-400 dark:before:bg-primary-500';
       gradientOverlay = 'after:bg-gradient-to-r after:from-gray-100/20 after:to-gray-50/10 dark:after:from-gray-800/20 dark:after:to-gray-900/10';
    }
  } else {
    // Default accent for tasks without due date
    accentClass = 'before:bg-primary-400 dark:before:bg-primary-500';
    gradientOverlay = 'after:bg-gradient-to-r after:from-primary-100/10 after:to-primary-50/5 dark:after:from-primary-900/10 dark:after:to-primary-950/5';
  }
  
  // Add pseudo-element styles for accent bar and gradient overlay
  itemClasses += borderClass;
  itemClasses += ' relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 ' + accentClass;
  itemClasses += ' after:absolute after:inset-0 after:content-[""] after:opacity-30 ' + gradientOverlay;
  itemClasses += ' shadow-sm hover:shadow-md relative'; // Better shadows
  
  // --- End Enhanced Highlighting Logic ---

  const handleNotesSave = () => {
    onUpdateTask(task.id, { notes: editedNotes });
    // Keep notes shown after saving
  };

  const handleNotesCancel = () => {
    setEditedNotes(task.notes); // Reset to original notes
    setShowNotes(false); // Hide notes on cancel
  }

  const handleAddSubtask = (e) => {
      e.preventDefault();
      if (!subtaskText.trim()) return;
      onAddSubtask(task.id, subtaskText);
      setSubtaskText('');
      setShowSubtaskInput(false); // Optionally hide after adding
  };

  const handleSubtaskInputChange = (e) => {
      console.log("Subtask input changed:", e.target.value); // DEBUG LOG
      setSubtaskText(e.target.value);
  }

  const handleTextSave = () => {
    if (editedText.trim() === task.text) {
        setIsEditingText(false);
        return; // No change
    }
    if (!editedText.trim()) {
        setEditedText(task.text); // Revert if empty
        setIsEditingText(false);
        return;
    }
    onUpdateTask(task.id, { text: editedText.trim() });
    setIsEditingText(false);
  };

  const handleTextCancel = () => {
    setEditedText(task.text);
    setIsEditingText(false);
  };

  const handleTextKeyDown = (e) => {
      if (e.key === 'Enter') {
          handleTextSave();
      } else if (e.key === 'Escape') {
          handleTextCancel();
      }
  };

  const subtasksComplete = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  // Enhanced task item animation variants
  const taskItemVariants = {
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          type: "spring", 
          stiffness: 320, 
          damping: 25 
        } 
      },
      exit: { 
        opacity: 0, 
        scale: 0.96, 
        y: -10,
        transition: { duration: 0.2 } 
      },
      hover: { 
        scale: 1.02, 
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
        y: -2
      }
  };

  return (
    <Reorder.Item 
      key={task.id}
      value={task}
      dragListener={false}
      dragControls={isDraggable ? dragControls : undefined}
      layout
      variants={taskItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={isDraggable ? "hover" : undefined}
      whileDrag={isDraggable ? {
        scale: 1.05, 
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)", 
        zIndex: 50, 
        cursor: "grabbing",
        opacity: 1, // Set back to 1 for solid appearance
      } : undefined}
      className={itemClasses}
    >
      {/* Drag Handle Button - Conditionally Enabled/Styled */}
       <button 
            onPointerDown={(event) => isDraggable && dragControls.start(event)}
            aria-label={isDraggable ? "Drag task to reorder" : "Task order fixed by due date"}
            title={isDraggable ? "Drag to reorder" : "Task order fixed by due date"}
            disabled={!isDraggable}
            className={`absolute top-1/2 left-[-20px] p-1.5 transform -translate-y-1/2 touch-none text-gray-400 transition-all rounded-full z-10 ${
              isDraggable 
                ? 'cursor-grab hover:text-gray-700 opacity-40 hover:opacity-100 hover:bg-gray-100' 
                : 'cursor-not-allowed opacity-10 text-gray-300'
            }`}
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10h14M5 14h14" />
             </svg>
        </button>

      <div className="relative flex items-start justify-between gap-4 w-full pl-3 z-10">
        <div className="flex items-start gap-3 flex-grow min-w-0">
           <div className="relative mt-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className={`h-5 w-5 rounded-md focus:ring-primary-500 cursor-pointer flex-shrink-0 appearance-none border ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
              />
              {task.completed && (
                <svg className="absolute top-0.5 left-0.5 h-4 w-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
           </div>
           
          <div className="flex-grow mt-0.5">
             {isEditingText ? (
                 <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onBlur={handleTextSave}
                    onKeyDown={handleTextKeyDown}
                    autoFocus
                    className="w-full p-2 border border-primary-300 dark:border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 text-base"
                 />
             ) : (
                 <span
                    className={`block text-gray-800 dark:text-gray-200 break-words cursor-pointer hover:text-primary-700 dark:hover:text-primary-400 transition-colors text-base font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-500 cursor-not-allowed hover:text-gray-500 dark:hover:text-gray-500' : ''}`}
                    onClick={() => !task.completed && setIsEditingText(true)}
                    title={!task.completed ? "Click to edit task text" : ""}
                 >
                    {task.recurrenceRule && (
                      <span className="mr-2 inline-flex items-center text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-md text-xs font-medium" 
                        title={`Repeats ${task.recurrenceRule.split('=')[1]?.toLowerCase() || 'custom'}`}>
                        <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recurring
                      </span>
                    )}
                    {task.text}
                 </span>
             )}
            {task.dueDate && (
              <span className={`text-xs mt-2 inline-flex items-center ${task.completed ? 'text-gray-400 dark:text-gray-500' : (dueDateHighlightClass || 'text-primary-700 dark:text-primary-400')}`}>
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
                { !task.completed && dueDateHighlightClass.includes('red') && 
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">Overdue</span> 
                }
                { !task.completed && dueDateHighlightClass.includes('yellow') && 
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300">Today</span> 
                }
                { !task.completed && dueDateHighlightClass.includes('blue') && 
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">Tomorrow</span> 
                }
              </span>
            )}
            {totalSubtasks > 0 && (
                <span className={`text-xs mt-2 inline-flex items-center ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {subtasksComplete}/{totalSubtasks} subtasks
                    <div className="ml-2 w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${task.completed ? 'bg-green-400' : 'bg-primary-500'}`} 
                        style={{width: `${(subtasksComplete/totalSubtasks) * 100}%`}}
                      ></div>
                    </div>
                </span>
            )}
          </div>
        </div>
         <div className="flex gap-2 flex-shrink-0 items-start">
            <button
              onClick={() => setShowSubtaskInput(!showSubtaskInput)}
              disabled={task.completed}
              className={`p-1.5 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                task.completed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100 focus:ring-primary-400'
              }`}
              title="Add Subtask"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {!task.completed && (<button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-1.5 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-amber-50 text-amber-600 hover:bg-amber-100 focus:ring-amber-400 ${showNotes ? 'ring-2 ring-amber-400' : ''}`}
              title={showNotes ? "Hide Notes" : "Show Notes"}
              aria-expanded={showNotes}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>)}
           <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-all duration-150"
            aria-label={`Delete task ${task.text}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
         </div> 
      </div>

      {showSubtaskInput && !task.completed && (
          <form onSubmit={handleAddSubtask} className="ml-9 mt-3 pl-4 pt-3 border-l-2 border-primary-200 flex gap-2 relative z-20">
              <input
                type="text"
                value={subtaskText}
                onChange={handleSubtaskInputChange}
                placeholder="New subtask..."
                className="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                autoFocus
              />
              <button type="submit" className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 shadow-sm font-medium transition-colors">Add</button>
          </form>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
          <AnimatePresence initial={false}>
                <motion.div layout className="mt-4 w-full space-y-2">
                    {task.subtasks.map(subtask => (
                        <SubtaskItem
                            key={subtask.id}
                            subtask={subtask}
                            parentTaskId={task.id}
                            onToggleComplete={onToggleComplete}
                            onDeleteTask={onDeleteTask}
                            onUpdateTask={onUpdateTask}
                        />
                    ))}
                 </motion.div>
           </AnimatePresence>
      )}

      {showNotes && !task.completed && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-gray-200 w-full overflow-hidden z-10"
        >
           <label htmlFor={`notes-${task.id}`} className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
           <textarea
             id={`notes-${task.id}`}
             value={editedNotes}
             onChange={(e) => setEditedNotes(e.target.value)}
             rows="3"
             className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2 bg-white shadow-sm"
             placeholder={task.notes ? "" : "Add notes here..."}
           />
           <div className="flex gap-2 justify-end">
              <button onClick={handleNotesCancel} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleNotesSave} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 shadow-sm transition-colors">Save Notes</button>
           </div>
        </motion.div>
      )}
    </Reorder.Item>
  );
}

// Main TaskList Component - Enhanced
function TaskList({ tasks, setTasks, onToggleComplete, onDeleteTask, onUpdateTask, onAddSubtask }) {

  // Filter tasks: Show incomplete tasks OR tasks completed today
  const todayStr = getTodayDateString();
  const visibleTasksSource = tasks.filter(task => {
      if (!task.completed) {
          return true; // Always show incomplete tasks
      }
      // Show completed tasks if completed *today* 
      // AND either they are non-recurring OR they are recurring (so they stay visible until reset)
      const completedToday = task.completedAt && task.completedAt.startsWith(todayStr);
      return completedToday;
  });

  // --- New Sorting Logic ---
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const getTaskPriority = (task) => {
    if (!task.dueDate) return 5; // No Due Date
    const dueDate = new Date(task.dueDate + 'T00:00:00');
    if (dueDate < today) return 1; // Overdue
    if (dueDate.getTime() === today.getTime()) return 2; // Today
    if (dueDate.getTime() === tomorrow.getTime()) return 3; // Tomorrow
    return 4; // Future
  };

  const sortedVisibleTasks = visibleTasksSource.sort((a, b) => {
    const priorityA = getTaskPriority(a);
    const priorityB = getTaskPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Sort by priority groups first
    }

    // Secondary sorting within groups
    if (priorityA === 1) { // Overdue
      return new Date(a.dueDate) - new Date(b.dueDate); // Most overdue first (ascending date)
    }
    if (priorityA === 4) { // Future
      return new Date(b.dueDate) - new Date(a.dueDate); // Least urgent first (descending date)
    }

    // No specific secondary sort needed for Today, Tomorrow, or No Date groups
    return 0; 
  });
  // --- End New Sorting Logic ---

  // Use the sorted list for rendering
  const visibleTasks = sortedVisibleTasks;

  if (visibleTasks.length === 0) {
    // Enhanced empty state
    if (tasks.length > 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-green-50/40 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <div className="bg-green-100 dark:bg-green-800 p-4 rounded-full mb-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center text-green-700 dark:text-green-400 font-medium">All tasks done for today! 🎉</p>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">Check the history to see previous tasks.</p>
          </div>
        );
    } else {
        return (
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-50/40 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-full mb-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-center text-blue-700 dark:text-blue-400 font-medium">No tasks yet</p>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">Add your first task using the form above.</p>
          </div>
        );
    }
  }

  return (
    <Reorder.Group 
      axis="y" 
      values={tasks}
      onReorder={setTasks}
      className="space-y-4 py-2 px-1" // Added padding for better visual spacing
    >
      <AnimatePresence initial={false}>
        {visibleTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
            onAddSubtask={onAddSubtask}
          />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}

export default TaskList; 