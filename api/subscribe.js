import { checkBotId } from "botid/server";
import * as Sentry from "@sentry/node";

const LOOPS_URL = "https://app.loops.so/api/v1/contacts/update";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  sendDefaultPii: false,
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

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanLinkedIn(value) {
  const input = clean(value, 500);
  if (!input) return "";
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      (hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com"))
    )
      return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let verification;
  try {
    verification = await checkBotId({
      advancedOptions: { checkLevel: "basic", headers: req.headers },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { area: "lead_botid_verification" },
    });
    await Sentry.flush(2000);
    return res
      .status(503)
      .json({ error: "Contact signup is temporarily unavailable." });
  }
  if (verification.isBot) {
    return res
      .status(403)
      .json({ error: "Automated contact signups are not allowed." });
  }

  if (!process.env.LOOPS_API_KEY) {
    return res
      .status(503)
      .json({ error: "Contact signup is not configured yet." });
  }

  const email = clean(req.body?.email, 320).toLowerCase();
  const fullName = clean(req.body?.fullName, 120);
  const linkedInInput = clean(req.body?.linkedin, 500);
  const linkedin = cleanLinkedIn(linkedInInput);

  if (!validEmail(email)) {
    return res
      .status(400)
      .json({ error: "A valid email address is required." });
  }
  if (linkedInInput && !linkedin) {
    return res
      .status(400)
      .json({ error: "Enter a valid HTTPS LinkedIn profile URL." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const collectedAt = new Date().toISOString();
    const response = await fetch(LOOPS_URL, {
      method: "PUT",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName: fullName,
        source: "Roast My Startup form",
        subscribed: true,
        userGroup: "Roast My Startup founders",
        notes: [
          `Marketing consent recorded on form submission ${collectedAt}`,
          linkedin ? `LinkedIn profile: ${linkedin}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      Sentry.captureException(new Error("Loops contact update failed."), {
        tags: { area: "loops_contact", status: String(response.status) },
      });
      await Sentry.flush(2000);
      return res
        .status(502)
        .json({ error: "Contact details could not be saved." });
    }

    return res.status(200).json({ success: payload.success === true });
  } catch (error) {
    Sentry.captureException(error, { tags: { area: "loops_contact" } });
    await Sentry.flush(2000);
    return res
      .status(502)
      .json({ error: "Contact details could not be saved." });
  } finally {
    clearTimeout(timeout);
  }
}
