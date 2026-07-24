import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemory } from '../../hooks/useMemory';

const CATEGORIES = ['All', 'Identity', 'Preference', 'Context', 'Skill', 'Goal'];

export default function MemoryPage() {
  const { facts, filtered, loading, search, setSearch, deleteFact, editFact } = useMemory();
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const displayed = activeCategory === 'All' ? filtered : filtered.filter(f => f.category === activeCategory);

  function startEdit(fact) { setEditingId(fact.id); setEditText(fact.text); }
  function commitEdit(id) { if (editText.trim()) editFact(id, editText.trim()); setEditingId(null); }
  function formatDate(iso) { if (!iso) return ''; return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Memory</div>
        <div className="page-subtitle">{facts.length} stored facts</div>
      </div>
      <div className="page-body">
        <div className="stats-row">
          <div className="stat-card"><div className="stat-value">{facts.length}</div><div className="stat-label">Total Facts</div></div>
          <div className="stat-card"><div className="stat-value">{[...new Set(facts.map(f => f.category).filter(Boolean))].length}</div><div className="stat-label">Categories</div></div>
          <div className="stat-card"><div className="stat-value" style={{color:'var(--success)'}}>Active</div><div className="stat-label">Status</div></div>
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memory..." />
          {search && <button onClick={() => setSearch('')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}>✕</button>}
        </div>

        <div className="filter-pills">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:56,borderRadius:'var(--radius-md)'}} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧠</div>
            <div className="empty-title">No memory facts found</div>
            <div className="empty-desc">{search ? 'Try a different search' : 'Facts appear as you chat'}</div>
          </div>
        ) : (
          <div>
            {displayed.map(fact => (
              <motion.div key={fact.id} className="memory-item" layout initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.15}}>
                <div className="memory-icon">🧠</div>
                <div style={{flex:1}}>
                  {editingId === fact.id ? (
                    <textarea value={editText} onChange={e => setEditText(e.target.value)}
                      onBlur={() => commitEdit(fact.id)}
                      onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(fact.id); } if (e.key==='Escape') setEditingId(null); }}
                      autoFocus rows={2}
                      style={{width:'100%',background:'var(--bg-secondary)',border:'1px solid var(--border-hover)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:14,padding:'6px 10px',outline:'none',resize:'none',fontFamily:'inherit',lineHeight:1.5}}
                    />
                  ) : (
                    <div className="memory-text">{fact.text}</div>
                  )}
                  <div className="memory-meta">
                    {fact.category && <span className="memory-tag">{fact.category}</span>}
                    <span>{formatDate(fact.createdAt)}</span>
                  </div>
                </div>
                <div className="memory-actions">
                  <button className="card-btn" onClick={() => startEdit(fact)}>Edit</button>
                  <button className="card-btn danger" onClick={() => deleteFact(fact.id)}>Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
