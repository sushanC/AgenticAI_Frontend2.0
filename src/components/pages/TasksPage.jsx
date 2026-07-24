import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';

function formatDate(iso) { if (!iso) return ''; return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); }

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, completedCount, progress } = useTasks();
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  function handleAdd() { if (!input.trim()) return; addTask(input.trim()); setInput(''); }

  const displayed = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  }).filter(t => !search || t.text?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Tasks</div>
        <div className="page-subtitle">{completedCount} of {tasks.length} completed</div>
      </div>
      <div className="page-body">
        {tasks.length > 0 && (
          <div className="progress-container">
            <div className="progress-label"><span>Progress</span><span>{progress}%</span></div>
            <div className="progress-track">
              <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${progress}%`}} transition={{duration:0.5,ease:[0.16,1,0.3,1]}} />
            </div>
          </div>
        )}

        <div className="add-bar">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Add a new task..." />
          <button className="add-btn" onClick={handleAdd} disabled={!input.trim()}>Add</button>
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
          {search && <button onClick={() => setSearch('')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}>✕</button>}
        </div>

        <div className="filter-pills">
          {['all','active','done'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">{filter === 'done' ? 'No completed tasks' : search ? 'No matching tasks' : 'No tasks yet'}</div>
            <div className="empty-desc">{filter === 'all' && !search ? 'Add your first task above' : 'Try a different filter or search'}</div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayed.map(task => (
              <motion.div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
                initial={{opacity:0}} animate={{opacity:task.completed?0.5:1}}
                exit={{opacity:0,height:0}} transition={{duration:0.2}} layout
              >
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={() => toggleTask(task.id)}>
                  {task.completed && '✓'}
                </div>
                <div className="task-content">
                  <div className={`task-title ${task.completed ? 'done' : ''}`}>{task.text}</div>
                  <div className="task-meta">{formatDate(task.createdAt)}</div>
                </div>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>Delete</button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
