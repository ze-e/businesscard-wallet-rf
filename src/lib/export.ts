import type { Card, Email, Phone, Website } from "@prisma/client";

type CardRecord = Card & { phones: Phone[]; emails: Email[]; websites: Website[] };

function esc(value: string): string {
  const v = value ?? "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function toCsv(cards: CardRecord[]): string {
  const headers = [
    "id",
    "name",
    "company",
    "template",
    "colorScheme",
    "hasLogoImage",
    "jobTitle",
    "address",
    "phones",
    "emails",
    "websites",
    "notes",
    "createdAt"
  ];

  const rows = cards.map((card) =>
    [
      card.id,
      card.name,
      card.company || "",
      card.template,
      card.colorScheme,
      card.logoImage ? "true" : "false",
      card.jobTitle || "",
      card.address || "",
      card.phones.map((p) => p.value).join(" | "),
      card.emails.map((e) => e.value).join(" | "),
      card.websites.map((w) => w.value).join(" | "),
      card.notes || "",
      card.createdAt.toISOString()
    ]
      .map(esc)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}