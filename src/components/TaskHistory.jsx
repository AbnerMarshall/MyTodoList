import React from 'react';
import { motion } from 'framer-motion';

// Utility function to format dates nicely
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return new Date(isoString).toLocaleDateString(undefined, options);
};

// Utility function to calculate duration
const calculateDuration = (startISO, endISO) => {
    if (!startISO || !endISO) return 'N/A';
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffMs = end - start;

    if (diffMs < 0) return 'Invalid dates';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let durationStr = '';
    if (diffDays > 0) durationStr += `${diffDays}d `;
    if (diffHrs > 0) durationStr += `${diffHrs}h `;
    if (diffMins > 0 || durationStr === '') durationStr += `${diffMins}m`; // Show minutes if duration < 1h or exact hours

    return durationStr.trim() || '< 1m'; // Handle very short durations
};

function TaskHistory({ tasks, onClose, onClearHistory }) {
    const completedTasks = tasks
        .filter(task => task.completed && task.completedAt && !task.recurrenceRule) // Only show non-recurring completed tasks
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)); // Sort by most recently completed

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            {/* Backdrop with more elegant animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal with enhanced animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3 
                }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden relative z-10"
            >
                <header className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Task History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                        aria-label="Close history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <div className="p-6 overflow-y-auto flex-grow bg-gray-50/50">
                    {completedTasks.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-medium text-lg">No completed tasks yet</p>
                            <p className="text-gray-500 text-sm mt-1">Your completed tasks will appear here</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {completedTasks.map(task => (
                                <motion.li 
                                    key={task.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-400 before:rounded-l-xl relative overflow-hidden"
                                >
                                    {/* Success icon */}
                                    <div className="flex justify-between mb-3">
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Completed</span>
                                        </div>
                                        <span className="text-xs text-gray-500 italic">
                                            {calculateDuration(task.createdAt, task.completedAt)} to complete
                                        </span>
                                    </div>
                                    
                                    <p className="font-medium text-gray-800 mb-3 text-base pl-1">{task.text}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <span className="block">Created</span>
                                                <span className="block font-medium text-gray-700">{formatDateTime(task.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <div>
                                                <span className="block">Completed</span>
                                                <span className="block font-medium text-gray-700">{formatDateTime(task.completedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {task.subtasks && task.subtasks.filter(st => st.completed).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Completed Subtasks:
                                            </span>
                                            <ul className="mt-2 space-y-1">
                                                {task.subtasks.filter(st => st.completed).map(st => (
                                                    <li key={st.id} className="flex items-center gap-2 text-xs text-gray-600 pl-5">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        {st.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>
                 
                <footer className="p-5 border-t border-gray-100 sticky bottom-0 bg-white z-10 flex justify-between items-center">
                    <span className="text-sm text-gray-500 italic">
                        {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                    {completedTasks.length > 0 && (
                        <button
                            onClick={onClearHistory}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear History
                        </button>
                    )}
                </footer>
            </motion.div>
        </div>
    );
}

export default TaskHistory; 