import { FC } from 'react';
import { CachedCard } from '@/lib/idb';
import { TEMPLATE_OPTIONS, COLOR_SCHEME_OPTIONS } from '../constants';

interface StyleCardModalProps {
  isOpen: boolean;
  card: CachedCard | null;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  onUpdateField: (field: keyof CachedCard, value: any) => void;
}

export const StyleCardModal: FC<StyleCardModalProps> = ({
  isOpen,
  card,
  onClose,
  onSave,
  isSaving,
  onUpdateField
}) => {
  if (!isOpen || !card) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="style-modal-title">
      <div className="modal-card">
        <h2 id="style-modal-title">Style Card</h2>

        <div className="style-preview-wrapper" style={{ marginBottom: 16 }}>
          <div className={`business-card theme-${card.colorScheme || 'forest'} template-${card.template || 'classic'}`}>
            {(card.template || 'classic') === 'split' && <div className="business-card-accent" aria-hidden="true" />}
            <div className="business-card-main">
              <div className="business-card-top">
                {card.logoImage && <img src={card.logoImage} alt="Card logo" className="business-card-logo" />}
                <div className="business-card-identity">
                  <h3 className="business-card-name">{card.name}</h3>
                  {card.company && <p className="business-card-company">{card.company}</p>}
                  {card.jobTitle && <p className="business-card-job">{card.jobTitle}</p>}
                </div>
              </div>
              <div className="business-card-contact">
                {card.phones[0] && <p>Phone: {card.phones[0]}</p>}
                {card.emails[0] && <p>Email: {card.emails[0]}</p>}
                {card.websites[0] && <p>Web: {card.websites[0]}</p>}
              </div>
              {card.address && <p className="business-card-address">{card.address}</p>}
            </div>
          </div>
        </div>

        <label>
          Template
          <select
            value={card.template}
            onChange={(e) => onUpdateField('template', e.target.value)}
          >
            {TEMPLATE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Color Scheme
          <select
            value={card.colorScheme}
            onChange={(e) => onUpdateField('colorScheme', e.target.value)}
          >
            {COLOR_SCHEME_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Style'}
          </button>
        </div>
      </div>
    </div>
  );
};