import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

function secret() {
  return process.env.LEADERBOARD_SECRET || process.env.OPENAI_API_KEY || "";
}

function signature(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createLeaderboardToken({ score, pitch, roastLine }) {
  if (!secret()) return "";
  const payload = Buffer.from(
    JSON.stringify({
      score,
      pitch,
      roastLine,
      expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    }),
  ).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyLeaderboardToken(token) {
  if (!secret() || typeof token !== "string" || token.length > 4096) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!decoded.expiresAt || decoded.expiresAt < Date.now()) return null;
    if (
      !Number.isInteger(decoded.score) ||
      decoded.score < 0 ||
      decoded.score > 100 ||
      typeof decoded.pitch !== "string" ||
      typeof decoded.roastLine !== "string"
    )
      return null;
    return decoded;
  } catch {
    return null;
  }
}
