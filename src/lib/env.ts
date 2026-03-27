const REQUIRED_ENV_VARS = ["DATABASE_URL", "APP_ENCRYPTION_KEY"] as const;

for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
}

if (!/^[0-9a-fA-F]{64}$/.test(process.env.APP_ENCRYPTION_KEY || "")) {
  throw new Error("APP_ENCRYPTION_KEY must be a 64-character hex string.");
}

export const env = {
  databaseUrl: process.env.DATABASE_URL as string,
  appEncryptionKey: process.env.APP_ENCRYPTION_KEY as string
};