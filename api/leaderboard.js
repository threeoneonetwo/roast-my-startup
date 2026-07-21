import { checkBotId } from "botid/server";
import { createHash } from "node:crypto";
import {
  getLeaderboardEntries,
  saveLeaderboardEntry,
} from "./_leaderboard-store.js";
import { verifyLeaderboardToken } from "./_leaderboard-token.js";

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method === "POST") {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic", headers: req.headers },
    }).catch(() => null);
    if (!verification)
      return res
        .status(503)
        .json({ error: "Leaderboard signup is unavailable" });
    if (verification.isBot)
      return res.status(403).json({ error: "Automated entries are not allowed" });

    const startupName = clean(req.body?.startupName, 80);
    const candidate = verifyLeaderboardToken(req.body?.token);
    if (!startupName)
      return res.status(400).json({ error: "A startup name is required" });
    if (!candidate)
      return res
        .status(400)
        .json({ error: "This leaderboard invitation expired" });

    try {
      const saved = await saveLeaderboardEntry({
        id: createHash("sha256").update(req.body.token).digest("hex"),
        startupName,
        score: candidate.score,
        pitch: clean(candidate.pitch, 180),
        roastLine: clean(candidate.roastLine, 240),
        submittedAt: Date.now(),
      });
      if (!saved)
        return res.status(503).json({ error: "The leaderboard is unavailable" });
      return res.status(201).json({ success: true });
    } catch {
      return res.status(502).json({ error: "The leaderboard caught fire" });
    }
  }

  try {
    const entries = await getLeaderboardEntries();
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).json({ entries });
  } catch {
    return res.status(200).json({ entries: [] });
  }
}
