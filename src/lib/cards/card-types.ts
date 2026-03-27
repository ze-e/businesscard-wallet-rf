import type { CreateCardInput } from "@/lib/schemas";

export type DuplicateExistingCard = {
  id: string;
  name: string;
  company: string | null;
  logoImage: string | null;
  phones: { value: string }[];
  emails: { value: string }[];
  websites: { value: string }[];
};

export type DuplicateResponse = {
  duplicate: true;
  existingCard: DuplicateExistingCard;
  extractedCard: CreateCardInput;
  message: string;
};