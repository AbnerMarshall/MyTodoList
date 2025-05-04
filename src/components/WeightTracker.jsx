import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for date axis
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Import the date adapter
import { motion, AnimatePresence } from 'framer-motion'; // Import motion

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend
);

function WeightTracker({ weightEntries, onAddWeight, onDeleteWeight }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleThemeChange();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    handleThemeChange(); // Initial check
    return () => observer.disconnect(); // Cleanup
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0 || !date) {
      // Basic validation - add more robust validation as needed
      alert('Please enter a valid weight and date.');
      return;
    }
    // Prevent adding duplicate dates by checking
    if (weightEntries.some(entry => entry.date === date)) {
      alert(`An entry for ${formatDate(date)} already exists. Please delete the old one first if you want to replace it.`);
      return;
    }
    onAddWeight({ date, weight: weightValue, id: Date.now() });
    setWeight(''); // Clear input
    // Keep date as is, or reset to today?
    // setDate(new Date().toISOString().slice(0, 10));
  };

  // Simple date formatter for display
  const formatDate = (dateString, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
    // Check if input is already a Date object or a timestamp number
    if (dateString instanceof Date) {
        return dateString.toLocaleDateString(undefined, options);
    }
    if (typeof dateString === 'number') {
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    // Assume YYYY-MM-DD string input otherwise
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
  };

  // Calculate trends and stats if we have entries
  const calculateStats = () => {
    if (weightEntries.length < 2) return null;
    
    const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    
    const totalChange = lastEntry.weight - firstEntry.weight;
    const percentChange = ((totalChange / firstEntry.weight) * 100).toFixed(1);
    const daysDiff = Math.round((new Date(lastEntry.date) - new Date(firstEntry.date)) / (1000 * 60 * 60 * 24));
    
    // Calculate weekly average change
    const weeklyChange = daysDiff > 0 ? ((totalChange / daysDiff) * 7).toFixed(1) : 0;
    
    // Find min and max
    const minWeight = Math.min(...sortedEntries.map(e => e.weight));
    const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
    
    return {
      totalChange,
      percentChange,
      weeklyChange,
      daysCovered: daysDiff,
      minWeight,
      maxWeight
    };
  };
  
  const stats = calculateStats();

  // Prepare data for the chart
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Linear gradient for chart
  const gradientColors = {
    gain: {
      start: 'rgba(239, 68, 68, 0.7)', // red
      middle: 'rgba(239, 68, 68, 0.2)',
      end: 'rgba(239, 68, 68, 0.05)'
    },
    loss: {
      start: 'rgba(16, 185, 129, 0.7)', // green
      middle: 'rgba(16, 185, 129, 0.2)',
      end: 'rgba(16, 185, 129, 0.05)'
    },
    neutral: {
      start: 'rgba(59, 130, 246, 0.7)', // blue
      middle: 'rgba(59, 130, 246, 0.2)',
      end: 'rgba(59, 130, 246, 0.05)'
    }
  };
  
  // Determine trend color
  const getTrendColor = () => {
    if (!stats) return gradientColors.neutral;
    if (stats.totalChange > 0.5) return gradientColors.gain; // Gained weight
    if (stats.totalChange < -0.5) return gradientColors.loss; // Lost weight
    return gradientColors.neutral; // Maintained weight
  };
  
  const trendColors = getTrendColor();

  const chartData = useMemo(() => ({
    labels: sortedEntries.map(entry => entry.date),
    datasets: [
      {
        label: 'Weight (lbs)',
        data: sortedEntries.map(entry => entry.weight),
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, trendColors.start);
          gradient.addColorStop(0.5, trendColors.middle);
          gradient.addColorStop(1, trendColors.end);
          return gradient;
        },
        borderColor: trendColors.start,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderColor: trendColors.start,
        pointBorderWidth: 2,
      },
    ],
  }), [sortedEntries, trendColors]);

  // Configure chart options using useMemo and isDarkMode
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
             day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date',
          font: { size: 13, weight: 'normal' },
          color: isDarkMode ? '#9CA3AF' : '#6B7280'
        },
        border: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: isDarkMode ? '#6B7280' : '#9CA3AF'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (lbs)',
          font: { size: 13, weight: 'normal' },
          color: isDarkMode ? '#9CA3AF' : '#6B7280'
        },
        beginAtZero: false,
        border: {
          display: false
        },
        grid: {
          color: isDarkMode ? '#374151' : '#F3F4F6'
        },
        ticks: {
          font: { size: 11 },
          color: isDarkMode ? '#9CA3AF' : '#6B7280'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#E5E7EB' : '#111827',
        bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
        borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 8,
        titleFont: { weight: 'bold', size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          title: function(tooltipItems) {
              if (tooltipItems && tooltipItems[0] && tooltipItems[0].parsed) {
                 const timestamp = tooltipItems[0].parsed.x; // Get the timestamp/value from chart.js
                 const date = new Date(timestamp); // Create a Date object from it
                 // Directly format the Date object
                 return date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
              }
              return '';
          },
          label: function(tooltipItem) {
              if (tooltipItem && tooltipItem.parsed) {
                 return ` Weight: ${tooltipItem.parsed.y.toFixed(1)} lbs`;
              }
               return '';
          }
        }
      }
    }
  }), [isDarkMode]);

  const entryVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-7 h-7 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Weight Tracker
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">{weightEntries.length} entries</div>
      </div>

      {/* Input Form - Enhanced Design */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="weightDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date
            </label>
            <input
              type="date"
              id="weightDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="weightInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Weight (lbs)
            </label>
            <input
              type="number"
              id="weightInput"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              required
              className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
            />
          </div>
          <button
            type="submit"
            className="sm:col-start-3 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white rounded-lg hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-all duration-200 font-medium flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Entry
          </button>
        </form>
      </div>

      {/* Stats Cards - New! */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border ${
            stats.totalChange > 0 
              ? 'border-red-100 dark:border-red-900/50' 
              : stats.totalChange < 0 
                ? 'border-green-100 dark:border-green-900/50' 
                : 'border-blue-100 dark:border-blue-900/50'
          }`}>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Change</div>
            <div className={`text-xl font-bold ${
              stats.totalChange > 0 
                ? 'text-red-500 dark:text-red-400' 
                : stats.totalChange < 0 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-blue-500 dark:text-blue-400'
            }`}>
              {stats.totalChange > 0 ? '+' : ''}{stats.totalChange.toFixed(1)} lbs
              <span className="text-sm ml-1 font-normal">({stats.percentChange}%)</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">over {stats.daysCovered} days</div>
          </div>
          
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border ${
            stats.weeklyChange > 0 
              ? 'border-red-100 dark:border-red-900/50' 
              : stats.weeklyChange < 0 
                ? 'border-green-100 dark:border-green-900/50' 
                : 'border-blue-100 dark:border-blue-900/50'
          }`}>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weekly Average</div>
            <div className={`text-xl font-bold ${
              stats.weeklyChange > 0 
                ? 'text-red-500 dark:text-red-400' 
                : stats.weeklyChange < 0 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-blue-500 dark:text-blue-400'
            }`}>
              {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange} lbs/week
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">over {Math.ceil(stats.daysCovered/7)} weeks</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min/Max Weight</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-200">
              {stats.minWeight.toFixed(1)} - {stats.maxWeight.toFixed(1)} <span className="text-xs">lbs</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">range: {(stats.maxWeight - stats.minWeight).toFixed(1)} lbs</div>
          </div>
        </div>
      )}

      {/* Weight History Graph and List */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Progress Chart
        </h3>
        
        {/* Enhanced Chart with shadow and border */}
        {weightEntries && weightEntries.length > 1 ? (
          <div className="mb-8 h-72 md:h-96 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Line options={chartOptions} data={chartData} />
          </div>
        ) : weightEntries.length === 1 ? (
          <div className="mb-8 flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm text-center px-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">Add one more entry to see your progress chart</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Charts require at least two data points</p>
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm text-center px-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">No weight entries yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add your weight using the form above</p>
          </div>
        )}

        {/* Animated List View - Enhanced */}
        {weightEntries && weightEntries.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Entries
            </h4>
             
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                <AnimatePresence initial={false}>
                  {sortedEntries.slice(-15).reverse().map(entry => (
                    <motion.li
                      key={entry.id}
                      layout
                      variants={entryVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-gray-800 dark:text-gray-200 flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-400"></div>
                        <span className="font-medium">{formatDate(entry.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{entry.weight.toFixed(1)} lbs</span>
                        <button
                            onClick={() => onDeleteWeight(entry.id)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            aria-label={`Delete weight entry for ${formatDate(entry.date)}`}
                            title="Delete entry"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeightTracker; 