import type { CreateCardInput, ExtractedCard } from "@/lib/schemas";
import { EMPTY_CARD } from "@/lib/cards/card-defaults";

export { EMPTY_CARD };

export function mapExtractedCardToCreateCardInput(
  extractedCard: ExtractedCard,
  logoImage: string | null
): CreateCardInput {
  return {
    name: extractedCard.name,
    company: extractedCard.company || null,
    template: extractedCard.template || "classic",
    colorScheme: extractedCard.colorScheme || "forest",
    logoImage: logoImage || null,
    jobTitle: extractedCard.jobTitle || null,
    address: extractedCard.address || null,
    notes: extractedCard.notes || null,
    phoneNumbers: extractedCard.phoneNumbers || [],
    emails: extractedCard.emails || [],
    websites: extractedCard.websites || [],
    confidence: extractedCard.confidence ?? null,
    rawText: extractedCard.rawText ?? null,
    imageUrl: extractedCard.imageUrl ?? null
  };
}

export function createEmptyCard(): CreateCardInput {
  return {
    ...EMPTY_CARD,
    phoneNumbers: [],
    emails: [],
    websites: []
  };
}