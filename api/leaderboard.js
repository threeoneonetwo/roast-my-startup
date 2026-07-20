import { getLeaderboardEntries } from "./_leaderboard-store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
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
