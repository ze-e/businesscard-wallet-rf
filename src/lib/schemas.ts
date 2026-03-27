import { z } from "zod";

const urlOrDomainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

export const ContactArraySchema = z.array(z.string().trim().min(1)).default([]);

export const LogoBoxSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1)
  })
  .nullable()
  .optional();

export const CardRotationSchema = z
  .union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)])
  .optional()
  .nullable();

export const CardTemplateSchema = z.enum(["classic", "split", "minimal", "right-anchor", "center-focus", "text-over-logo", "text-under-logo"]);
export const CardColorSchemeSchema = z.enum(["forest", "ocean", "sunset", "slate", "modern-black", "classic-ivory", "royal-plum", "neon-cyan", "earth-clay", "mint-paper", "rose-gold", "midnight-amber", "skyline", "mono-paper"]);

export const ExtractedCardSchema = z.object({
  name: z.string().trim().min(1),
  company: z.string().trim().optional().nullable(),
  template: CardTemplateSchema.optional().default("classic"),
  colorScheme: CardColorSchemeSchema.optional().default("forest"),
  logoBox: LogoBoxSchema,
  cardRotationCW: CardRotationSchema,
  logoImage: z.string().trim().optional().nullable(),
  jobTitle: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  phoneNumbers: ContactArraySchema,
  emails: z.array(z.string().trim().email()).default([]),
  websites: z.array(z.string().trim().regex(urlOrDomainRegex, "Invalid website format")).default([]),
  confidence: z.number().min(0).max(1).optional().nullable(),
  rawText: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable()
});

export const CreateCardInputSchema = ExtractedCardSchema.pick({
  name: true,
  company: true,
  template: true,
  colorScheme: true,
  logoImage: true,
  jobTitle: true,
  address: true,
  notes: true,
  phoneNumbers: true,
  emails: true,
  websites: true,
  confidence: true,
  rawText: true,
  imageUrl: true
});

export const SaveCardSchema = z.object({
  card: CreateCardInputSchema,
  saveAsNew: z.boolean().optional().default(false)
});

export const MergeCardSchema = z.object({
  existingCardId: z.string().min(1),
  mergedCard: CreateCardInputSchema
});

export const ApiKeySchema = z.object({
  apiKey: z.string().trim().min(20)
});

export type ExtractedCard = z.infer<typeof ExtractedCardSchema>;
export type CreateCardInput = z.infer<typeof CreateCardInputSchema>;
export type SaveCardInput = z.infer<typeof SaveCardSchema>;
export type MergeCardInput = z.infer<typeof MergeCardSchema>;
