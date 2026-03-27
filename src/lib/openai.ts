import { ExtractedCardSchema, type ExtractedCard } from "@/lib/schemas";

type UnknownRecord = Record<string, unknown>;

function parseExtractionPayload(payload: UnknownRecord): ExtractedCard {
  const outputText = payload.output_text;
  if (typeof outputText === "string" && outputText.trim().length > 0) {
    return ExtractedCardSchema.parse(JSON.parse(outputText));
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    const message = item as UnknownRecord;
    const content = Array.isArray(message.content) ? message.content : [];

    for (const part of content) {
      const contentPart = part as UnknownRecord;

      if (typeof contentPart.text === "string" && contentPart.text.trim().length > 0) {
        try {
          return ExtractedCardSchema.parse(JSON.parse(contentPart.text));
        } catch {
          // keep scanning
        }
      }

      if (contentPart.parsed && typeof contentPart.parsed === "object") {
        return ExtractedCardSchema.parse(contentPart.parsed);
      }

      if (contentPart.json && typeof contentPart.json === "object") {
        return ExtractedCardSchema.parse(contentPart.json);
      }
    }
  }

  throw new Error(
    `OpenAI response did not include parseable structured output. Top-level keys: ${Object.keys(payload).join(", ")}`
  );
}

export async function extractCardWithOpenAI(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<ExtractedCard> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Extract fields from a business card image. Return strict JSON with keys: name, company, logoBox, cardRotationCW, jobTitle, address, notes, phoneNumbers, emails, websites, confidence, rawText. cardRotationCW is degrees clockwise needed to make the card upright and must be exactly 0, 90, 180, or 270. For logoBox: detect only the primary brand logo mark/text, tightly cropped, excluding surrounding card area, and suitable for centering on a white or solid background. Return normalized x,y,width,height in range 0..1, where x and y are the TOP-LEFT corner in the upright rotated image after applying cardRotationCW. If no clear logo, return null for logoBox. Avoid including table/background textures or non-logo edges in the box. name is required if detectable. Use empty arrays for missing lists and null for missing scalar optional fields. confidence must be 0-1."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "business_card",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "company",
              "logoBox",
              "cardRotationCW",
              "jobTitle",
              "address",
              "notes",
              "phoneNumbers",
              "emails",
              "websites",
              "confidence",
              "rawText"
            ],
            properties: {
              name: { type: "string" },
              company: { type: ["string", "null"] },
              logoBox: {
                type: ["object", "null"],
                additionalProperties: false,
                required: ["x", "y", "width", "height"],
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" }
                }
              },
              cardRotationCW: {
                type: "integer",
                enum: [0, 90, 180, 270]
              },
              jobTitle: { type: ["string", "null"] },
              address: { type: ["string", "null"] },
              notes: { type: ["string", "null"] },
              phoneNumbers: { type: "array", items: { type: "string" } },
              emails: { type: "array", items: { type: "string" } },
              websites: { type: "array", items: { type: "string" } },
              confidence: { type: ["number", "null"] },
              rawText: { type: ["string", "null"] }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI extraction failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as UnknownRecord;
  return parseExtractionPayload(payload);
}
