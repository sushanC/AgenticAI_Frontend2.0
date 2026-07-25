import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemory } from '../../hooks/useMemory';
import {
  Brain,
  Database,
  Layers,
  Pin,
  Activity,
  Sparkles,
  Search,
  X,
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  Clock,
  UserCheck,
  Sliders,
  Target,
  Wrench,
  BookOpen,
  Tag,
} from 'lucide-react';

const CATEGORIES = ['All', 'Identity', 'Preferences', 'Goals', 'Skills', 'Context'];

export default function MemoryPage() {
  const { facts, filtered, loading, search, setSearch, deleteFact, editFact } = useMemory();
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [pinnedIds, setPinnedIds] = useState(new Set([3])); // Mock default pinned identity fact
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter normalize category name (Preference -> Preferences, Skill -> Skills, Goal -> Goals)
  const normalizeCat = cat => {
    if (!cat) return 'Context';
    const c = cat.trim();
    if (c.toLowerCase() === 'preference') return 'Preferences';
    if (c.toLowerCase() === 'skill') return 'Skills';
    if (c.toLowerCase() === 'goal') return 'Goals';
    return c;
  };

  const displayedFacts = (activeCategory === 'All'
    ? filtered
    : filtered.filter(f => normalizeCat(f.category) === activeCategory)
  ).sort((a, b) => {
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const togglePin = (id, e) => {
    e?.stopPropagation();
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveMenuId(null);
  };

  const startEdit = (fact, e) => {
    e?.stopPropagation();
    setEditingId(fact.id);
    setEditText(fact.text);
    setActiveMenuId(null);
  };

  const commitEdit = id => {
    if (editText.trim()) {
      editFact(id, editText.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    deleteFact(id);
    setActiveMenuId(null);
  };

  const formatDate = iso => {
    if (!iso) return 'Recent';
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = cat => {
    const c = normalizeCat(cat).toLowerCase();
    if (c === 'identity') return UserCheck;
    if (c === 'preferences') return Sliders;
    if (c === 'goals') return Target;
    if (c === 'skills') return Wrench;
    return BookOpen;
  };

  // Grouping memories by Category for visual section headers
  const groupedMemories = displayedFacts.reduce((acc, fact) => {
    const cat = normalizeCat(fact.category);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(fact);
    return acc;
  }, {});

  const uniqueCategoryCount = new Set(facts.map(f => normalizeCat(f.category))).size;

  return (
    <div className="memory-center-layout">
      <div className="memory-center-content">
        {/* ── HERO HEADER ─────────────── */}
        <div className="memory-hero-header">
          <div className="memory-hero-badge">
            <Brain size={22} className="memory-brain-icon" />
            <span className="memory-hero-tag">AI Brain</span>
          </div>
          <h1 className="memory-hero-title">Memory Center</h1>
          <p className="memory-hero-subtitle">
            Long-term knowledge that helps samGPT personalize conversations, recall key facts, and deliver tailored responses.
          </p>
        </div>

        {/* ── STATS CARDS GRID ─────────────── */}
        <div className="memory-stats-grid">
          <div className="memory-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Total Memories</span>
              <div className="stat-icon-box">
                <Database size={16} />
              </div>
            </div>
            <div className="stat-card-value">{facts.length}</div>
            <div className="stat-card-sub">Active long-term facts</div>
          </div>

          <div className="memory-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Categories</span>
              <div className="stat-icon-box">
                <Layers size={16} />
              </div>
            </div>
            <div className="stat-card-value">{uniqueCategoryCount}</div>
            <div className="stat-card-sub">Knowledge clusters</div>
          </div>

          <div className="memory-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Pinned Memories</span>
              <div className="stat-icon-box">
                <Pin size={16} />
              </div>
            </div>
            <div className="stat-card-value">{pinnedIds.size}</div>
            <div className="stat-card-sub">High priority facts</div>
          </div>

          <div className="memory-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Memory Health</span>
              <div className="stat-icon-box success">
                <Activity size={16} />
              </div>
            </div>
            <div className="stat-card-value success">
              <span className="health-pulse-dot" /> 100% Active
            </div>
            <div className="stat-card-sub">Real-time sync ready</div>
          </div>

          <div className="memory-stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Auto Extraction</span>
              <div className="stat-icon-box">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="stat-card-value">Enabled</div>
            <div className="stat-card-sub">Learns during chat</div>
          </div>
        </div>

        {/* ── SEARCH BAR & CONTROLS ─────────────── */}
        <div className="memory-controls-section">
          <div className="memory-search-bar">
            <Search size={18} className="memory-search-icon" />
            <input
              type="text"
              placeholder="Search memories, facts, or keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="memory-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="memory-segmented-control">
            {CATEGORIES.map(cat => {
              const count =
                cat === 'All'
                  ? facts.length
                  : facts.filter(f => normalizeCat(f.category) === cat).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  className={`memory-segment-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="segment-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MEMORIES LIST / GROUPED CARDS ─────────────── */}
        {loading ? (
          <div className="memory-skeleton-list">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="memory-skeleton-card" />
            ))}
          </div>
        ) : displayedFacts.length === 0 ? (
          /* Empty State */
          <div className="memory-empty-container">
            <div className="memory-empty-icon-box">
              <Brain size={36} />
            </div>
            <h3>{search ? 'No matching memories found' : 'No memories yet'}</h3>
            <p>
              {search
                ? `No memories matched "${search}". Try another keyword or clear your filter.`
                : 'samGPT automatically learns and remembers important facts about you during your conversations.'}
            </p>
          </div>
        ) : (
          <div className="memory-grouped-sections">
            {Object.keys(groupedMemories).map(categoryName => {
              const items = groupedMemories[categoryName];
              const CatIcon = getCategoryIcon(categoryName);

              return (
                <div key={categoryName} className="memory-category-group">
                  <div className="memory-group-header">
                    <div className="group-header-title">
                      <CatIcon size={16} className="group-header-icon" />
                      <span>{categoryName}</span>
                    </div>
                    <span className="group-header-count">{items.length} facts</span>
                  </div>

                  <div className="memory-cards-grid">
                    <AnimatePresence>
                      {items.map(fact => {
                        const isPinned = pinnedIds.has(fact.id);
                        const isEditing = editingId === fact.id;
                        const isMenuOpen = activeMenuId === fact.id;

                        return (
                          <motion.div
                            key={fact.id}
                            className={`memory-card ${isPinned ? 'pinned' : ''}`}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="memory-card-body">
                              <div className="memory-card-icon-box">
                                <Brain size={18} />
                              </div>

                              <div className="memory-card-main-content">
                                {isEditing ? (
                                  <div className="memory-inline-edit-box">
                                    <textarea
                                      value={editText}
                                      onChange={e => setEditText(e.target.value)}
                                      onBlur={() => commitEdit(fact.id)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          commitEdit(fact.id);
                                        }
                                        if (e.key === 'Escape') setEditingId(null);
                                      }}
                                      autoFocus
                                      rows={2}
                                    />
                                    <div className="memory-edit-hint">
                                      Press Enter to save, Esc to cancel
                                    </div>
                                  </div>
                                ) : (
                                  <p className="memory-card-text">{fact.text}</p>
                                )}

                                <div className="memory-card-footer">
                                  <span className="memory-tag-badge">
                                    <Tag size={10} />
                                    {normalizeCat(fact.category)}
                                  </span>
                                  <span className="memory-date-text">
                                    <Clock size={11} />
                                    {formatDate(fact.createdAt)}
                                  </span>
                                  {isPinned && (
                                    <span className="memory-pinned-badge" title="Pinned Memory">
                                      <Pin size={11} /> Pinned
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Hover 3-Dot Options Menu */}
                              <div className="memory-card-options-wrapper">
                                <button
                                  type="button"
                                  className="memory-options-trigger"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setActiveMenuId(isMenuOpen ? null : fact.id);
                                  }}
                                  title="Memory Options"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                  <div className="memory-options-dropdown" ref={menuRef}>
                                    <button
                                      type="button"
                                      className="memory-option-item"
                                      onClick={e => togglePin(fact.id, e)}
                                    >
                                      <Pin size={13} />
                                      <span>{isPinned ? 'Unpin Memory' : 'Pin Memory'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="memory-option-item"
                                      onClick={e => startEdit(fact, e)}
                                    >
                                      <Edit3 size={13} />
                                      <span>Edit Fact</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="memory-option-item danger"
                                      onClick={e => handleDelete(fact.id, e)}
                                    >
                                      <Trash2 size={13} />
                                      <span>Delete Memory</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
