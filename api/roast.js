import { checkBotId } from "botid/server";
import * as Sentry from "@sentry/node";
import { randomUUID } from "node:crypto";
import { saveLeaderboardEntry } from "./_leaderboard-store.js";

const MODEL = "gpt-5.6-sol";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const SECTION_COLORS = ["#FFFF00", "#39FF14", "#FF10F0"];

export const maxDuration = 90;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  beforeSend(event) {
    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
      delete event.request.headers;
    }
    delete event.user;
    return event;
  },
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "score",
    "greeting",
    "verdictTitle",
    "verdict",
    "roastBlocks",
    "localRealityTitle",
    "localReality",
    "finalLine",
    "sources",
  ],
  properties: {
    score: {
      type: "integer",
      description: "A brutally honest viability score from 0 to 100.",
    },
    greeting: {
      type: "string",
      description:
        "A short, funny, rude opening line personalized to the submission.",
    },
    verdictTitle: {
      type: "string",
      description:
        "A funny, submission-specific heading for the opening diagnosis, including one fitting emoji.",
    },
    verdict: {
      type: "string",
      description:
        "A sharp opening roast that identifies the most mockable delusion while still revealing a useful truth.",
    },
    roastBlocks: {
      type: "array",
      description:
        "Between four and eight personalized roast sections. Choose the number, subjects, order, titles, comedic framing, and pacing that best fit this submission; do not follow a fixed template.",
      minItems: 4,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: {
          title: {
            type: "string",
            description:
              "A funny, original, submission-specific heading, including one fitting emoji.",
          },
          body: {
            type: "string",
            description:
              "A proper personalized roast with jokes, comparisons, callbacks, and at least one specific useful insight grounded in the submission or researched evidence.",
          },
        },
      },
    },
    localRealityTitle: {
      type: "string",
      description:
        "A funny heading for a non-stereotyping roast of the stated location or market context, including one fitting emoji.",
    },
    localReality: {
      type: "string",
      description:
        "A funny, useful, non-stereotyping roast connected to the stated location and market context.",
    },
    finalLine: {
      type: "string",
      description:
        "A two to four sentence personal conclusion addressed directly to the founder by name. Make it the meanest and funniest part of the roast, use callbacks to their background and claims, and land on the uncomfortable truth they are avoiding.",
    },
    sources: {
      type: "array",
      description:
        "Sources actually consulted during web research. Include only sources that support factual claims in the roast.",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "url"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
};

const systemPrompt = `You are the editor of Roast My Startup: the voice of a burned-out strategy consultant who has reviewed thousands of mediocre business plans and has no patience left. You are sarcastic, tired, cutting, specific, and annoyingly right. Do not claim to be a real person, a former McKinsey partner, or to possess firsthand experience you do not have.

Your job is to perform a genuinely funny, ruthless, personalized roast that also leaves the founder with useful truths about the startup. This must feel like a comedy roast written specifically for this person and idea—not a consulting report wearing a fake moustache. Do not compliment the idea, offer a praise sandwich, or hunt for a positive angle.

PRIORITY ORDER
1. Personalization: use the actual idea, claims, founder background, experience, and location supplied.
2. Comedy: produce sharp jokes, absurd comparisons, callbacks, misdirection, and punchlines—not merely stern business language.
3. Truth: make the jokes expose real contradictions, weak assumptions, missing proof, founder blind spots, or ridiculous positioning.
4. Usefulness: hide one concise, genuinely useful insight inside each section; never let the explanation overpower the joke.
5. Evidence: support factual market claims with research and label unknowns honestly.

Roast the founder's stated choices, confidence, professional self-positioning, experience, and logic when relevant. Never attack protected traits, appearance, private contact details, or vulnerabilities unrelated to the startup. Do not rely on generic founder stereotypes or random humiliation.

PERSONAL INTENSITY
- Address the founder directly by their supplied name in the opening and the final conclusion.
- Treat their professional background as roast material. Find the funniest contradiction between what they claim to know and what their startup reveals they apparently do not know.
- Roast their ego, judgment, positioning, decision making, performative confidence, LinkedIn style self mythology, and the excuses embedded in their submission.
- Make jokes about the exact words, credentials, location claims, experience, and founder persona they voluntarily supplied. Build callbacks so the roast feels written for one person rather than generated for a category.
- Prefer a precise personal punchline over sterile business vocabulary. If a paragraph could apply to ten other founders, rewrite it until it could embarrass only this one.
- Be savage and direct without using slurs, attacking inherent identity, appearance, trauma, health, family, or unrelated private vulnerabilities.

RESEARCH AND TRUTH RULES
- Use web search before making market-size, failure-rate, competitor, funding, pricing, or case-study claims.
- Never invent statistics, reports, competitors, customer behavior, founder history, traction, or consulting experience.
- Cite factual claims inline with bracketed source numbers such as [1], matching the sources array. Every number and named market claim must have a source.
- Prefer primary sources, company filings/pages, credible research organizations, and established business publications. Do not name-drop Gartner, McKinsey, CB Insights, Crunchbase, Quibi, WeWork, Theranos, or any graveyard company unless it is genuinely relevant and supported.
- If trustworthy public data is unavailable, say the submission supplied no evidence. Do not fill the gap with a plausible-sounding number.
- Treat missing customer validation as missing evidence, not proof that no interviews occurred.
- Never expose or mention private contact details.

ROAST RULES
- Do not use em dashes, en dashes, or hyphens in any generated heading or paragraph. Use periods, commas, colons, or separate words instead.
- Find the core delusion: the inconsistency the founder is most likely refusing to confront.
- Be properly rude, playful, blunt, sarcastic, surprising, and specific. It should be entertaining enough that the founder wants to share it even while reconsidering their life choices.
- Vary the comedic device and rhythm. You may frame sections as an obituary, courtroom charge, medical diagnosis, investor group chat, intervention, product review, nature documentary, performance appraisal, or another format inspired by the submission.
- Create running jokes and callbacks from distinctive submission details. Do not reuse the same opening, headings, section order, metaphors, or punchlines for every founder.
- Choose only the most roastable weaknesses. Possible subjects include the customer, problem, positioning, competition, market size, monetization, unit economics, distribution, validation, founder-market fit, operational complexity, defensibility, timing, and the founder's background—but this is a menu, not a checklist.
- Explain why an alleged unfair advantage is luck, access, or wishful thinking when that conclusion follows from the submission.
- Each section must contain at least one substantive insight, but weave it into the comedy naturally. Do not mechanically repeat assumption/evidence/consequence/recommendation labels.
- When inputs are missing, identify the exact missing metric and explain why the business cannot be judged without it. Do not pretend missing data proves failure.
- Use simple back-of-the-envelope math when the submission provides enough inputs. Show assumptions instead of disguising guesses as facts.
- Do not turn the roast into a friendly step-by-step mentorship plan. Useful feedback should arrive as part of the punch, not as a tidy consultant checklist.
- Phrases such as "Look, here's the thing…" and "Let's be honest…" are welcome when they sharpen the delivery.

OUTPUT STRUCTURE
1. verdictTitle and verdict: an original opening diagnosis based on the submission's most roastable delusion.
2. Four to eight roastBlocks chosen and ordered specifically for this submission. Invent original titles; never force the same standard business sections when they do not fit.
3. localRealityTitle and localReality: a funny location-specific market reality, using sourced facts for factual claims and avoiding stereotypes.
4. finalLine: a two to four sentence personal conclusion addressed to the founder by name. This is the knockout punch. Call back to their background, their most delusional claim, and the contradiction that best exposes their judgment. Do not give encouragement or a redemption arc.

The finished result must be approximately 80% savage entertainment and 20% useful truth. Comedy, pacing, personality, and punchlines should dominate; the useful diagnosis should be concise and smuggled inside the roast rather than delivered as a report. Make it feel spontaneous and tailored, never modular or templated. Make it hurt because it is funny and recognizably true—not because it is fabricated.`;

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function withoutDashes(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/[—–]/g, ". ")
    .replace(/\s+-\s+/g, ". ")
    .replace(/([A-Za-z])[-‐]([A-Za-z])/g, "$1 $2")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 to $2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let verification;
  try {
    verification = await checkBotId({
      advancedOptions: {
        checkLevel: "basic",
        headers: req.headers,
      },
    });
  } catch (error) {
    Sentry.captureException(error, { tags: { area: "botid_verification" } });
    await Sentry.flush(2000);
    return res
      .status(503)
      .json({ error: "Bot protection is unavailable. Try again in a moment." });
  }
  if (verification.isBot) {
    return res
      .status(403)
      .json({ error: "Automated roast requests are not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json({ error: "The roast engine is not configured yet." });
  }

  const submission = {
    idea: clean(req.body?.idea, 6000),
    founderBackground: clean(req.body?.founderBackground, 4000),
    fullName: clean(req.body?.fullName, 120),
    lastName: clean(req.body?.last, 80),
    ageRange: clean(req.body?.age, 30),
    experience: clean(req.body?.experience, 80),
    location: clean(req.body?.loc, 160),
    leaderboardOptIn: req.body?.leaderboardOptIn === true,
    startupName: clean(req.body?.startupName, 80),
  };

  if (
    !submission.idea ||
    !submission.founderBackground ||
    !submission.fullName ||
    !submission.location ||
    (submission.leaderboardOptIn && !submission.startupName)
  ) {
    return res
      .status(400)
      .json({ error: "The required founder and startup details are missing." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 85000);

  try {
    const openAIResponse = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        reasoning: { effort: "low" },
        max_output_tokens: 6000,
        instructions: systemPrompt,
        input: `Roast this startup based only on the following founder submission:\n${JSON.stringify(submission, null, 2)}`,
        tools: [{ type: "web_search", search_context_size: "low" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        text: {
          verbosity: "medium",
          format: {
            type: "json_schema",
            name: "startup_roast",
            strict: true,
            schema: outputSchema,
          },
        },
      }),
    });

    const payload = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error(
        "OpenAI request failed",
        openAIResponse.status,
        payload?.error?.type,
        payload?.error?.message,
      );
      Sentry.captureException(new Error("OpenAI roast request failed."), {
        tags: { area: "openai_request", status: String(openAIResponse.status) },
        extra: { errorType: payload?.error?.type || "unknown" },
      });
      await Sentry.flush(2000);
      return res.status(502).json({
        error: "The roast engine refused to clock in. Try again in a moment.",
      });
    }

    const text = payload.output
      ?.flatMap((item) => item.content || [])
      .find((content) => content.type === "output_text")?.text;
    if (!text) throw new Error("OpenAI returned no structured roast.");
    const generated = JSON.parse(text);
    const blocks = Array.isArray(generated.roastBlocks)
      ? generated.roastBlocks.slice(0, 8)
      : [];
    if (!blocks.length) throw new Error("OpenAI returned no roast blocks.");
    const consultedUrls = new Set(
      payload.output?.flatMap((item) =>
        item.type === "web_search_call"
          ? (item.action?.sources || []).map((source) => source.url)
          : [],
      ) || [],
    );
    const sources = Array.isArray(generated.sources)
      ? generated.sources
          .flatMap((source) => {
            try {
              const url = new URL(source.url);
              if (!["http:", "https:"].includes(url.protocol)) return [];
              if (consultedUrls.size && !consultedUrls.has(url.toString()))
                return [];
              return [
                {
                  title: clean(source.title, 180) || url.hostname,
                  url: url.toString(),
                },
              ];
            } catch {
              return [];
            }
          })
          .slice(0, 8)
      : [];

    const first = submission.fullName || "founder";
    const roast = {
      first,
      loc: submission.location || "your undisclosed bunker",
      score: Math.max(
        0,
        Math.min(100, Math.round(Number(generated.score) || 0)),
      ),
      greet: withoutDashes(generated.greeting),
      verdictTitle: withoutDashes(generated.verdictTitle),
      verdict: withoutDashes(generated.verdict),
      sections: blocks.map((block, index) => [
        withoutDashes(block.title),
        SECTION_COLORS[index % SECTION_COLORS.length],
        withoutDashes(block.body),
      ]),
      localTitle: withoutDashes(generated.localRealityTitle),
      local: withoutDashes(generated.localReality),
      final: withoutDashes(generated.finalLine),
      sources,
    };

    if (submission.leaderboardOptIn && submission.startupName) {
      try {
        await saveLeaderboardEntry({
          id: randomUUID(),
          startupName: submission.startupName,
          score: roast.score,
          pitch: clean(submission.idea, 180),
          roastLine: clean(roast.final || roast.verdict, 240),
          submittedAt: Date.now(),
        });
      } catch (error) {
        Sentry.captureException(error, { tags: { area: "leaderboard_store" } });
      }
    }

    return res.status(200).json({
      roast,
      model: MODEL,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    console.error(
      "Roast generation failed",
      timedOut ? "timeout" : error?.name,
    );
    if (timedOut) {
      Sentry.captureMessage("Roast generation timed out", {
        level: "warning",
        tags: { area: "roast_generation", timedOut: "true" },
      });
    } else {
      Sentry.captureException(error, {
        tags: { area: "roast_generation", timedOut: "false" },
      });
    }
    await Sentry.flush(2000);
    return res.status(timedOut ? 504 : 500).json({
      error: timedOut
        ? "The roast took too long. Try again."
        : "The roast caught fire. Try again.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
