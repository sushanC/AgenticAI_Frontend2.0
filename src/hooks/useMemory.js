import { useState, useEffect } from 'react';
import axios from 'axios';

export function useMemory() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFacts();
  }, []);

  async function fetchFacts() {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/memory');
      setFacts(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Use mock data if backend unavailable
      setFacts([
        { id: 1, text: "User prefers concise answers", category: "Preference", createdAt: new Date().toISOString() },
        { id: 2, text: "User is building an AI assistant frontend", category: "Context", createdAt: new Date().toISOString() },
        { id: 3, text: "User's name is Sushan", category: "Identity", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFact(
  id
) {

  try {

    await axios.delete(
      `http://localhost:3001/memory/${id}`
    );

    await fetchFacts();

  } catch (err) {

    console.error(
      "Failed to delete memory",
      err
    );
  }
}

  async function editFact(id, text) {
    try {
      await axios.patch(`http://localhost:3001/memory/${id}`, { text });
    } catch {}
    setFacts(prev => prev.map(f => f.id === id ? { ...f, text } : f));
  }

  const filtered = facts.filter(f =>
    f.text?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return { facts, filtered, loading, search, setSearch, deleteFact, editFact, fetchFacts };
}
