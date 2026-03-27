import React from 'react';

interface CapturePageHeaderProps {
  duplicate: boolean;
  setDuplicate: (duplicate: boolean) => void;
}

export default function CapturePageHeader({ duplicate, setDuplicate }: CapturePageHeaderProps) {
  return (
    <h2
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        cursor: duplicate ? 'pointer' : 'default',
        color: duplicate ? '#d946ef' : '',
      }}
      onClick={() =>
        duplicate
          ? (window.location.href = '/duplicates.html')
          : undefined
      }
    >
      <span style={{ fontSize: '20px' }}>📥</span>
      <span>{duplicate ? 'Capture Page' : 'Capture Page (Click to View Duplicates)'}</span>
    </h2>
  );
}
