import React from 'react';

interface CapturePageNotesProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export default function CapturePageNotes({ notes, setNotes }: CapturePageNotesProps) {
  return (
    <section style={{ marginBottom: '16px' }}>
      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
    </section>
  );
}
