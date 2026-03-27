import type { CreateCardInput } from "@/lib/schemas";

export const EMPTY_CARD: CreateCardInput = {
  name: "",
  company: null,
  template: "classic",
  colorScheme: "forest",
  logoImage: null,
  jobTitle: null,
  address: null,
  notes: null,
  phoneNumbers: [],
  emails: [],
  websites: [],
  confidence: null,
  rawText: null,
  imageUrl: null
};