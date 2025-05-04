# Advanced To-Do & Weight Tracker

✨ A feature-rich single-page application combining a sophisticated to-do list with a weight tracking module, built with React and Vite. ✨

This application helps you manage your daily tasks effectively with support for subtasks, recurrence rules, and due dates, while also allowing you to track your weight progress over time with visual charts and statistics.

![Opera Snapshot_2025-05-04_150622_localhost](https://github.com/user-attachments/assets/7f95c00e-9b1f-420c-93f0-b68ab9cd04f0)

** This is one of my first projects and kinda made it to track things important to me how i like it to be tracked. Enjoy!
---

## Features

### ✅ Task Management
*   **Add, Edit, Delete Tasks:** Core CRUD operations for your tasks.
*   **Subtasks:** Break down larger tasks into smaller, manageable steps.
*   **Mark Completion:** Check off tasks and subtasks. Parent tasks automatically complete/uncomplete based on subtask status.
*   **Due Dates:** Assign due dates with visual highlighting for overdue, today, and tomorrow.
*   **Recurring Tasks:** Set tasks to repeat daily, every 2nd day, weekly, monthly, or yearly using `rrule`. Overdue recurring tasks automatically advance to their next due date on app load.
*   **Task Notes:** Add detailed notes to your tasks.
*   **Drag & Drop Reordering:** Easily reorder tasks that don't have a fixed due date.
*   **Task History:** View a log of completed tasks.
*   **Streak Counter:** Tracks your consistency in completing tasks.

### 📊 Weight Tracking
*   **Add & Delete Entries:** Log weight entries with specific dates.
*   **Progress Chart:** Visualize weight trends over time using Chart.js.
*   **Statistics:** View calculated stats like total change, percentage change, weekly average change, min/max weight, and range.
*   **Entry History:** See a list of recent weight entries.

### 🎨 General
*   **Dark/Light Mode Toggle:** Switch between themes for comfortable viewing. Theme preference is saved.
*   **Local Storage Persistence:** All task and weight data is saved in the browser's local storage.
*   **Responsive Design:** Styled with Tailwind CSS for usability across different screen sizes.
*   **Smooth Animations:** Uses Framer Motion for subtle UI animations.

---

## Tech Stack

*   **Frontend:** React (using Vite)
*   **Styling:** Tailwind CSS
*   **Animation:** Framer Motion
*   **Charting:** Chart.js (with `react-chartjs-2`)
*   **Recurrence Logic:** `rrule`
*   **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)
*   **Persistence:** Browser Local Storage

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v16 or later recommended)
*   npm or yarn

You can download Node.js [here](https://nodejs.org/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    # <!-- Add your repository URL here -->
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd <your-project-directory-name>
    # <!-- Use the actual directory name -->
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

---

## Usage

To run the application in development mode:

```bash
npm run dev
# or
# yarn dev
```

This will start the Vite development server. Open your browser and navigate to the local URL provided (usually `http://localhost:5173` or similar).

The application saves data to your browser's local storage, so your tasks and weight entries will persist between sessions on the same browser.

---

## License

Distributed under the MIT License. See `LICENSE` file for more information. (You'll need to add a LICENSE file, MIT is a common choice for open source).

---
