import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  CheckSquare,
  ListTodo,
  X,
  Zap,
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return 'Today';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, completedCount, progress } = useTasks();
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);

  const pendingCount = tasks.length - completedCount;

  function handleAdd() {
    if (!input.trim()) return;
    addTask(input.trim());
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  // Selection handlers
  function toggleSelect(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function handleBulkComplete() {
    selectedIds.forEach(id => {
      const t = tasks.find(item => item.id === id);
      if (t && !t.completed) toggleTask(id);
    });
    setSelectedIds([]);
  }

  function handleBulkDelete() {
    selectedIds.forEach(id => deleteTask(id));
    setSelectedIds([]);
  }

  // Filter tasks
  let displayed = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return true;
    if (filter === 'high') return true;
    return true;
  }).filter(t => !search || t.text?.toLowerCase().includes(search.toLowerCase()));

  // Sort tasks
  displayed = [...displayed].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sort === 'pending_first') return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
    if (sort === 'completed_first') return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
    if (sort === 'alphabetical') return (a.text || '').localeCompare(b.text || '');
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest default
  });

  const pendingTasks = displayed.filter(t => !t.completed);
  const completedTasks = displayed.filter(t => t.completed);

  return (
    <div className="tasks-container">
      {/* ── HERO HEADER ─────────────── */}
      <div className="tasks-hero">
        <div className="tasks-hero-left">
          <h1 className="tasks-hero-title">Tasks</h1>
          <p className="tasks-hero-subtitle">Stay organized. Track priorities. Finish work faster.</p>
        </div>
        <div className="tasks-summary-bar">
          <div className="tasks-summary-chip">
            <span className="tasks-summary-val">{progress}%</span>
            <span className="tasks-summary-lbl">Completed</span>
          </div>
          <div className="tasks-summary-divider" />
          <div className="tasks-summary-chip">
            <span className="tasks-summary-val">{pendingCount}</span>
            <span className="tasks-summary-lbl">Pending</span>
          </div>
        </div>
      </div>

      <div className="tasks-body">
        {/* ── QUICK STATS ─────────────── */}
        <div className="tasks-stats-grid">
          <motion.div
            className="tasks-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            whileHover={{ y: -1 }}
          >
            <div className="tasks-stat-top">
              <div className="tasks-stat-icon-box success">
                <CheckCircle2 size={18} />
              </div>
              <span className="tasks-stat-badge finished">Finished</span>
            </div>
            <div className="tasks-stat-value">{completedCount}</div>
            <div className="tasks-stat-label">Completed Tasks</div>
          </motion.div>

          <motion.div
            className="tasks-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.04 }}
            whileHover={{ y: -1 }}
          >
            <div className="tasks-stat-top">
              <div className="tasks-stat-icon-box pending">
                <Clock size={18} />
              </div>
              <span className="tasks-stat-badge action">Action Required</span>
            </div>
            <div className="tasks-stat-value">{pendingCount}</div>
            <div className="tasks-stat-label">Pending Tasks</div>
          </motion.div>

          <motion.div
            className="tasks-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.08 }}
            whileHover={{ y: -1 }}
          >
            <div className="tasks-stat-top">
              <div className="tasks-stat-icon-box total">
                <Target size={18} />
              </div>
              <span className="tasks-stat-badge tracked">Tracked</span>
            </div>
            <div className="tasks-stat-value">{tasks.length}</div>
            <div className="tasks-stat-label">Total Tasks</div>
          </motion.div>

          <motion.div
            className="tasks-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.12 }}
            whileHover={{ y: -1 }}
          >
            <div className="tasks-stat-top">
              <div className="tasks-stat-icon-box rate">
                <TrendingUp size={18} />
              </div>
              <span className="tasks-stat-badge rate">Overall</span>
            </div>
            <div className="tasks-stat-value">{progress}%</div>
            <div className="tasks-stat-label">Completion Rate</div>
          </motion.div>
        </div>

        {/* ── PROGRESS WIDGET & QUICK ADD ─────────────── */}
        <div className="tasks-grid-two-col">
          {/* Progress Widget */}
          <div className="tasks-card">
            <div className="tasks-card-header">
              <div className="tasks-card-header-left">
                <TrendingUp size={18} className="tasks-header-icon" />
                <h3 className="tasks-card-title">Overall Task Completion</h3>
              </div>
              <span className="tasks-section-tag">{progress}% Done</span>
            </div>

            <div className="tasks-progress-widget">
              <div className="tasks-progress-num-row">
                <span className="tasks-progress-big-num">{progress}%</span>
                <span className="tasks-progress-sub-text">
                  {completedCount} Completed • {pendingCount} Remaining
                </span>
              </div>
              <div className="tasks-progress-track">
                <motion.div
                  className="tasks-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Add Composer */}
          <div className="tasks-card">
            <div className="tasks-card-header">
              <div className="tasks-card-header-left">
                <Plus size={18} className="tasks-header-icon" />
                <h3 className="tasks-card-title">Quick Add Task</h3>
              </div>
              <span className="tasks-section-tag">Composer</span>
            </div>

            <div className="tasks-composer-box">
              <div className="tasks-composer-icon-box">
                <Plus size={16} />
              </div>
              <input
                type="text"
                className="tasks-composer-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done? (Press Enter to add)"
              />
              <motion.button
                type="button"
                className="tasks-composer-btn"
                onClick={handleAdd}
                disabled={!input.trim()}
                whileHover={input.trim() ? { y: -1 } : {}}
                whileTap={input.trim() ? { scale: 0.98 } : {}}
              >
                <span>Add Task</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR & FILTERS ─────────────── */}
        <div className="tasks-toolbar-row">
          {/* Search */}
          <div className="tasks-search-box">
            <Search size={16} className="tasks-search-icon" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />
            {search && (
              <button
                type="button"
                className="tasks-search-clear"
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="tasks-filter-pills">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'today', label: 'Today' },
              { id: 'high', label: 'High Priority' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`tasks-pill ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="tasks-sort-select-wrapper">
            <ArrowUpDown size={14} className="tasks-sort-icon" />
            <select
              className="tasks-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pending_first">Pending First</option>
              <option value="completed_first">Completed First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* ── BULK ACTIONS TOOLBAR ─────────────── */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              className="tasks-bulk-toolbar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <span className="tasks-bulk-count">{selectedIds.length} selected</span>
              <div className="tasks-bulk-actions">
                <button
                  type="button"
                  className="tasks-bulk-btn confirm"
                  onClick={handleBulkComplete}
                >
                  <Check size={14} /> Complete Selected
                </button>
                <button
                  type="button"
                  className="tasks-bulk-btn danger"
                  onClick={handleBulkDelete}
                >
                  <Trash2 size={14} /> Delete Selected
                </button>
                <button
                  type="button"
                  className="tasks-bulk-btn cancel"
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT GRID (LIST & SIDEBAR TIPS) ─────────────── */}
        <div className="tasks-content-grid">
          {/* Task List */}
          <div className="tasks-list-column">
            {displayed.length === 0 ? (
              <div className="tasks-empty-card">
                <div className="tasks-empty-icon-box">
                  <ListTodo size={28} />
                </div>
                <h4 className="tasks-empty-title">
                  {filter === 'completed'
                    ? 'No completed tasks'
                    : search
                    ? 'No matching tasks'
                    : 'No tasks yet'}
                </h4>
                <p className="tasks-empty-subtitle">
                  {filter === 'all' && !search
                    ? 'Add your first task in the composer above to start tracking.'
                    : 'Try adjusting your search query or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="tasks-list">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                  <div className="tasks-group">
                    <div className="tasks-group-header">
                      <span className="tasks-group-title">Pending Action Items</span>
                      <span className="tasks-group-count">{pendingTasks.length}</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {pendingTasks.map(task => (
                        <motion.div
                          key={task.id}
                          className={`task-item-card ${selectedIds.includes(task.id) ? 'selected' : ''}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          layout
                        >
                          <div
                            className="task-custom-checkbox"
                            onClick={() => toggleTask(task.id)}
                            title="Mark as completed"
                          >
                            <Circle size={18} className="checkbox-icon-circle" />
                          </div>

                          <div
                            className="task-item-body"
                            onClick={() => toggleSelect(task.id)}
                          >
                            <div className="task-item-text">{task.text}</div>
                            <div className="task-item-meta">
                              <span className="task-meta-tag date">
                                <Clock size={12} /> {formatDate(task.createdAt)}
                              </span>
                              <span className="task-meta-tag priority">Normal</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="task-item-delete"
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div className="tasks-group completed-group">
                    <div className="tasks-group-header">
                      <span className="tasks-group-title">Completed Tasks</span>
                      <span className="tasks-group-count">{completedTasks.length}</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {completedTasks.map(task => (
                        <motion.div
                          key={task.id}
                          className={`task-item-card completed ${selectedIds.includes(task.id) ? 'selected' : ''}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 0.65, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          layout
                        >
                          <div
                            className="task-custom-checkbox checked"
                            onClick={() => toggleTask(task.id)}
                            title="Mark as pending"
                          >
                            <CheckCircle2 size={18} className="checkbox-icon-checked" />
                          </div>

                          <div
                            className="task-item-body"
                            onClick={() => toggleSelect(task.id)}
                          >
                            <div className="task-item-text done">{task.text}</div>
                            <div className="task-item-meta">
                              <span className="task-meta-tag completed-badge">
                                <Check size={12} /> Completed
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="task-item-delete"
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Productivity Tips Sidebar */}
          <div className="tasks-sidebar-column">
            <div className="tasks-card tips-card">
              <div className="tasks-card-header">
                <div className="tasks-card-header-left">
                  <Sparkles size={18} className="tasks-header-icon" />
                  <h3 className="tasks-card-title">AI Productivity Tips</h3>
                </div>
                <span className="tasks-section-tag">Smart</span>
              </div>

              <div className="tasks-tips-list">
                <div className="tasks-tip-item">
                  <div className="tasks-tip-icon-box">
                    <Zap size={14} />
                  </div>
                  <div className="tasks-tip-content">
                    <span className="tasks-tip-title">Prioritize High Impact Tasks</span>
                    <p className="tasks-tip-desc">Complete urgent action items at the start of your work session to build momentum.</p>
                  </div>
                </div>

                <div className="tasks-tip-item">
                  <div className="tasks-tip-icon-box">
                    <Target size={14} />
                  </div>
                  <div className="tasks-tip-content">
                    <span className="tasks-tip-title">Decompose Complex Work</span>
                    <p className="tasks-tip-desc">Break large projects into 10–15 minute actionable sub-tasks.</p>
                  </div>
                </div>

                <div className="tasks-tip-item">
                  <div className="tasks-tip-icon-box">
                    <CheckSquare size={14} />
                  </div>
                  <div className="tasks-tip-content">
                    <span className="tasks-tip-title">Daily Review Habit</span>
                    <p className="tasks-tip-desc">Clear completed tasks regularly to maintain a clean command workspace.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
