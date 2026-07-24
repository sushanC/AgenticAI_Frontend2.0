/**
 * useDeveloperEvents.js
 *
 * React hook that subscribes to window.devConsoleAPI, maintains a
 * ring-buffer of DevEvents and FullRequestSummary objects, and provides
 * search/filter functions.
 *
 * Features:
 *   • Loads history from IPC on first mount
 *   • Subscribes to real-time 'dev:event' pushes
 *   • Batches incoming events with setTimeout(0) to avoid per-event re-renders
 *   • Caps display at MAX_DISPLAY items (newest first)
 *   • Provides search and filter helpers
 *   • Gracefully no-ops when window.devConsoleAPI is not available (browser)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_DISPLAY = 500;

// ─── Browser shim ──────────────────────────────────────────────────────────

const NOOP     = () => {};
const NOOP_SUB = () => NOOP;

const CONSOLE_SHIM = {
  onDevEvent:            NOOP_SUB,
  getHistory:            () => Promise.resolve([]),
  clearHistory:          NOOP,
  onOpenDeveloperConsole: NOOP_SUB,
};

function getConsoleAPI() {
  return (typeof window !== 'undefined' && window.devConsoleAPI)
    ? window.devConsoleAPI
    : CONSOLE_SHIM;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   requests:       object[],        // FullRequestSummary[] newest-first
 *   liveEvents:     object[],        // all raw events newest-first
 *   selectedId:     string|null,
 *   selectedRequest: object|null,
 *   selectRequest:  (id: string) => void,
 *   clearAll:       () => void,
 *   searchQuery:    string,
 *   setSearchQuery: (q: string) => void,
 *   filters:        object,
 *   setFilter:      (key: string, value: string) => void,
 *   clearFilters:   () => void,
 *   filteredRequests: object[],
 *   isLive:         boolean,
 * }}
 */
export function useDeveloperEvents() {
  const [requests,    setRequests]    = useState([]);   // FullRequestSummary[]
  const [liveEvents,  setLiveEvents]  = useState([]);   // all raw events
  const [selectedId,  setSelectedId]  = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters,     setFilters]     = useState({
    provider: '',
    model:    '',
    intent:   '',
    tool:     '',
    status:   '',
  });
  const [isLive, setIsLive] = useState(true);

  // Pending events batch (to avoid per-event re-render)
  const pendingEvents  = useRef([]);
  const flushTimer     = useRef(null);
  const isFlushScheduled = useRef(false);

  // ── Load history on mount ───────────────────────────────────────────────
  useEffect(() => {
    const api = getConsoleAPI();

    api.getHistory().then((history) => {
      if (history && history.length > 0) {
        setRequests(history.slice(0, MAX_DISPLAY));
      }
    }).catch(() => {});

    // ── Subscribe to live events ────────────────────────────────────────
    const unsub = api.onDevEvent((event) => {
      pendingEvents.current.push(event);
      if (!isFlushScheduled.current) {
        isFlushScheduled.current = true;
        flushTimer.current = setTimeout(() => {
          _flushPending();
          isFlushScheduled.current = false;
        }, 0);
      }
    });

    return () => {
      unsub();
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flush pending events into state ────────────────────────────────────
  function _flushPending() {
    const batch = pendingEvents.current.splice(0);
    if (batch.length === 0) return;

    setLiveEvents(prev => {
      const combined = [...batch.reverse(), ...prev];
      return combined.slice(0, MAX_DISPLAY);
    });

    // Extract FullRequestSummary events into the requests list
    const summaries = batch.filter(e => e.type === 'FullRequestSummary');
    if (summaries.length > 0) {
      setRequests(prev => {
        const combined = [...summaries, ...prev];
        return combined.slice(0, MAX_DISPLAY);
      });
    }
  }

  // ── Select a request ───────────────────────────────────────────────────
  const selectRequest = useCallback((id) => {
    setSelectedId(id);
  }, []);

  // ── Selected request object ────────────────────────────────────────────
  const selectedRequest = requests.find(r => r.requestId === selectedId) || null;

  // ── Clear all ──────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    getConsoleAPI().clearHistory();
    setRequests([]);
    setLiveEvents([]);
    setSelectedId(null);
    pendingEvents.current = [];
  }, []);

  // ── Filter helpers ─────────────────────────────────────────────────────
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ provider: '', model: '', intent: '', tool: '', status: '' });
    setSearchQuery('');
  }, []);

  // ── Filtered + searched requests ───────────────────────────────────────
  const filteredRequests = requests.filter(r => {
    if (filters.provider && r.provider !== filters.provider) return false;
    if (filters.model    && !r.model?.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.intent   && r.intent !== filters.intent) return false;
    if (filters.tool     && r.tool !== filters.tool) return false;
    if (filters.status   && filters.status === 'error' && r.success !== false) return false;
    if (filters.status   && filters.status === 'success' && r.success === false) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.userPrompt?.toLowerCase().includes(q)  ||
        r.intent?.toLowerCase().includes(q)       ||
        r.provider?.toLowerCase().includes(q)     ||
        r.model?.toLowerCase().includes(q)        ||
        r.tool?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return {
    requests,
    liveEvents,
    selectedId,
    selectedRequest,
    selectRequest,
    clearAll,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    filteredRequests,
    isLive,
    setIsLive,
  };
}
