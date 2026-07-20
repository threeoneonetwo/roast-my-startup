const LEADERBOARD_KEY = "roast-my-startup:leaderboard:latest";

function credentials() {
  return {
    url:
      process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
    token:
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN ||
      "",
  };
}

async function command(args) {
  const { url, token } = credentials();
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Leaderboard storage request failed");
  }
  return payload.result;
}

export async function saveLeaderboardEntry(entry) {
  if (!credentials().url || !credentials().token) return false;
  const member = JSON.stringify(entry);
  await command(["ZADD", LEADERBOARD_KEY, entry.submittedAt, member]);
  await command(["ZREMRANGEBYRANK", LEADERBOARD_KEY, 0, -501]);
  return true;
}

export async function getLeaderboardEntries() {
  if (!credentials().url || !credentials().token) return [];
  const members = await command(["ZREVRANGE", LEADERBOARD_KEY, 0, 49]);
  return (Array.isArray(members) ? members : [])
    .flatMap((member) => {
      try {
        return [JSON.parse(member)];
      } catch {
        return [];
      }
    })
    .sort((a, b) => a.score - b.score || b.submittedAt - a.submittedAt)
    .slice(0, 10);
}
