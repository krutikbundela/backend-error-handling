import { createHash } from "crypto";

// ===== TOKEN HASHING =====
// We store refresh tokens as hashes (not plaintext) in DB.
// If DB data leaks, attackers cannot directly reuse raw tokens.
export const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};
