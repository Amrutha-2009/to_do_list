# 🎓 StudyFlow Pro - Student Assignment & Task Tracker

A modern, responsive, and student-focused to-do website built with clean vanilla HTML5, CSS3, and JavaScript.

---

## 🚀 Key Improvements & Features

### 1. 📅 Due Dates for Tasks & Smart Deadlines
- **Date Picker & Quick Buttons**: Quick selector buttons for **Today**, **Tomorrow**, **+3 Days**, and **+1 Week**, or choose any custom deadline.
- **Smart Due Badges**: Automatically detects and highlights deadlines:
  - 🚨 **Overdue by X days** (pulsing urgent red badge)
  - ⚡ **Due Today** (amber badge)
  - ⏳ **Due Tomorrow** (indigo badge)
  - 📅 **Upcoming Dates** (e.g., Oct 15)
- **Deadline Sorting**: Sort your list by *Due Date (Soonest first)*, *Due Date (Latest first)*, or *Priority*.
- **Quick Filters**: Dedicated tabs to filter tasks that are **Due Today** or **Overdue**.

### 2. 🔍 Real-Time Search Feature
- **Instant Search**: Type to search across task descriptions, subject tags, and priority levels.
- **Keyword Highlighting**: Automatically highlights matching search terms right inside the task description (`<mark>` styling).
- **Keyboard Shortcut**: Press `/` from anywhere on the page to instantly focus the search bar.
- **Search Feedback & Clear**: One-click `✕` clear button and live result count ("Found 3 matching tasks").

### 3. 🌙 Dark Mode Toggle
- **One-Click Switch**: Smoothly toggle between Light Mode and Dark Mode.
- **Persistent Theme**: Your theme preference is remembered in `localStorage` and respects your system default (`prefers-color-scheme`).
- **Tailored Modern Palette**: Features rich obsidian/slate surfaces, glowing accents, and contrast-checked text for late-night study sessions.

### 4. 💾 Local Storage Persistence & Backup
- **Automatic Sync**: Every change (add, toggle, edit, delete, clear) is saved to browser `localStorage` (`studyflow_v2_tasks`) instantly.
- **Data Export & Import**:
  - Export all your semester assignments as a backup JSON file (`.json`).
  - Import previously saved assignments anytime.
  - One-click reset to pre-populated student demo tasks.

### 5. ✨ Better Modern UI & Productivity Features
- **Glassmorphism Design**: Multi-layer elevation, subtle frosted card effects, refined typography (`Plus Jakarta Sans`), and vibrant course badges.
- **Interactive Dashboard Banner**: Live task counters for *Total*, *Pending*, *Due/Overdue*, and *Completed* with an animated progress bar.
- **Inline Task Editing**: Edit task descriptions, course subjects, priority, and deadlines via a modal dialog without having to re-create the task.
- **Toast Notifications**: Clean feedback toasts for adding, completing, editing, or deleting tasks.
- **Celebration Confetti**: Dynamic celebration effect when reaching 100% completion!

---

## 📁 File Structure

```
student-todo-app/
│── index.html    # Upgraded semantic layout, modals, search bar & theme switch
│── style.css     # Glassmorphic UI, dark mode tokens, badges & animations
│── app.js        # Core logic: Due dates, live search, LocalStorage & edit modal
└── README.md     # Documentation and usage guide
```

---

## 🏃 How to Run

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).
2. Or run a local HTTP server:
   ```powershell
   cd C:\Users\Amrut_01sbi0e\.gemini\antigravity\scratch\student-todo-app
   python -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.
