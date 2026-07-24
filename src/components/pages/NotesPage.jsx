import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso), now = new Date(), diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotesPage() {
  const { filtered, search, setSearch, addNote, updateNote, deleteNote } = useNotes();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', body: '' });

  function handleCreate() { if (!newTitle.trim()) return; addNote(newTitle.trim(), newBody.trim()); setNewTitle(''); setNewBody(''); setCreating(false); }
  function startEdit(n) { setEditingId(n.id); setEditData({ title: n.title, body: n.body }); }
  function commitEdit() { if (!editData.title.trim()) return; updateNote(editingId, editData); setEditingId(null); }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div className="page-title">Notes</div>
            <div className="page-subtitle">{filtered.length} notes</div>
          </div>
          <button className="add-btn" onClick={() => setCreating(true)}>+ New Note</button>
        </div>
      </div>
      <div className="page-body">
        <AnimatePresence>
          {creating && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden',marginBottom:16}}>
              <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border-hover)',borderRadius:'var(--radius-lg)',padding:16}}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" autoFocus
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontSize:16,fontWeight:600,marginBottom:10,fontFamily:'inherit'}}
                />
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Write something..." rows={3}
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'var(--text-secondary)',fontSize:14,resize:'none',fontFamily:'inherit',lineHeight:1.6}}
                />
                <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12,paddingTop:12,borderTop:'1px solid var(--border-light)'}}>
                  <button className="card-btn" onClick={() => setCreating(false)}>Cancel</button>
                  <button className="add-btn" onClick={handleCreate} disabled={!newTitle.trim()} style={{padding:'4px 14px'}}>Save</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." />
          {search && <button onClick={() => setSearch('')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}>✕</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <div className="empty-title">No notes yet</div>
            <div className="empty-desc">{search ? 'No notes match your search' : 'Create your first note'}</div>
          </div>
        ) : (
          filtered.map(note => (
            <motion.div key={note.id} className="content-card" layout initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.15}}>
              {editingId === note.id ? (
                <div>
                  <input value={editData.title} onChange={e => setEditData(d => ({...d,title:e.target.value}))} autoFocus
                    style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontSize:14,fontWeight:600,marginBottom:8,fontFamily:'inherit',borderBottom:'1px solid var(--border-hover)',paddingBottom:6}}
                  />
                  <textarea value={editData.body} onChange={e => setEditData(d => ({...d,body:e.target.value}))} rows={3}
                    style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'var(--text-secondary)',fontSize:13,resize:'none',fontFamily:'inherit',lineHeight:1.6,marginBottom:10}}
                  />
                  <div style={{display:'flex',gap:6}}>
                    <button className="card-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="add-btn" style={{padding:'3px 12px',fontSize:12}} onClick={commitEdit}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-title">{note.title}</div>
                  {note.body && <div className="card-body" style={{display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{note.body}</div>}
                  <div className="card-footer">
                    <span className="card-timestamp">{formatDate(note.updatedAt)}</span>
                    <div className="card-actions">
                      <button className="card-btn" onClick={() => startEdit(note)}>Edit</button>
                      <button className="card-btn danger" onClick={() => deleteNote(note.id)}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
