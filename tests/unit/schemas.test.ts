import { describe, expect, it } from "vitest";
import { CreateCardInputSchema } from "@/lib/schemas";

describe("CreateCardInputSchema", () => {
  it("requires name", () => {
    const parsed = CreateCardInputSchema.safeParse({
      name: "",
      phoneNumbers: [],
      emails: [],
      websites: []
    });

    expect(parsed.success).toBe(false);
  });

  it("allows optional fields to be omitted", () => {
    const parsed = CreateCardInputSchema.parse({
      name: "Ada Lovelace",
      phoneNumbers: [],
      emails: [],
      websites: []
    });

    expect(parsed.name).toBe("Ada Lovelace");
    expect(parsed.company).toBeUndefined();
  });
});