import { FC } from 'react';
import { CachedCard } from '@/lib/idb';

interface CardItemProps {
  card: CachedCard;
  online: boolean;
  busyCardId: string | null;
  startEdit: (card: CachedCard) => void;
  startStyle: (card: CachedCard) => void;
}

export const CardItem: FC<CardItemProps> = ({ card, online, busyCardId, startEdit, startStyle }) => {
  return (
    <article className="panel card-deck-item">
      <div className={`business-card theme-${card.colorScheme || "forest"} template-${card.template || "classic"}`}>
        <div className="card-icon-actions">
          <button
            type="button"
            className="card-icon-button"
            aria-label="Style card"
            title="Style"
            disabled={!online || busyCardId === card.id}
            onClick={() => startStyle(card)}
          >
            {"\u{1F58C}"}
          </button>
          <button
            type="button"
            className="card-icon-button"
            aria-label="Edit card"
            title="Edit"
            disabled={!online || busyCardId === card.id}
            onClick={() => startEdit(card)}
          >
            {"\u2699"}
          </button>
        </div>
        {(card.template || "classic") === "split" && (
          <div className="business-card-accent" aria-hidden="true" />
        )}
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
    </article>
  );
};