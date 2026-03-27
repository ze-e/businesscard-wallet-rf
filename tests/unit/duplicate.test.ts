import { describe, expect, it } from "vitest";
import { findDuplicateCandidate, type CardWithContacts } from "@/lib/duplicate";

const card = (overrides: Partial<CardWithContacts>): CardWithContacts => ({
  id: "1",
  userId: "demo",
  name: "Jane Doe",
  company: "Acme",
  jobTitle: null,
  address: null,
  notes: null,
  imageUrl: null,
  rawText: null,
  confidence: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  phones: [],
  emails: [],
  websites: [],
  ...overrides
});

describe("findDuplicateCandidate", () => {
  it("matches exact email", () => {
    const existing = [card({ emails: [{ id: "e1", cardId: "1", value: "jane@acme.com", createdAt: new Date() }] })];

    const duplicate = findDuplicateCandidate(existing, {
      name: "Random",
      company: null,
      jobTitle: null,
      address: null,
      notes: null,
      phoneNumbers: [],
      emails: ["jane@acme.com"],
      websites: [],
      confidence: null,
      rawText: null,
      imageUrl: null
    });

    expect(duplicate?.id).toBe("1");
  });
});