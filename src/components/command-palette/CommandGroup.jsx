import React from 'react';

export default function CommandGroup({ title, count, children }) {
  return (
    <div className="command-group-container">
      <div className="command-group-header">
        <span className="command-group-title">{title}</span>
        {count !== undefined && (
          <span className="command-group-count">{count}</span>
        )}
      </div>
      <div className="command-group-items">{children}</div>
    </div>
  );
}
