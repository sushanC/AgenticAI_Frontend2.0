import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  CheckSquare,
  FileSearch,
  Brain,
  Settings,
  PlusCircle,
  FolderPlus,
  FileUp,
  Download,
  Upload,
  Mic,
  Cpu,
  Zap,
  Terminal,
  Clock,
  Pin,
  Sparkles,
} from 'lucide-react';

/**
 * CommandRegistry.js
 * Extensible Central Command Registry for samGPT Command Palette.
 * Allows core modules and third-party extensions/plugins to dynamically register commands.
 */

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.listeners = new Set();
    this.recentIds = JSON.parse(localStorage.getItem('samgpt_recent_commands') || '[]');
    this.pinnedIds = new Set(JSON.parse(localStorage.getItem('samgpt_pinned_commands') || '[]'));
  }

  /**
   * Register a new command
   * @param {Object} command
   */
  register(command) {
    if (!command.id || !command.label) {
      console.warn('Command registration failed: missing id or label', command);
      return;
    }
    this.commands.set(command.id, {
      section: 'General',
      keywords: [],
      ...command,
    });
    this.notify();
  }

  /**
   * Register multiple commands at once
   * @param {Array} commandList
   */
  registerMany(commandList) {
    commandList.forEach(cmd => this.register(cmd));
  }

  /**
   * Unregister a command by ID
   * @param {string} id
   */
  unregister(id) {
    this.commands.delete(id);
    this.notify();
  }

  /**
   * Get all registered commands
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Record a command execution into Recents (max 10)
   */
  recordExecution(id) {
    let list = this.recentIds.filter(i => i !== id);
    list.unshift(id);
    if (list.length > 10) list = list.slice(0, 10);
    this.recentIds = list;
    localStorage.setItem('samgpt_recent_commands', JSON.stringify(list));
    this.notify();
  }

  /**
   * Get recent commands
   */
  getRecents() {
    return this.recentIds
      .map(id => this.commands.get(id))
      .filter(Boolean);
  }

  /**
   * Toggle Pin status for a command
   */
  togglePin(id) {
    if (this.pinnedIds.has(id)) {
      this.pinnedIds.delete(id);
    } else {
      this.pinnedIds.add(id);
    }
    localStorage.setItem('samgpt_pinned_commands', JSON.stringify(Array.from(this.pinnedIds)));
    this.notify();
  }

  /**
   * Check if a command is pinned
   */
  isPinned(id) {
    return this.pinnedIds.has(id);
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }
}

export const commandRegistry = new CommandRegistry();

/**
 * Initialize Default Core Built-in Commands
 */
export function initDefaultCommands(context = {}) {
  const { setPage, handleNewChat, setVoiceOpen, setDevOpen } = context;

  const defaultCommands = [
    // ── Navigation Section ──────────────────────────────────────────────────
    {
      id: 'nav.chat',
      section: 'Navigation',
      label: 'Chat Window',
      desc: 'Open primary conversational assistant',
      icon: MessageSquare,
      keywords: ['chat', 'messages', 'ai', 'conversation', 'home'],
      shortcut: 'Ctrl+1',
      perform: () => setPage && setPage('chat'),
    },
    {
      id: 'nav.dashboard',
      section: 'Navigation',
      label: 'AI Command Center',
      desc: 'View application metrics and usage statistics',
      icon: LayoutDashboard,
      keywords: ['dashboard', 'stats', 'metrics', 'analytics', 'command'],
      shortcut: 'Ctrl+2',
      perform: () => setPage && setPage('dashboard'),
    },
    {
      id: 'nav.notes',
      section: 'Navigation',
      label: 'Notes (Second Brain)',
      desc: 'Knowledge collection and document notes',
      icon: FileText,
      keywords: ['notes', 'knowledge', 'ideas', 'editor', 'writing'],
      shortcut: 'Ctrl+3',
      perform: () => setPage && setPage('notes'),
    },
    {
      id: 'nav.tasks',
      section: 'Navigation',
      label: 'Tasks & Productivity',
      desc: 'Manage tasks, progress, and action items',
      icon: CheckSquare,
      keywords: ['tasks', 'todo', 'planner', 'checklists'],
      shortcut: 'Ctrl+4',
      perform: () => setPage && setPage('tasks'),
    },
    {
      id: 'nav.pdf',
      section: 'Navigation',
      label: 'PDF Research Studio',
      desc: 'Document intelligence and RAG Q&A',
      icon: FileSearch,
      keywords: ['pdf', 'document', 'rag', 'research', 'upload'],
      shortcut: 'Ctrl+5',
      perform: () => setPage && setPage('pdfs'),
    },
    {
      id: 'nav.memory',
      section: 'Navigation',
      label: 'Memory Center',
      desc: 'View long-term facts samGPT remembers about you',
      icon: Brain,
      keywords: ['memory', 'facts', 'identity', 'preferences', 'brain'],
      shortcut: 'Ctrl+6',
      perform: () => setPage && setPage('memory'),
    },
    {
      id: 'nav.settings',
      section: 'Navigation',
      label: 'Settings & Preferences',
      desc: 'Configure models, voice, routing, and system data',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config', 'models', 'voice'],
      shortcut: 'Ctrl+,',
      perform: () => setPage && setPage('settings'),
    },

    // ── Application Actions Section ─────────────────────────────────────────
    {
      id: 'action.new_chat',
      section: 'Actions',
      label: 'New Chat Session',
      desc: 'Clear conversation history and start fresh',
      icon: PlusCircle,
      keywords: ['new', 'chat', 'reset', 'clear'],
      shortcut: 'Ctrl+N',
      perform: () => {
        handleNewChat && handleNewChat();
        setPage && setPage('chat');
      },
    },
    {
      id: 'action.create_note',
      section: 'Actions',
      label: 'Create Note',
      desc: 'Add a new note to your Second Brain',
      icon: FolderPlus,
      keywords: ['create', 'note', 'add', 'new note'],
      perform: () => setPage && setPage('notes'),
    },
    {
      id: 'action.create_task',
      section: 'Actions',
      label: 'Create Task',
      desc: 'Add a new item to your task manager',
      icon: CheckSquare,
      keywords: ['create', 'task', 'add task', 'todo'],
      perform: () => setPage && setPage('tasks'),
    },
    {
      id: 'action.import_pdf',
      section: 'Actions',
      label: 'Import PDF Document',
      desc: 'Upload a PDF document for AI analysis',
      icon: FileUp,
      keywords: ['import', 'pdf', 'upload', 'document'],
      perform: () => setPage && setPage('pdfs'),
    },
    {
      id: 'action.toggle_voice',
      section: 'Actions',
      label: 'Toggle Voice Assistant',
      desc: 'Launch Jarvis voice experience overlay',
      icon: Mic,
      keywords: ['voice', 'speech', 'jarvis', 'audio', 'listen'],
      shortcut: 'Ctrl+Shift+V',
      perform: () => setVoiceOpen && setVoiceOpen(prev => !prev),
    },

    // ── AI Models Section ───────────────────────────────────────────────────
    {
      id: 'ai.auto_routing',
      section: 'AI Models',
      label: 'Auto Routing (Registry Default)',
      desc: 'Let Model Registry choose the best model for each query',
      icon: Sparkles,
      keywords: ['ai', 'model', 'auto', 'routing', 'smart'],
      perform: () => setPage && setPage('settings'),
    },
    {
      id: 'ai.gemini',
      section: 'AI Models',
      label: 'Switch to Gemini 2.5 Flash',
      desc: 'High speed Google DeepMind model',
      icon: Cpu,
      keywords: ['gemini', 'google', 'flash', 'model'],
      perform: () => setPage && setPage('settings'),
    },
    {
      id: 'ai.groq',
      section: 'AI Models',
      label: 'Switch to Groq Llama 3',
      desc: 'Ultra-low latency inference engine',
      icon: Zap,
      keywords: ['groq', 'llama', 'fast', 'model'],
      perform: () => setPage && setPage('settings'),
    },
    {
      id: 'ai.openrouter',
      section: 'AI Models',
      label: 'Switch to OpenRouter Claude 3.5',
      desc: 'Unified multi-provider AI gateway',
      icon: Cpu,
      keywords: ['openrouter', 'claude', 'anthropic', 'model'],
      perform: () => setPage && setPage('settings'),
    },
  ];

  commandRegistry.registerMany(defaultCommands);
}
