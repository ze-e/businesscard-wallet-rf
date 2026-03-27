import { FC } from 'react';
import { CachedCard } from '@/lib/idb';
import { splitList } from '../utils';
import { TEMPLATE_OPTIONS, COLOR_SCHEME_OPTIONS } from '../constants';

interface EditCardModalProps {
  isOpen: boolean;
  card: CachedCard | null;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  onUpdateField: (field: keyof CachedCard, value: any) => void;
  onReplaceLogo: (file: File | null) => void;
}

export const EditCardModal: FC<EditCardModalProps> = ({
  isOpen,
  card,
  onClose,
  onSave,
  isSaving,
  onUpdateField,
  onReplaceLogo
}) => {
  if (!isOpen || !card) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-card modal-card-wide">
        <h2 id="edit-modal-title">Edit Card</h2>
        
        <label>
          Name
          <input
            value={card.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
          />
        </label>
        
        <label>
          Company
          <input
            value={card.company || ""}
            onChange={(e) => onUpdateField('company', e.target.value || null)}
          />
        </label>

        <label>
          Job Title
          <input
            value={card.jobTitle || ""}
            onChange={(e) => onUpdateField('jobTitle', e.target.value || null)}
          />
        </label>

        <label>
          Address
          <input
            value={card.address || ""}
            onChange={(e) => onUpdateField('address', e.target.value || null)}
          />
        </label>

        <label>
          Notes
          <textarea
            value={card.notes || ""}
            onChange={(e) => onUpdateField('notes', e.target.value || null)}
            rows={3}
          />
        </label>

        <label>
          Phone Numbers (comma/newline separated)
          <textarea
            value={card.phones.join("\n")}
            onChange={(e) => onUpdateField('phones', splitList(e.target.value))}
            rows={2}
            placeholder="One phone number per line"
          />
        </label>

        <label>
          Emails (comma/newline separated)
          <textarea
            value={card.emails.join("\n")}
            onChange={(e) => onUpdateField('emails', splitList(e.target.value))}
            rows={2}
            placeholder="One email per line"
          />
        </label>

        <label>
          Websites (comma/newline separated)
          <textarea
            value={card.websites.join("\n")}
            onChange={(e) => onUpdateField('websites', splitList(e.target.value))}
            rows={2}
            placeholder="One website per line"
          />
        </label>

        <label>
          Logo Image
          <input 
            type="file" 
            accept="image/png,image/jpeg,image/webp" 
            onChange={(e) => onReplaceLogo(e.target.files?.[0] || null)} 
          />
        </label>

        <p className="muted" style={{ marginTop: 6, marginBottom: 10 }}>
          Logo image extraction is currently in development and may be inaccurate. Please review and adjust manually.
        </p>

        {card.logoImage && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <button 
              className="button-secondary" 
              onClick={() => onUpdateField('logoImage', null)}
            >
              Remove Logo Image
            </button>
          </div>
        )}

        {card.logoImage && (
          <div style={{ marginBottom: 10 }}>
            <img 
              src={card.logoImage} 
              alt="Editable logo" 
              style={{ maxWidth: 220, maxHeight: 120, objectFit: "contain", border: "1px solid #d6dfd8", borderRadius: 8, background: "#fff" }} 
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};