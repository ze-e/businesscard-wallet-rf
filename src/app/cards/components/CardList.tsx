import { FC } from 'react';
import { CachedCard } from '@/lib/idb';
import { CardItem } from './CardItem';

interface CardListProps {
  displayedCards: CachedCard[];
  online: boolean;
  busyCardId: string | null;
  startEdit: (card: CachedCard) => void;
  startStyle: (card: CachedCard) => void;
}

export const CardList: FC<CardListProps> = ({ displayedCards, online, busyCardId, startEdit, startStyle }) => {
  return (
    <div
      className="card-deck-list"
      aria-label="Card deck list"
    >
      {displayedCards.length === 0 && <p>No cards found.</p>}
      {displayedCards.map((card) => (
        <CardItem key={card.id} card={card} online={online} busyCardId={busyCardId} startEdit={startEdit} startStyle={startStyle} />
      ))}
    </div>
  );
};