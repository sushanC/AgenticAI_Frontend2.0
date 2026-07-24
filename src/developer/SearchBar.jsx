/**
 * SearchBar.jsx
 *
 * Search input + filter dropdowns for the developer console timeline.
 * Filters: Provider, Model, Intent, Tool, Status.
 */

const INTENTS = ['chat', 'email', 'task', 'note', 'memory', 'pdf', 'research', 'agent', 'web'];
const TOOLS   = ['chat', 'email', 'task', 'note', 'memory', 'pdf', 'web', 'agent', 'confirmation', 'waiting_input'];
const PROVIDERS = ['google', 'groq', 'openrouter', 'deepseek', 'glm', 'ollama'];
const STATUSES  = [
  { value: '',       label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'error',   label: 'Error' },
];

/**
 * @param {{
 *   searchQuery:    string,
 *   setSearchQuery: (q: string) => void,
 *   filters:        object,
 *   setFilter:      (key: string, value: string) => void,
 *   clearFilters:   () => void,
 *   totalCount:     number,
 *   filteredCount:  number,
 * }} props
 */
export default function SearchBar({
  searchQuery,
  setSearchQuery,
  filters,
  setFilter,
  clearFilters,
  totalCount,
  filteredCount,
}) {
  const hasActiveFilters =
    searchQuery || filters.provider || filters.model ||
    filters.intent || filters.tool || filters.status;

  return (
    <div className="dc-searchbar">
      {/* Text search */}
      <div className="dc-search-input-wrap">
        <span className="dc-search-icon">🔍</span>
        <input
          id="dc-search-input"
          className="dc-search-input"
          type="text"
          placeholder="Search prompts, providers, models…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {searchQuery && (
          <button
            className="dc-icon-btn"
            style={{ width: 20, height: 20, fontSize: 10 }}
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="dc-filter-group">
        <select
          id="dc-filter-provider"
          className="dc-filter-select"
          value={filters.provider}
          onChange={e => setFilter('provider', e.target.value)}
          title="Filter by provider"
        >
          <option value="">Provider</option>
          {PROVIDERS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          id="dc-filter-intent"
          className="dc-filter-select"
          value={filters.intent}
          onChange={e => setFilter('intent', e.target.value)}
          title="Filter by intent"
        >
          <option value="">Intent</option>
          {INTENTS.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <select
          id="dc-filter-tool"
          className="dc-filter-select"
          value={filters.tool}
          onChange={e => setFilter('tool', e.target.value)}
          title="Filter by tool"
        >
          <option value="">Tool</option>
          {TOOLS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          id="dc-filter-status"
          className="dc-filter-select"
          value={filters.status}
          onChange={e => setFilter('status', e.target.value)}
          title="Filter by status"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            id="dc-filter-clear-btn"
            className="dc-filter-clear"
            onClick={clearFilters}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {filteredCount}/{totalCount}
      </span>
    </div>
  );
}
