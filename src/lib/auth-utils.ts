import CryptoJS from "crypto-js";

/**
 * Hashes a plaintext password using SHA-256 with a salt
 */
export function hashPassword(password: string): string {
  const salt = process.env.AUTH_SECRET || "medchain-secret-salt-2026";
  return CryptoJS.SHA256(password + salt).toString(CryptoJS.enc.Hex);
}

/**
 * Verifies if a plaintext password matches the stored hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Generates a random alphanumeric chunk
 */
function randomChunk(len: number): string {
  const chars = "0123456789ABCDEF";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a Patient Global Medical Identity (HID)
 * Format: MED-4F2A-9C1B-E37D
 */
export function generatePatientHID(): string {
  return `MED-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}`;
}

/**
 * Generates an Institutional Hospital ID
 * Format: HOSP-APL-7B3C-2F9A
 */
export function generateHospitalId(name?: string): string {
  const code = (name || "HOSP").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "HOS";
  return `HOSP-${code}-${randomChunk(4)}-${randomChunk(4)}`;
}
