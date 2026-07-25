import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';
import {
  NotebookPen,
  Pin,
  Search,
  Sparkles,
  Folder,
  Clock,
  Calendar,
  Brain,
  Tag,
  FileText,
  FolderInput,
  FolderOutput,
  Plus,
  Trash2,
  Edit3,
  X,
  Layers,
  ArrowUpRight,
  Check,
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return 'Today';
  const d = new Date(iso),
    now = new Date(),
    diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function NotesPage() {
  const { filtered, search, setSearch, addNote, updateNote, deleteNote } = useNotes();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', body: '' });
  const [pinnedIds, setPinnedIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const searchInputRef = useRef(null);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleCreate() {
    if (!newTitle.trim()) return;
    addNote(newTitle.trim(), newBody.trim());
    setNewTitle('');
    setNewBody('');
    setCreating(false);
  }

  function togglePin(id, e) {
    e.stopPropagation();
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function startEdit(n, e) {
    e?.stopPropagation();
    setEditingId(n.id);
    setEditData({ title: n.title, body: n.body });
  }

  function commitEdit() {
    if (!editData.title.trim()) return;
    updateNote(editingId, editData);
    setEditingId(null);
  }

  // Filter notes
  const displayedNotes = filtered.filter(n => {
    if (filter === 'pinned') return pinnedIds.includes(n.id);
    if (filter === 'learning') return true;
    if (filter === 'projects') return true;
    if (filter === 'personal') return true;
    if (filter === 'work') return true;
    return true;
  });

  const pinnedNotes = displayedNotes.filter(n => pinnedIds.includes(n.id));
  const unpinnedNotes = displayedNotes.filter(n => !pinnedIds.includes(n.id));

  const QUICK_ACTIONS = [
    {
      id: 'new',
      icon: Plus,
      title: 'New Note',
      desc: 'Capture a fresh idea or note',
      onClick: () => setCreating(true),
    },
    {
      id: 'summary',
      icon: Sparkles,
      title: 'AI Summary',
      desc: 'Summarize your knowledge base',
      onClick: () => alert('AI Summary: Analyzing your notes...'),
    },
    {
      id: 'search',
      icon: Search,
      title: 'Search Notes',
      desc: 'Quickly find entries',
      onClick: () => searchInputRef.current?.focus(),
    },
    {
      id: 'import',
      icon: FolderInput,
      title: 'Import',
      desc: 'Import markdown & text',
      onClick: () => {},
    },
    {
      id: 'export',
      icon: FolderOutput,
      title: 'Export',
      desc: 'Export knowledge archive',
      onClick: () => {},
    },
  ];

  return (
    <div className="notes-container">
      {/* ── HERO HEADER ─────────────── */}
      <div className="notes-hero">
        <div className="notes-hero-left">
          <h1 className="notes-hero-title">Notes</h1>
          <p className="notes-hero-subtitle">Capture ideas. Build your knowledge. Think faster.</p>
        </div>
        <div className="notes-date-badge">
          <Calendar size={14} />
          <span>{getFormattedDate()}</span>
        </div>
      </div>

      <div className="notes-body">
        {/* ── QUICK STATS CARDS ─────────────── */}
        <div className="notes-stats-grid">
          <motion.div
            className="notes-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            whileHover={{ y: -1 }}
          >
            <div className="notes-stat-top">
              <div className="notes-stat-icon-box">
                <NotebookPen size={18} />
              </div>
              <span className="notes-stat-badge">Knowledge</span>
            </div>
            <div className="notes-stat-value">{filtered.length}</div>
            <div className="notes-stat-label">Total Notes</div>
          </motion.div>

          <motion.div
            className="notes-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.04 }}
            whileHover={{ y: -1 }}
          >
            <div className="notes-stat-top">
              <div className="notes-stat-icon-box pin">
                <Pin size={18} />
              </div>
              <span className="notes-stat-badge pinned">Important</span>
            </div>
            <div className="notes-stat-value">{pinnedIds.length}</div>
            <div className="notes-stat-label">Pinned Notes</div>
          </motion.div>

          <motion.div
            className="notes-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.08 }}
            whileHover={{ y: -1 }}
          >
            <div className="notes-stat-top">
              <div className="notes-stat-icon-box folder">
                <Folder size={18} />
              </div>
              <span className="notes-stat-badge">Organized</span>
            </div>
            <div className="notes-stat-value">4</div>
            <div className="notes-stat-label">Categories</div>
          </motion.div>

          <motion.div
            className="notes-stat-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.12 }}
            whileHover={{ y: -1 }}
          >
            <div className="notes-stat-top">
              <div className="notes-stat-icon-box clock">
                <Clock size={18} />
              </div>
              <span className="notes-stat-badge">Latest</span>
            </div>
            <div className="notes-stat-value">
              {filtered.length > 0 ? 'Today' : '0'}
            </div>
            <div className="notes-stat-label">Recent Activity</div>
          </motion.div>
        </div>

        {/* ── QUICK ACTIONS ─────────────── */}
        <div className="notes-section">
          <div className="notes-section-header">
            <h2 className="notes-section-title">Quick Actions</h2>
            <span className="notes-section-tag">Interactive</span>
          </div>
          <div className="notes-quick-grid">
            {QUICK_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  className="notes-quick-card"
                  onClick={a.onClick}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="notes-quick-header">
                    <div className="notes-quick-icon-box">
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight size={14} className="notes-quick-arrow" />
                  </div>
                  <div className="notes-quick-text">
                    <div className="notes-quick-title">{a.title}</div>
                    <div className="notes-quick-desc">{a.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── NOTE COMPOSER ─────────────── */}
        <AnimatePresence>
          {creating && (
            <motion.div
              className="notes-composer-card"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notes-composer-header">
                <div className="notes-composer-title-left">
                  <NotebookPen size={18} className="notes-header-icon" />
                  <h3 className="notes-composer-heading">New Knowledge Entry</h3>
                </div>
                <button
                  type="button"
                  className="notes-composer-close"
                  onClick={() => setCreating(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="notes-composer-body">
                <input
                  type="text"
                  className="notes-title-input"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Note Title..."
                  autoFocus
                />
                <textarea
                  className="notes-body-input"
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="What would you like to remember? (Supports markdown)"
                  rows={4}
                />
              </div>

              <div className="notes-composer-footer">
                <button
                  type="button"
                  className="notes-btn secondary"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="notes-btn primary"
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                >
                  <Check size={14} /> Save Note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TOOLBAR & SEARCH ─────────────── */}
        <div className="notes-toolbar-row">
          {/* Search bar with Ctrl+K badge */}
          <div className="notes-search-box">
            <Search size={16} className="notes-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search knowledge base..."
            />
            <span className="notes-kbd-hint">Ctrl + K</span>
            {search && (
              <button
                type="button"
                className="notes-search-clear"
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="notes-filter-pills">
            {[
              { id: 'all', label: 'All' },
              { id: 'pinned', label: 'Pinned' },
              { id: 'recent', label: 'Recent' },
              { id: 'learning', label: 'Learning' },
              { id: 'projects', label: 'Projects' },
              { id: 'personal', label: 'Personal' },
              { id: 'work', label: 'Work' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`notes-pill ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT GRID & AI SIDEBAR ─────────────── */}
        <div className="notes-content-grid">
          {/* Notes Grid Column */}
          <div className="notes-grid-column">
            {displayedNotes.length === 0 ? (
              <div className="notes-empty-card">
                <div className="notes-empty-icon-box">
                  <Brain size={32} />
                </div>
                <h4 className="notes-empty-title">No Notes Yet</h4>
                <p className="notes-empty-subtitle">
                  {search
                    ? 'No notes match your search parameters.'
                    : 'Start building your second brain by creating your first entry.'}
                </p>
                <button
                  type="button"
                  className="notes-btn primary"
                  style={{ marginTop: 12 }}
                  onClick={() => setCreating(true)}
                >
                  <Plus size={15} /> Create First Note
                </button>
              </div>
            ) : (
              <div className="notes-sections-wrapper">
                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && (
                  <div className="notes-group">
                    <div className="notes-group-header">
                      <div className="notes-group-title-box">
                        <Pin size={14} className="notes-group-pin-icon" />
                        <span className="notes-group-title">Pinned Knowledge</span>
                      </div>
                      <span className="notes-group-count">{pinnedNotes.length}</span>
                    </div>

                    <div className="notes-cards-grid">
                      {pinnedNotes.map(note => (
                        <NoteCardItem
                          key={note.id}
                          note={note}
                          isPinned={true}
                          onTogglePin={e => togglePin(note.id, e)}
                          editingId={editingId}
                          editData={editData}
                          setEditData={setEditData}
                          startEdit={startEdit}
                          commitEdit={commitEdit}
                          cancelEdit={() => setEditingId(null)}
                          deleteNote={deleteNote}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Notes Section */}
                <div className="notes-group">
                  {pinnedNotes.length > 0 && (
                    <div className="notes-group-header">
                      <span className="notes-group-title">All Entries</span>
                      <span className="notes-group-count">{unpinnedNotes.length}</span>
                    </div>
                  )}

                  <div className="notes-cards-grid">
                    {unpinnedNotes.map(note => (
                      <NoteCardItem
                        key={note.id}
                        note={note}
                        isPinned={false}
                        onTogglePin={e => togglePin(note.id, e)}
                        editingId={editingId}
                        editData={editData}
                        setEditData={setEditData}
                        startEdit={startEdit}
                        commitEdit={commitEdit}
                        cancelEdit={() => setEditingId(null)}
                        deleteNote={deleteNote}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Knowledge Assistant Sidebar */}
          <div className="notes-sidebar-column">
            <div className="notes-card ai-assistant-card">
              <div className="notes-card-header">
                <div className="notes-card-header-left">
                  <Brain size={18} className="notes-header-icon" />
                  <h3 className="notes-card-title">AI Knowledge Assistant</h3>
                </div>
                <span className="notes-section-tag">Smart</span>
              </div>

              <div className="notes-ai-list">
                <button type="button" className="notes-ai-btn">
                  <Sparkles size={14} />
                  <span>Summarize Notes</span>
                </button>
                <button type="button" className="notes-ai-btn">
                  <Layers size={14} />
                  <span>Merge Duplicates</span>
                </button>
                <button type="button" className="notes-ai-btn">
                  <Tag size={14} />
                  <span>Suggest Tags</span>
                </button>
                <button type="button" className="notes-ai-btn">
                  <NotebookPen size={14} />
                  <span>Generate Titles</span>
                </button>
                <button type="button" className="notes-ai-btn">
                  <Search size={14} />
                  <span>Find Related Entries</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteCardItem({
  note,
  isPinned,
  onTogglePin,
  editingId,
  editData,
  setEditData,
  startEdit,
  commitEdit,
  cancelEdit,
  deleteNote,
}) {
  const isEditing = editingId === note.id;

  if (isEditing) {
    return (
      <div className="note-card editing">
        <input
          type="text"
          className="note-edit-title"
          value={editData.title}
          onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
          placeholder="Note title..."
          autoFocus
        />
        <textarea
          className="note-edit-body"
          value={editData.body}
          onChange={e => setEditData(d => ({ ...d, body: e.target.value }))}
          placeholder="Note content..."
          rows={3}
        />
        <div className="note-edit-actions">
          <button type="button" className="notes-btn secondary" onClick={cancelEdit}>
            Cancel
          </button>
          <button type="button" className="notes-btn primary" onClick={commitEdit}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`note-card ${isPinned ? 'pinned' : ''}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      whileHover={{ y: -2 }}
    >
      <div className="note-card-top">
        <div className="note-card-title-text">{note.title}</div>
        <button
          type="button"
          className={`note-pin-btn ${isPinned ? 'active' : ''}`}
          onClick={onTogglePin}
          title={isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin size={14} />
        </button>
      </div>

      {note.body && <div className="note-card-preview">{note.body}</div>}

      <div className="note-card-footer">
        <div className="note-card-tags">
          <span className="note-tag">
            <Tag size={11} /> Knowledge
          </span>
          <span className="note-date">{formatDate(note.updatedAt)}</span>
        </div>
        <div className="note-card-actions">
          <button
            type="button"
            className="note-action-btn"
            onClick={e => startEdit(note, e)}
            title="Edit note"
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            className="note-action-btn danger"
            onClick={() => deleteNote(note.id)}
            title="Delete note"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
