import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Check,
  X,
  Mail,
  Calendar,
  Trash2,
  ShoppingCart,
  Notebook,
  CheckSquare,
  Settings,
  Wrench,
  Loader2,
} from 'lucide-react';

/**
 * ConfirmationCard.jsx
 *
 * Generic confirmation UI component — Phase 3.
 *
 * Renders a structured preview of a pending action and provides
 * [Confirm] and [Cancel] buttons.
 */
export default function ConfirmationCard({ data, onConfirmed, onCancelled }) {
  const [status, setStatus] = useState('idle'); // idle | loading | confirmed | cancelled | error
  const [errorMsg, setErrorMsg] = useState('');

  const { confirmationId, tool, title, message, preview } = data;

  async function handleConfirm() {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      const res = await axios.post('http://localhost:3001/confirm', { confirmationId });
      setStatus('confirmed');
      if (onConfirmed) onConfirmed(res.data);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Confirmation failed. Please try again.');
    }
  }

  async function handleCancel() {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      await axios.post('http://localhost:3001/cancel', { confirmationId });
      setStatus('cancelled');
      if (onCancelled) onCancelled();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Cancellation failed. Please try again.');
    }
  }

  // ── Render preview fields generically ──────────────────────────────────
  function renderPreviewFields() {
    if (!preview) return null;

    // Special-case email fields for a richer layout
    if (preview.to !== undefined && preview.subject !== undefined) {
      return (
        <div className="confirmation-preview">
          <div className="confirmation-preview-field">
            <span className="confirmation-field-label">To</span>
            <span className="confirmation-field-value">{preview.to}</span>
          </div>
          {preview.cc && (
            <div className="confirmation-preview-field">
              <span className="confirmation-field-label">Cc</span>
              <span className="confirmation-field-value">{preview.cc}</span>
            </div>
          )}
          {preview.bcc && (
            <div className="confirmation-preview-field">
              <span className="confirmation-field-label">Bcc</span>
              <span className="confirmation-field-value">{preview.bcc}</span>
            </div>
          )}
          <div className="confirmation-preview-field">
            <span className="confirmation-field-label">Subject</span>
            <span className="confirmation-field-value">{preview.subject}</span>
          </div>
          {preview.body && (
            <div className="confirmation-preview-body">
              <span className="confirmation-field-label">Message</span>
              <div className="confirmation-body-text">{preview.body}</div>
            </div>
          )}
          {preview.signature && (
            <div className="confirmation-preview-field" style={{ marginTop: '8px', borderTop: '1px dashed #3A3A3A', paddingTop: '8px' }}>
              <span className="confirmation-field-label">Signature</span>
              <span className="confirmation-field-value" style={{ fontStyle: 'italic', opacity: 0.8 }}>{preview.signature}</span>
            </div>
          )}
        </div>
      );
    }

    // Generic fallback: render all key/value pairs from the preview object
    return (
      <div className="confirmation-preview">
        {Object.entries(preview).map(([key, value]) => (
          <div key={key} className="confirmation-preview-field">
            <span className="confirmation-field-label">
              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            <span className="confirmation-field-value">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // ── Confirmed state ─────────────────────────────────────────────────────
  if (status === 'confirmed') {
    return (
      <motion.div
        className="confirmation-card confirmation-card--done"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="confirmation-status-icon">
          <Check size={16} />
        </div>
        <div className="confirmation-status-text">Action confirmed. Processing…</div>
      </motion.div>
    );
  }

  // ── Cancelled state ─────────────────────────────────────────────────────
  if (status === 'cancelled') {
    return (
      <motion.div
        className="confirmation-card confirmation-card--cancelled"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="confirmation-status-icon">
          <X size={16} />
        </div>
        <div className="confirmation-status-text">Action cancelled.</div>
      </motion.div>
    );
  }

  // ── Main card ───────────────────────────────────────────────────────────
  return (
    <motion.div
      className="confirmation-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="confirmation-header">
        <span className="confirmation-tool-badge">
          {renderToolIcon(tool)}
          <span>{toolCleanName(tool)}</span>
        </span>
        <span className="confirmation-title">{title}</span>
      </div>

      {/* Prompt message from backend */}
      <p className="confirmation-message">{message}</p>

      {/* Preview content */}
      {renderPreviewFields()}

      {/* Error */}
      {status === 'error' && (
        <div className="confirmation-error">{errorMsg}</div>
      )}

      {/* Actions */}
      <div className="confirmation-actions">
        <button
          id={`confirm-${confirmationId}`}
          className="confirmation-btn confirmation-btn--confirm"
          onClick={handleConfirm}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Check size={14} />
              <span>Confirm</span>
            </>
          )}
        </button>
        <button
          id={`cancel-${confirmationId}`}
          className="confirmation-btn confirmation-btn--cancel"
          onClick={handleCancel}
          disabled={status === 'loading'}
        >
          <X size={14} />
          <span>Cancel</span>
        </button>
      </div>

      {/* Expiry hint */}
      {data.expiresAt && (
        <div className="confirmation-expiry">
          Expires {formatExpiry(data.expiresAt)}
        </div>
      )}
    </motion.div>
  );
}

function renderToolIcon(tool) {
  switch (tool) {
    case 'email_draft': return <Mail size={12} />;
    case 'calendar_event': return <Calendar size={12} />;
    case 'delete_file': return <Trash2 size={12} />;
    case 'browser_checkout': return <ShoppingCart size={12} />;
    case 'delete_note': return <Notebook size={12} />;
    case 'delete_task': return <CheckSquare size={12} />;
    case 'system_command': return <Settings size={12} />;
    default: return <Wrench size={12} />;
  }
}

function toolCleanName(tool) {
  const names = {
    email_draft: 'Email',
    calendar_event: 'Calendar',
    delete_file: 'File',
    browser_checkout: 'Purchase',
    delete_note: 'Note',
    delete_task: 'Task',
    system_command: 'System',
  };
  return names[tool] || tool;
}

function formatExpiry(iso) {
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return 'expired';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'in less than a minute';
  return `in ${mins} minute${mins !== 1 ? 's' : ''}`;
}

