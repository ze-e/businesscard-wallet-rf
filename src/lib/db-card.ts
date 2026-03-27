import type { Prisma } from "@prisma/client";
import type { CreateCardInput } from "@/lib/schemas";

export function toCardCreateData(userId: string, card: CreateCardInput): Prisma.CardCreateInput {
  return {
    user: { connect: { id: userId } },
    name: card.name,
    company: card.company || null,
    template: card.template || "classic",
    colorScheme: card.colorScheme || "forest",
    logoImage: card.logoImage || null,
    jobTitle: card.jobTitle || null,
    address: card.address || null,
    notes: card.notes || null,
    imageUrl: card.imageUrl || null,
    rawText: card.rawText || null,
    confidence: card.confidence ?? null,
    phones: {
      create: card.phoneNumbers.map((value) => ({ value }))
    },
    emails: {
      create: card.emails.map((value) => ({ value }))
    },
    websites: {
      create: card.websites.map((value) => ({ value }))
    }
  };
}

export function toCardUpdateData(card: CreateCardInput): Prisma.CardUpdateInput {
  return {
    name: card.name,
    company: card.company || null,
    template: card.template || "classic",
    colorScheme: card.colorScheme || "forest",
    logoImage: card.logoImage || null,
    jobTitle: card.jobTitle || null,
    address: card.address || null,
    notes: card.notes || null,
    imageUrl: card.imageUrl || null,
    rawText: card.rawText || null,
    confidence: card.confidence ?? null,
    phones: {
      deleteMany: {},
      create: card.phoneNumbers.map((value) => ({ value }))
    },
    emails: {
      deleteMany: {},
      create: card.emails.map((value) => ({ value }))
    },
    websites: {
      deleteMany: {},
      create: card.websites.map((value) => ({ value }))
    }
  };
}