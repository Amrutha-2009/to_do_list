/**
 * StudyFlow Pro - Student Assignment & Task Tracker
 * Full-featured Vanilla JavaScript with LocalStorage persistence,
 * search highlighting, dynamic due dates, dark mode, and modern UI.
 */

// Sample starter data for students
const INITIAL_DEMO_TASKS = [
  {
    id: 'demo-1',
    text: 'Submit Calculus Homework #4 (Derivatives & Integrals)',
    subject: 'Mathematics',
    priority: 'high',
    dueDate: getRelativeDate(0), // Today
    completed: false,
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-2',
    text: 'Read Chapter 5 of Biology (Cellular Respiration & Photosynthesis)',
    subject: 'Biology',
    priority: 'high',
    dueDate: getRelativeDate(-1), // Overdue by 1 day
    completed: false,
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'demo-3',
    text: 'Implement Binary Search Tree & Graph Traversal in Java',
    subject: 'Computer Science',
    priority: 'medium',
    dueDate: getRelativeDate(1), // Tomorrow
    completed: false,
    createdAt: Date.now() - 3600000 * 4
  },
  {
    id: 'demo-4',
    text: 'Physics Lab: Measure gravity constant with pendulum',
    subject: 'Physics',
    priority: 'medium',
    dueDate: getRelativeDate(3),
    completed: false,
    createdAt: Date.now() - 3600000 * 6
  },
  {
    id: 'demo-5',
    text: 'Essay outline for World History: The Industrial Revolution',
    subject: 'History',
    priority: 'low',
    dueDate: getRelativeDate(5),
    completed: true,
    createdAt: Date.now() - 3600000 * 48
  }
];

// Helper: Calculate date string (YYYY-MM-DD) based on offset
function getRelativeDate(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class StudyFlowApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.currentSubject = 'all';
    this.searchQuery = '';
    this.currentSort = 'dueDateAsc';
    this.theme = 'light';

    this.cacheDOMElements();
    this.init();
  }

  cacheDOMElements() {
    // Header & Theme
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.themeStatusText = document.getElementById('themeStatusText');
    this.backupModalBtn = document.getElementById('backupModalBtn');

    // Stats Banner
    this.totalTasksCount = document.getElementById('totalTasksCount');
    this.pendingTasksCount = document.getElementById('pendingTasksCount');
    this.urgentTasksCount = document.getElementById('urgentTasksCount');
    this.completedTasksCount = document.getElementById('completedTasksCount');
    this.progressPercentage = document.getElementById('progressPercentage');
    this.progressBarFill = document.getElementById('progressBarFill');

    // Form Elements
    this.taskForm = document.getElementById('taskForm');
    this.taskInput = document.getElementById('taskInput');
    this.clearTaskInputBtn = document.getElementById('clearTaskInputBtn');
    this.subjectSelect = document.getElementById('subjectSelect');
    this.prioritySelect = document.getElementById('prioritySelect');
    this.dueDateInput = document.getElementById('dueDateInput');
    this.dateQuickLabel = document.getElementById('dateQuickLabel');
    this.dateChipsContainer = document.querySelector('.quick-date-chips');

    // Toolbar Controls
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.sortSelect = document.getElementById('sortSelect');
    this.statusFilterGroup = document.getElementById('statusFilterGroup');
    this.subjectFilter = document.getElementById('subjectFilter');
    this.searchFeedback = document.getElementById('searchFeedback');
    this.searchResultText = document.getElementById('searchResultText');
    this.resetSearchFilterBtn = document.getElementById('resetSearchFilterBtn');

    // Task List & Viewport
    this.taskList = document.getElementById('taskList');
    this.emptyState = document.getElementById('emptyState');
    this.emptyTitle = document.getElementById('emptyTitle');
    this.emptySubtitle = document.getElementById('emptySubtitle');
    this.emptyResetBtn = document.getElementById('emptyResetBtn');

    // Footer
    this.storageStatusText = document.getElementById('storageStatusText');
    this.tasksRemainingCount = document.getElementById('tasksRemainingCount');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Modals
    this.editModal = document.getElementById('editModal');
    this.editTaskForm = document.getElementById('editTaskForm');
    this.editTaskId = document.getElementById('editTaskId');
    this.editTaskInput = document.getElementById('editTaskInput');
    this.editSubjectSelect = document.getElementById('editSubjectSelect');
    this.editPrioritySelect = document.getElementById('editPrioritySelect');
    this.editDueDateInput = document.getElementById('editDueDateInput');
    this.closeEditModalBtn = document.getElementById('closeEditModalBtn');
    this.cancelEditBtn = document.getElementById('cancelEditBtn');

    this.backupModal = document.getElementById('backupModal');
    this.closeBackupModalBtn = document.getElementById('closeBackupModalBtn');
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.importFileInput = document.getElementById('importFileInput');
    this.resetSampleDataBtn = document.getElementById('resetSampleDataBtn');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  init() {
    this.initTheme();
    this.loadTasks();

    // Default due date to Tomorrow
    this.setFormDueDateOffset(1);

    this.bindEvents();
    this.render();
  }

  /* ==========================================================================
     Theme Management
     ========================================================================== */

  initTheme() {
    const savedTheme = localStorage.getItem('studyflow_theme');
    if (savedTheme) {
      this.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark';
    } else {
      this.theme = 'light';
    }
    this.applyTheme(false);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(true);
    this.showToast(`Switched to ${this.theme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  }

  applyTheme(animate = true) {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('studyflow_theme', this.theme);
    this.themeStatusText.textContent = this.theme === 'dark' ? 'Dark' : 'Light';
  }

  /* ==========================================================================
     Storage & Data Management
     ========================================================================== */

  loadTasks() {
    const saved = localStorage.getItem('studyflow_v2_tasks');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved tasks:', err);
        this.tasks = [...INITIAL_DEMO_TASKS];
      }
    } else {
      // First time launch
      this.tasks = [...INITIAL_DEMO_TASKS];
      this.saveTasks(false);
    }
  }

  saveTasks(notify = true) {
    localStorage.setItem('studyflow_v2_tasks', JSON.stringify(this.tasks));
    this.updateStorageIndicator();
  }

  updateStorageIndicator() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.storageStatusText.textContent = `Auto-saved locally (${timeStr})`;
  }

  exportData() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow_backup_${getRelativeDate(0)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast('Tasks backup downloaded!', 'success');
    this.closeBackupModal();
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          this.tasks = importedTasks;
          this.saveTasks();
          this.render();
          this.showToast(`Imported ${this.tasks.length} tasks successfully!`, 'success');
          this.closeBackupModal();
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (err) {
        this.showToast('Failed to import file. Invalid format.', 'danger');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  resetToSampleData() {
    if (confirm('Reset your tasks to default sample assignment data? This will overwrite existing tasks.')) {
      this.tasks = [...INITIAL_DEMO_TASKS];
      this.saveTasks();
      this.render();
      this.showToast('Reset to demo assignments!', 'info');
      this.closeBackupModal();
    }
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  bindEvents() {
    // Theme toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Task Form Add
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Task input clear button & typing
    this.taskInput.addEventListener('input', () => {
      if (this.taskInput.value.length > 0) {
        this.clearTaskInputBtn.classList.remove('hidden');
      } else {
        this.clearTaskInputBtn.classList.add('hidden');
      }
    });

    this.clearTaskInputBtn.addEventListener('click', () => {
      this.taskInput.value = '';
      this.clearTaskInputBtn.classList.add('hidden');
      this.taskInput.focus();
    });

    // Quick Date Chips
    if (this.dateChipsContainer) {
      this.dateChipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.date-chip');
        if (!chip) return;

        this.dateChipsContainer.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const offset = chip.getAttribute('data-offset');
        if (offset === 'none') {
          this.dueDateInput.value = '';
          this.dateQuickLabel.textContent = '';
        } else {
          this.setFormDueDateOffset(parseInt(offset, 10));
        }
      });
    }

    // Due date input change
    this.dueDateInput.addEventListener('change', () => {
      // Clear chip active states if custom date picked
      this.dateChipsContainer.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
      this.updateDateQuickLabel(this.dueDateInput.value);
    });

    // Live Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      if (this.searchQuery.length > 0) {
        this.clearSearchBtn.classList.remove('hidden');
      } else {
        this.clearSearchBtn.classList.add('hidden');
      }
      this.render();
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.classList.add('hidden');
      this.searchInput.focus();
      this.render();
    });

    this.resetSearchFilterBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.classList.add('hidden');
      this.render();
    });

    // Global keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.searchInput.focus();
      }
      if (e.key === 'Escape') {
        if (!this.editModal.classList.contains('hidden')) {
          this.closeEditModal();
        }
        if (!this.backupModal.classList.contains('hidden')) {
          this.closeBackupModal();
        }
      }
    });

    // Sorting
    this.sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.render();
    });

    // Status Filter Tabs
    this.statusFilterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      this.statusFilterGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentFilter = btn.getAttribute('data-filter');
      this.render();
    });

    // Subject Filter
    this.subjectFilter.addEventListener('change', (e) => {
      this.currentSubject = e.target.value;
      this.render();
    });

    // Clear completed button
    this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());

    // Reset filters button in empty state
    this.emptyResetBtn.addEventListener('click', () => {
      this.resetAllFilters();
    });

    // Modal Events: Edit Task
    this.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
    this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) this.closeEditModal();
    });
    this.editTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveEditedTask();
    });

    // Modal Events: Backup & Restore
    this.backupModalBtn.addEventListener('click', () => this.openBackupModal());
    this.closeBackupModalBtn.addEventListener('click', () => this.closeBackupModal());
    this.backupModal.addEventListener('click', (e) => {
      if (e.target === this.backupModal) this.closeBackupModal();
    });
    this.exportDataBtn.addEventListener('click', () => this.exportData());
    this.importFileInput.addEventListener('change', (e) => this.importData(e));
    this.resetSampleDataBtn.addEventListener('click', () => this.resetToSampleData());
  }

  setFormDueDateOffset(days) {
    const dateStr = getRelativeDate(days);
    this.dueDateInput.value = dateStr;
    this.updateDateQuickLabel(dateStr);
  }

  updateDateQuickLabel(dateStr) {
    if (!dateStr) {
      this.dateQuickLabel.textContent = '';
      return;
    }
    const today = getRelativeDate(0);
    const tomorrow = getRelativeDate(1);
    if (dateStr === today) {
      this.dateQuickLabel.textContent = '(Due Today)';
    } else if (dateStr === tomorrow) {
      this.dateQuickLabel.textContent = '(Due Tomorrow)';
    } else if (dateStr < today) {
      this.dateQuickLabel.textContent = '(Past Due)';
    } else {
      this.dateQuickLabel.textContent = '';
    }
  }

  /* ==========================================================================
     Task Actions
     ========================================================================== */

  handleAddTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      text,
      subject: this.subjectSelect.value,
      priority: this.prioritySelect.value,
      dueDate: this.dueDateInput.value || null,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    this.saveTasks();

    // Reset input
    this.taskInput.value = '';
    this.clearTaskInputBtn.classList.add('hidden');
    this.taskInput.focus();

    this.render();
    this.showToast('Assignment added successfully!', 'success');
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();

      if (task.completed) {
        this.showToast('Completed assignment! 🎉', 'success');
        this.checkAllCompletedCelebration();
      }
    }
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = this.tasks.splice(index, 1)[0];
      this.saveTasks();
      this.render();
      this.showToast(`Deleted "${deleted.text.substring(0, 25)}..."`, 'danger');
    }
  }

  openEditModal(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    this.editTaskId.value = task.id;
    this.editTaskInput.value = task.text;
    this.editSubjectSelect.value = task.subject;
    this.editPrioritySelect.value = task.priority;
    this.editDueDateInput.value = task.dueDate || '';

    this.editModal.classList.remove('hidden');
    this.editTaskInput.focus();
  }

  closeEditModal() {
    this.editModal.classList.add('hidden');
  }

  handleSaveEditedTask() {
    const id = this.editTaskId.value;
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    task.text = this.editTaskInput.value.trim();
    task.subject = this.editSubjectSelect.value;
    task.priority = this.editPrioritySelect.value;
    task.dueDate = this.editDueDateInput.value || null;

    this.saveTasks();
    this.closeEditModal();
    this.render();
    this.showToast('Assignment updated!', 'info');
  }

  openBackupModal() {
    this.backupModal.classList.remove('hidden');
  }

  closeBackupModal() {
    this.backupModal.classList.add('hidden');
  }

  handleClearCompleted() {
    const completedList = this.tasks.filter(t => t.completed);
    if (completedList.length === 0) {
      this.showToast('No completed tasks to clear.', 'info');
      return;
    }

    if (confirm(`Remove ${completedList.length} completed task(s)?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.render();
      this.showToast(`Cleared ${completedList.length} completed tasks!`, 'info');
    }
  }

  resetAllFilters() {
    this.currentFilter = 'all';
    this.currentSubject = 'all';
    this.searchQuery = '';
    this.searchInput.value = '';
    this.clearSearchBtn.classList.add('hidden');
    this.subjectFilter.value = 'all';

    this.statusFilterGroup.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
    });

    this.render();
  }

  checkAllCompletedCelebration() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    if (total > 0 && completed === total) {
      this.triggerConfetti();
    }
  }

  /* ==========================================================================
     Filtering & Sorting Logic
     ========================================================================== */

  getFilteredAndSortedTasks() {
    const todayStr = getRelativeDate(0);

    // 1. Filter
    let filtered = this.tasks.filter(task => {
      // Status Filter
      if (this.currentFilter === 'pending' && task.completed) return false;
      if (this.currentFilter === 'completed' && !task.completed) return false;
      if (this.currentFilter === 'dueToday') {
        if (task.completed || task.dueDate !== todayStr) return false;
      }
      if (this.currentFilter === 'overdue') {
        if (task.completed || !task.dueDate || task.dueDate >= todayStr) return false;
      }

      // Subject Filter
      if (this.currentSubject !== 'all' && task.subject !== this.currentSubject) return false;

      // Search Query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const inText = task.text.toLowerCase().includes(query);
        const inSubject = task.subject.toLowerCase().includes(query);
        const inPriority = task.priority.toLowerCase().includes(query);
        if (!inText && !inSubject && !inPriority) return false;
      }

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      // Incomplete tasks generally take precedence, but user sort rules apply
      switch (this.currentSort) {
        case 'dueDateAsc': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'dueDateDesc': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority': {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        case 'alpha': {
          return a.text.localeCompare(b.text);
        }
        case 'newest':
        default: {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
      }
    });

    return filtered;
  }

  /* ==========================================================================
     Due Date Calculation & Badges
     ========================================================================== */

  calculateDueStatus(dueDateStr) {
    if (!dueDateStr) return null;

    const todayStr = getRelativeDate(0);
    const tomorrowStr = getRelativeDate(1);

    if (dueDateStr === todayStr) {
      return {
        label: '⚡ Due Today',
        cssClass: 'due-today',
        isUrgent: true
      };
    }

    if (dueDateStr === tomorrowStr) {
      return {
        label: '⏳ Due Tomorrow',
        cssClass: 'due-tomorrow',
        isUrgent: false
      };
    }

    if (dueDateStr < todayStr) {
      // Calculate how many days overdue
      const todayDate = new Date(todayStr);
      const dueDate = new Date(dueDateStr);
      const diffDays = Math.round((todayDate - dueDate) / (1000 * 60 * 60 * 24));
      return {
        label: `🚨 Overdue by ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        cssClass: 'overdue',
        isUrgent: true
      };
    }

    // Future date: format as 'Due: Oct 12'
    const parts = dueDateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const formatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        label: `📅 ${formatted}`,
        cssClass: '',
        isUrgent: false
      };
    }

    return {
      label: `📅 ${dueDateStr}`,
      cssClass: '',
      isUrgent: false
    };
  }

  /* ==========================================================================
     Rendering & UI Updates
     ========================================================================== */

  render() {
    this.renderStats();
    this.renderList();
  }

  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const todayStr = getRelativeDate(0);

    // Urgent: either due today or overdue
    const urgentCount = this.tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= todayStr).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.totalTasksCount.textContent = total;
    this.pendingTasksCount.textContent = pending;
    this.urgentTasksCount.textContent = urgentCount;
    this.completedTasksCount.textContent = completed;

    this.progressPercentage.textContent = `${percentage}%`;
    this.progressBarFill.style.width = `${percentage}%`;

    this.tasksRemainingCount.textContent = `${pending} pending task${pending === 1 ? '' : 's'}`;
  }

  renderList() {
    const tasks = this.getFilteredAndSortedTasks();

    // Search feedback banner
    if (this.searchQuery) {
      this.searchFeedback.classList.remove('hidden');
      this.searchResultText.textContent = `Found ${tasks.length} matching task${tasks.length === 1 ? '' : 's'} for "${this.searchQuery}"`;
    } else {
      this.searchFeedback.classList.add('hidden');
    }

    if (tasks.length === 0) {
      this.taskList.innerHTML = '';
      this.emptyState.classList.remove('hidden');

      if (this.searchQuery) {
        this.emptyTitle.textContent = 'No matching assignments found';
        this.emptySubtitle.textContent = `No tasks match your search for "${this.searchQuery}".`;
        this.emptyResetBtn.classList.remove('hidden');
      } else if (this.currentFilter !== 'all' || this.currentSubject !== 'all') {
        this.emptyTitle.textContent = 'No tasks in this category';
        this.emptySubtitle.textContent = 'Try switching your filter tabs or subject dropdown.';
        this.emptyResetBtn.classList.remove('hidden');
      } else {
        this.emptyTitle.textContent = 'All caught up!';
        this.emptySubtitle.textContent = 'You have zero pending tasks. Add a new assignment above to get started!';
        this.emptyResetBtn.classList.add('hidden');
      }
      return;
    }

    this.emptyState.classList.add('hidden');

    this.taskList.innerHTML = tasks.map(task => {
      const subjectClass = `badge-subject-${task.subject.replace(/\s+/g, '-')}`;
      const priorityClass = `badge-priority-${task.priority}`;
      const dueInfo = this.calculateDueStatus(task.dueDate);

      // Due date markup
      const dueBadgeMarkup = dueInfo 
        ? `<span class="due-badge ${dueInfo.cssClass}">${dueInfo.label}</span>`
        : '';

      // Highlight text matches if query exists
      const highlightedText = this.highlightQuery(this.escapeHTML(task.text), this.searchQuery);

      return `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-left">
            <label class="checkbox-wrap" title="${task.completed ? 'Mark pending' : 'Mark completed'}">
              <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" data-id="${task.id}" />
              <span class="custom-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </label>

            <div class="task-content">
              <span class="task-text">${highlightedText}</span>
              <div class="task-meta-row">
                <span class="badge ${subjectClass}">${task.subject}</span>
                <span class="badge ${priorityClass}">${task.priority.toUpperCase()}</span>
                ${dueBadgeMarkup}
              </div>
            </div>
          </div>

          <div class="task-actions">
            <button class="action-btn edit-btn" data-action="edit" data-id="${task.id}" title="Edit task" aria-label="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete task" aria-label="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </li>
      `;
    }).join('');

    // Attach event delegation
    this.taskList.querySelectorAll('[data-action="toggle"]').forEach(el => {
      el.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        this.toggleTask(id);
      });
    });

    this.taskList.querySelectorAll('[data-action="edit"]').forEach(el => {
      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="edit"]');
        const id = btn.getAttribute('data-id');
        this.openEditModal(id);
      });
    });

    this.taskList.querySelectorAll('[data-action="delete"]').forEach(el => {
      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        const id = btn.getAttribute('data-id');
        this.deleteTask(id);
      });
    });
  }

  highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ==========================================================================
     Toasts & Visual Feedback
     ========================================================================== */

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${this.escapeHTML(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  triggerConfetti() {
    // Lightweight canvas confetti explosion
    const count = 40;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      el.style.width = `${Math.random() * 8 + 6}px`;
      el.style.height = `${Math.random() * 8 + 6}px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = '-10px';
      el.style.transition = `transform ${Math.random() * 2 + 1.5}s cubic-bezier(0.25, 1, 0.5, 1), opacity 2s ease`;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(${Math.random() * 200 - 100}px, ${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 2500);
    }
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.studyFlowApp = new StudyFlowApp();
});
