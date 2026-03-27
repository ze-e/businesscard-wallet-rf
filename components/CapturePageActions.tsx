import React from 'react';

interface CapturePageActionsProps {
  duplicate: boolean;
  onDuplicate: () => void;
  onSave: () => void;
  onSaveAsNew: () => void;
}

export default function CapturePageActions({
  duplicate,
  onDuplicate,
  onSave,
  onSaveAsNew,
}: CapturePageActionsProps) {
  const [savePending, setSavePending] = React.useState(false);
  const [savePendingAsNew, setSavePendingAsNew] = React.useState(false);

  return (
    <section style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
      {duplicate ? (
        <>
          <button onClick={onDuplicate}>Save</button>
          <button onClick={onSaveAsNew}>Save as New</button>
        </>
      ) : (
        <button onClick={onSave}>Save</button>
      )}
      <input
        type="checkbox"
        checked={duplicate}
        onChange={(e) => (window.location.href = e.target.checked ? '/duplicates.html' : '/')}
      />
      <label>
        Duplicate Mode
        <span style={{ color: 'red' }}>{' '}</span>
      </label>
    </section>
  );
}
