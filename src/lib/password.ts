import crypto from "crypto";

const HASH_ALGO = "scrypt";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${HASH_ALGO}:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algo, salt, expectedHex] = storedHash.split(":");
  if (algo !== HASH_ALGO || !salt || !expectedHex) {
    return false;
  }

  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}