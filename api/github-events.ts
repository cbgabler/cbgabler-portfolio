import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const username =
    typeof req.query.username === "string" ? req.query.username : null;
  const perPage = clampInt(
    typeof req.query.per_page === "string" ? req.query.per_page : "10",
    1,
    100,
    10
  );

  if (!username) {
    return res.status(400).json({ error: "Missing ?username=" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res
      .status(500)
      .json({ error: "Server is missing GITHUB_TOKEN env var" });
  }

  try {
    const upstream = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/events?per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": `${username}-portfolio`,
        },
      }
    );

    if (!upstream.ok) {
      const body = await upstream.text();
      return res
        .status(upstream.status)
        .json({ error: `GitHub API ${upstream.status}`, detail: body });
    }

    const data = await upstream.json();

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Upstream fetch failed", detail: (err as Error).message });
  }
}

function clampInt(
  raw: string,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
