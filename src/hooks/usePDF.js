/**
 * usePDF.js
 * Central state manager for the PDF Workspace.
 * Handles: PDF list, selected PDF, per-document chat history,
 * API calls (upload, ask, action, search, delete), and follow-up generation.
 * Chat histories are persisted in localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001';
const LS_KEY = 'samgpt_pdf_histories';
const LS_NAMES_KEY = 'samgpt_pdf_names';
const LS_META_KEY = 'samgpt_pdf_meta';

/** Load chat histories from localStorage */
function loadHistories() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Save chat histories to localStorage */
function saveHistories(h) {
  localStorage.setItem(LS_KEY, JSON.stringify(h));
}

/** Load custom display names from localStorage */
function loadNames() {
  try {
    return JSON.parse(localStorage.getItem(LS_NAMES_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Save custom display names */
function saveNames(n) {
  localStorage.setItem(LS_NAMES_KEY, JSON.stringify(n));
}

/** Load extra metadata (upload date per PDF) */
function loadMeta() {
  try {
    return JSON.parse(localStorage.getItem(LS_META_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Save metadata */
function saveMeta(m) {
  localStorage.setItem(LS_META_KEY, JSON.stringify(m));
}

export function usePDF() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [pdfs, setPdfs] = useState([]);                     // PDF name strings from backend
  const [selectedPDF, setSelectedPDF] = useState(null);     // currently active PDF key
  const [chatHistories, setChatHistories] = useState(loadHistories); // { [pdfName]: Message[] }
  const [customNames, setCustomNames] = useState(loadNames); // { [pdfName]: displayName }
  const [pdfMeta, setPdfMeta] = useState(loadMeta);         // { [pdfName]: { uploadedAt } }
  const [isLoading, setIsLoading] = useState(false);        // general loading
  const [isAsking, setIsAsking] = useState(false);          // asking a question
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [followUps, setFollowUps] = useState([]);           // suggested follow-up questions
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [docSummaries, setDocSummaries] = useState({});     // { [pdfName]: summaryText }
  const [searchResults, setSearchResults] = useState([]);   // semantic search results
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // ── Load PDFs from backend on mount ───────────────────────────────────────
  useEffect(() => {
    fetchPDFList();
  }, []);

  // ── Persist histories and names ───────────────────────────────────────────
  useEffect(() => { saveHistories(chatHistories); }, [chatHistories]);
  useEffect(() => { saveNames(customNames); }, [customNames]);
  useEffect(() => { saveMeta(pdfMeta); }, [pdfMeta]);

  // ── Fetch PDF list ────────────────────────────────────────────────────────
  const fetchPDFList = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API}/pdf/list`);
      setPdfs(data);
      // Auto-select first PDF if none selected and list is non-empty
      setSelectedPDF(prev => prev || (data.length > 0 ? data[0] : null));
    } catch (err) {
      setError('Failed to load PDFs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Upload PDFs ───────────────────────────────────────────────────────────
  const uploadPDF = useCallback(async (files) => {
    setUploadProgress(true);
    const meta = { ...pdfMeta };
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('pdf', file);
        await axios.post(`${API}/pdf/upload`, fd);
        meta[file.name] = { uploadedAt: new Date().toISOString() };
      }
      setPdfMeta(meta);
      await fetchPDFList();
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setUploadProgress(false);
    }
  }, [fetchPDFList, pdfMeta]);

  // ── Delete PDF ────────────────────────────────────────────────────────────
  const deletePDF = useCallback(async (pdfName) => {
    try {
      await axios.delete(`${API}/pdf/${encodeURIComponent(pdfName)}`);
      if (selectedPDF === pdfName) setSelectedPDF(null);
      setChatHistories(prev => {
        const next = { ...prev };
        delete next[pdfName];
        return next;
      });
      await fetchPDFList();
    } catch (err) {
      setError('Delete failed');
      console.error(err);
    }
  }, [selectedPDF, fetchPDFList]);

  // ── Rename PDF (display name only, stored in localStorage) ───────────────
  const renamePDF = useCallback((pdfName, newName) => {
    setCustomNames(prev => ({ ...prev, [pdfName]: newName }));
  }, []);

  // ── Ask a question ────────────────────────────────────────────────────────
  const askQuestion = useCallback(async (question) => {
    if (!selectedPDF || !question.trim() || isAsking) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message
    setChatHistories(prev => ({
      ...prev,
      [selectedPDF]: [...(prev[selectedPDF] || []), userMsg],
    }));

    setIsAsking(true);
    setFollowUps([]);

    // Add a loading placeholder for assistant
    const assistantId = Date.now() + 1;
    setChatHistories(prev => ({
      ...prev,
      [selectedPDF]: [
        ...(prev[selectedPDF] || []),
        { id: assistantId, role: 'assistant', content: '', loading: true, timestamp: new Date().toISOString() },
      ],
    }));

    // ChatGPT formatting instructions
    const systemInstructions = `
[Instruction: Answer the question using the PDF. Never copy broken OCR text. Translate OCR errors into clean educational content. For technical/conceptual queries, structure the answer using these sections (only show sections relevant to the query):
# Topic
## Definition (short explanation)
## Algorithm (clean, indented pseudocode if applicable)
## Explanation (bullet points)
## Time Complexity (Best, Average, Worst bullets)
## Space Complexity
## Advantages (bullet points)
## Disadvantages (bullet points)
## Key Points (bullet points)
## Exam Tip (short memory trick)
]`;

    try {
      const formattedQuestion = `${question}\n\n${systemInstructions}`;
      const { data } = await axios.post(`${API}/pdf/ask`, {
        pdfName: selectedPDF,
        question: formattedQuestion,
      });

      const assistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: data.answer,
        loading: false,
        timestamp: new Date().toISOString(),
      };

      setChatHistories(prev => {
        const history = prev[selectedPDF] || [];
        return {
          ...prev,
          [selectedPDF]: history.map(m => m.id === assistantId ? assistantMsg : m),
        };
      });

    } catch (err) {
      const errMsg = {
        id: assistantId,
        role: 'assistant',
        content: `❌ Failed to get answer: ${err.response?.data?.error || err.message}`,
        loading: false,
        timestamp: new Date().toISOString(),
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedPDF]: (prev[selectedPDF] || []).map(m =>
          m.id === assistantId ? errMsg : m
        ),
      }));
    } finally {
      setIsAsking(false);
    }
  }, [selectedPDF, isAsking]);

  // ── Run a PDF action (summarize / quiz / flashcards / notes / explain) ────
  const runAction = useCallback(async (action) => {
    if (!selectedPDF || isActionLoading) return;

    setIsActionLoading(true);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: `Generate ${action} for this document`,
      timestamp: new Date().toISOString(),
      isAction: true,
      action,
    };

    const assistantId = Date.now() + 1;

    setChatHistories(prev => ({
      ...prev,
      [selectedPDF]: [
        ...(prev[selectedPDF] || []),
        userMsg,
        { id: assistantId, role: 'assistant', content: '', loading: true, timestamp: new Date().toISOString() },
      ],
    }));

    try {
      const { data } = await axios.post(`${API}/pdf/action`, {
        pdfName: selectedPDF,
        action,
      });

      const assistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: data.result,
        loading: false,
        action,
        timestamp: new Date().toISOString(),
      };

      setChatHistories(prev => ({
        ...prev,
        [selectedPDF]: (prev[selectedPDF] || []).map(m =>
          m.id === assistantId ? assistantMsg : m
        ),
      }));

    } catch (err) {
      setChatHistories(prev => ({
        ...prev,
        [selectedPDF]: (prev[selectedPDF] || []).map(m =>
          m.id === assistantId
            ? { ...m, content: `❌ Action failed: ${err.message}`, loading: false }
            : m
        ),
      }));
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedPDF, isActionLoading]);

  // ── Semantic search inside PDF ─────────────────────────────────────────────
  const searchInPDF = useCallback(async (keyword) => {
    if (!selectedPDF || !keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/pdf/search`, {
        params: { q: keyword, pdf: selectedPDF },
      });
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
  }, [selectedPDF]);

  // ── Load document summary (lazy, once per PDF per session) ────────────────
  const loadDocSummary = useCallback(async (pdfName) => {
    if (docSummaries[pdfName]) return;
    try {
      const { data } = await axios.post(`${API}/pdf/action`, {
        pdfName,
        action: 'summarize',
      });
      setDocSummaries(prev => ({ ...prev, [pdfName]: data.result }));
    } catch (err) {
      console.error('Summary load failed:', err);
    }
  }, [docSummaries]);

  // ── Clear chat for selected PDF ───────────────────────────────────────────
  const clearChat = useCallback(() => {
    if (!selectedPDF) return;
    setChatHistories(prev => ({ ...prev, [selectedPDF]: [] }));
    setFollowUps([]);
  }, [selectedPDF]);

  // ── Generate follow-up questions ──────────────────────────────────────────
  const generateFollowUps = useCallback(async (question, answer) => {
    if (!selectedPDF) return;
    try {
      const prompt = `Based on this Q&A about the document, suggest exactly 4 concise follow-up questions the student might want to ask next. Return ONLY a JSON array of 4 strings, nothing else.

Question: ${question}
Answer: ${answer.slice(0, 600)}

Return format: ["Q1", "Q2", "Q3", "Q4"]`;

      const { data } = await axios.post(`${API}/pdf/ask`, {
        pdfName: selectedPDF,
        question: prompt,
      });

      try {
        const match = data.answer.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            setFollowUps(parsed.slice(0, 4));
          }
        }
      } catch {
        // If parsing fails, extract lines that look like questions
        const lines = data.answer
          .split('\n')
          .map(l => l.replace(/^[\d\-\*\.\)]+\s*/, '').trim())
          .filter(l => l.length > 10 && l.includes('?'))
          .slice(0, 4);
        setFollowUps(lines);
      }
    } catch (err) {
      console.error('Follow-ups failed:', err);
    }
  }, [selectedPDF]);

  // ── Extract approximate source pages from answer text ─────────────────────
  function extractSources(answer) {
    // Look for "page X" mentions in the answer
    const matches = [...answer.matchAll(/page\s+(\d+)/gi)];
    const pages = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);
    return pages.length > 0 ? pages : [];
  }

  // ── Select a PDF and load its summary ─────────────────────────────────────
  const selectPDF = useCallback((pdfName) => {
    setSelectedPDF(pdfName);
    setFollowUps([]);
    setSearchResults([]);
    if (pdfName) loadDocSummary(pdfName);
  }, [loadDocSummary]);

  // ── Display name helper ────────────────────────────────────────────────────
  const getDisplayName = useCallback((pdfName) => {
    return customNames[pdfName] || pdfName.replace(/\.[^/.]+$/, '');
  }, [customNames]);

  // ── Question count per PDF ─────────────────────────────────────────────────
  const getQuestionCount = useCallback((pdfName) => {
    const history = chatHistories[pdfName] || [];
    return history.filter(m => m.role === 'user').length;
  }, [chatHistories]);

  return {
    // State
    pdfs,
    selectedPDF,
    chatHistory: chatHistories[selectedPDF] || [],
    followUps,
    isLoading,
    isAsking,
    isActionLoading,
    uploadProgress,
    rightPanelOpen,
    docSummaries,
    searchResults,
    error,
    pdfMeta,

    // Actions
    fetchPDFList,
    uploadPDF,
    deletePDF,
    renamePDF,
    selectPDF,
    askQuestion,
    runAction,
    searchInPDF,
    clearChat,
    setRightPanelOpen,
    setError,

    // Helpers
    getDisplayName,
    getQuestionCount,
  };
}
