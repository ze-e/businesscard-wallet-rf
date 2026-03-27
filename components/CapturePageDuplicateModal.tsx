import React from 'react';

interface CapturePageDuplicateModalProps {
  duplicate: boolean;
  mergeCard: () => Promise<void>;
  merge: (existingCard: any, duplicate: any) => Promise<CreateCardInput | null>;
  saveAsNew: () => void;
}

export default function CapturePageDuplicateModal({
  duplicate,
  mergeCard,
  merge,
  saveAsNew,
}: CapturePageDuplicateModalProps) {
  const [showMergeModal, setShowMergeModal] = React.useState(false);

  return (
    <>
      {showMergeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              maxWidth: '400px',
            }}
          >
            <h3>Save Duplicate?</h3>
            <p>
              A duplicate card was captured. Do you want to merge it with the current card?
            </p>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <img src={duplicate.image} alt="duplicate" style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '-100%',
                    left: 0,
                    height: '0px',
                    background: 'green',
                    transition: 'top 0.1s, height 0.1s',
                  }}
                  onClick={() => {
                    mergeCard();
                    setShowMergeModal(false);
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-100%',
                  right: 0,
                  width: '0px',
                  background: 'blue',
                  transition: 'right 0.1s, width 0.1s',
                }}
                onClick={() => saveAsNew()}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: '-100%',
                  width: '0px',
                  background: 'red',
                  transition: 'right 0.1s, width 0.1s',
                }}
                onClick={() => setShowMergeModal(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '-100%',
                  height: '0px',
                  background: 'orange',
                  transition: 'bottom 0.1s, height 0.1s',
                }}
                onClick={() => merge(duplicate)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  flex: 1,
                  background: 'green',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  mergeCard();
                  setShowMergeModal(false);
                }}
              >
                Merge with Current
              </button>
              <button
                style={{
                  flex: 1,
                  background: 'blue',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => saveAsNew()}
              >
                Save as New
              </button>
              <button
                style={{
                  flex: 1,
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowMergeModal(false)}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
