"use client";

import type { DuplicateExistingCard } from "@/lib/cards/card-types";

type ExistingCardSummaryProps = {
  existingCard: DuplicateExistingCard;
};

export function ExistingCardSummary({ existingCard }: ExistingCardSummaryProps) {
  return (
    <div>
      <h3>Existing</h3>
      <p>
        <strong>{existingCard.name}</strong>
      </p>
      <p>{existingCard.company}</p>

      {existingCard.logoImage && (
        <img
          src={existingCard.logoImage}
          alt="Existing logo"
          style={{
            maxWidth: 180,
            maxHeight: 100,
            objectFit: "contain",
            border: "1px solid #d6dfd8",
            borderRadius: 8,
            background: "#fff"
          }}
        />
      )}

      <p>{existingCard.phones.map((item) => item.value).join(", ")}</p>
      <p>{existingCard.emails.map((item) => item.value).join(", ")}</p>
      <p>{existingCard.websites.map((item) => item.value).join(", ")}</p>
    </div>
  );
}