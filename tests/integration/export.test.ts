import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/export";

describe("export csv", () => {
  it("renders headers", () => {
    const csv = toCsv([]);
    expect(csv.startsWith("id,name,company")).toBe(true);
  });
});