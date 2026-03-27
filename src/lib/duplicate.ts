import type { Card, Email, Phone, Website } from "@prisma/client";
import type { CreateCardInput } from "@/lib/schemas";

export type CardWithContacts = Card & {
  phones: Phone[];
  emails: Email[];
  websites: Website[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findDuplicateCandidate(
  existingCards: CardWithContacts[],
  incoming: CreateCardInput
): CardWithContacts | null {
  const incomingEmails = new Set(incoming.emails.map(normalize));
  const incomingPhones = new Set(incoming.phoneNumbers.map((p) => p.replace(/\D/g, "")));

  for (const card of existingCards) {
    const emailMatch = card.emails.some((e) => incomingEmails.has(normalize(e.value)));
    const phoneMatch = card.phones.some((p) => incomingPhones.has(p.value.replace(/\D/g, "")));
    if (emailMatch || phoneMatch) {
      return card;
    }
  }

  const incomingName = normalize(incoming.name);
  const incomingCompany = normalize(incoming.company || "");

  for (const card of existingCards) {
    const nameMatch = normalize(card.name) === incomingName;
    const companyMatch = normalize(card.company || "") === incomingCompany;
    if (nameMatch && (incomingCompany ? companyMatch : true)) {
      return card;
    }
  }

  return null;
}