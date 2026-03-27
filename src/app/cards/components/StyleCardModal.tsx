import { FC } from 'react';
import { CachedCard } from '@/lib/idb';
import { TEMPLATE_OPTIONS, COLOR_SCHEME_OPTIONS } from '../constants';
import { CardTemplate, CardColorScheme } from '../types';

interface StyleCardModalProps {
  stylingCard: CachedCard;
  setStylingCard: (card: CachedCard | null) => void;
  busyCardId: string | null;
  saveStyle: () => void;
}

export const StyleCardModal: FC<StyleCardModalProps> = ({ stylingCard, setStylingCard, busyCardId, saveStyle }) => {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="style-modal-title">
      <div className="modal-card modal-card-wide">
        <h2 id="style-modal-title">Card Style</h2>
        <p className="muted">Preview and customize this card look.</p>
        <div className="style-spotlight">
          <div className={`business-card theme-${stylingCard.colorScheme || "forest"} template-${stylingCard.template || "classic"}`}>
            {(stylingCard.template || "classic") === "split" && <div className="business-card-accent" aria-hidden="true" />}
            <div className="business-card-main">
              <div className="business-card-top">
                {stylingCard.logoImage && <img src={stylingCard.logoImage} alt="Card logo" className="business-card-logo" />}
                <div className="business-card-identity">
                  <h3 className="business-card-name">{stylingCard.name}</h3>
                  {stylingCard.company && <p className="business-card-company">{stylingCard.company}</p>}
                  {stylingCard.jobTitle && <p className="business-card-job">{stylingCard.jobTitle}</p>}
                </div>
              </div>
              <div className="business-card-contact">
                {stylingCard.phones[0] && <p>Phone: {stylingCard.phones[0]}</p>}
                {stylingCard.emails[0] && <p>Email: {stylingCard.emails[0]}</p>}
                {stylingCard.websites[0] && <p>Web: {stylingCard.websites[0]}</p>}
              </div>
              {stylingCard.address && <p className="business-card-address">{stylingCard.address}</p>}
            </div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <label>
            Color Scheme
            <select
              value={stylingCard.colorScheme || "forest"}
              onChange={(e) =>
                setStylingCard((prev) =>
                  prev ? { ...prev, colorScheme: e.target.value as CardColorScheme } : prev
                )
              }
            >
              {COLOR_SCHEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Template
            <select
              value={stylingCard.template || "classic"}
              onChange={(e) =>
                setStylingCard((prev) =>
                  prev ? { ...prev, template: e.target.value as CardTemplate } : prev
                )
              }
            >
              {TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button disabled={busyCardId === stylingCard.id} onClick={saveStyle}>
            Save Style
          </button>
          <button className="button-secondary" onClick={() => setStylingCard(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};