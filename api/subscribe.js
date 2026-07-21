import { checkBotId } from "botid/server";
import * as Sentry from "@sentry/node";
import { saveContact } from "./_contact-store.js";

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

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return res
      .status(503)
      .json({ error: "Contact signup is not configured yet." });
  }

  const email = clean(req.body?.email, 320).toLowerCase();
  const fullName = clean(req.body?.fullName, 120);

  if (!validEmail(email)) {
    return res
      .status(400)
      .json({ error: "A valid email address is required." });
  }
  if (!fullName) {
    return res.status(400).json({ error: "A full name is required." });
  }

  try {
    const saved = await saveContact({ email, fullName });
    if (!saved)
      return res
        .status(503)
        .json({ error: "Contact signup is not configured yet." });
    return res.status(200).json({ success: true });
  } catch (error) {
    Sentry.captureException(error, { tags: { area: "contact_database" } });
    await Sentry.flush(2000);
    return res
      .status(502)
      .json({ error: "Contact details could not be saved." });
  }
}
