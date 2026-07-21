import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { initBotId } from "botid/client/core";
import { toJpeg } from "html-to-image";
import { trackProductEvent } from "./product-analytics";
import Sentry from "./sentry";
import LegalPage from "./legal";
import "./styles.css";
import "./footer.css";
import "./comic-fix.css";
import "./header.css";
import "./share.css";
import "./ai.css";
import "./reviews.css";
import "./lead-capture.css";
import "./leaderboard.css";

initBotId({
  protect: [
    {
      path: "/api/roast",
      method: "POST",
      advancedOptions: { checkLevel: "basic" },
    },
    {
      path: "/api/subscribe",
      method: "POST",
      advancedOptions: { checkLevel: "basic" },
    },
  ],
});

const roasts = [
  [
    "a 'Web3' visionary",
    "It's Uber but for goldfish, on the blockchain",
    "You built a database and called it a revolution. The goldfish deserve better.",
    "nobody asked 🐟",
    "#39FF14",
    "🤡",
  ],
  [
    "a former consultant",
    "Smart socks that track your vibe",
    "Your TAM is people who hate their own ankles. That is a support group, not a market.",
    "synergy overdose 🧦",
    "#FFFF00",
    "💀",
  ],
  [
    "a 'serial' founder",
    "Netflix but you pay us to watch our ads",
    "You reinvented cable TV and expect a Series A. Bold. Wrong, but bold.",
    "delusional confidence 📺",
    "#FF10F0",
    "🔥",
  ],
  [
    "a Stanford dropout",
    "An app that reminds you to open other apps",
    "You've invented a notification with extra steps and a burn rate. Congrats, you're a nuisance with a runway.",
    "feature, not a company 📱",
    "#39FF14",
    "☠️",
  ],
];
const testimonials = [
  [
    "I came in with a $50M valuation and left with a therapist's number. 10/10, genuinely.",
    "Chad Disruptor",
    "Former CEO, now a barista",
    "🤵",
    "#FFFF00",
  ],
  [
    "It called my pitch 'a group text I sent by accident.' Rude. Also correct. Also I pivoted.",
    "Priya M.",
    "Founder → Consultant",
    "👩‍💻",
    "#39FF14",
  ],
  [
    "My cofounder and I both got roasted separately and it said the same thing. We broke up.",
    "Devon and 'former Devon'",
    "No longer a team",
    "💔",
    "#FF10F0",
  ],
  [
    "Brutal. Unhinged. Weirdly the best product feedback I've paid $0 for. My VC agreed.",
    "Marcus T.",
    "Serial 'entrepreneur'",
    "🕶️",
    "#39FF14",
  ],
  [
    "It found the flaw my entire seed round was too polite to mention. I owe it my life savings (what's left).",
    "Aisha K.",
    "Reformed idea enthusiast",
    "🧕",
    "#FFFF00",
  ],
  [
    "I laughed, I cringed, and found one useful truth hiding under the insults. Five stars, deleting LinkedIn.",
    "Tyler 'Growth' B.",
    "Thought leader (former)",
    "🧢",
    "#FF10F0",
  ],
];
const demoLeaderboard = [
  [
    "AI That Summarizes AI Summaries",
    3,
    "A productivity tool for avoiding the productivity tool",
  ],
  [
    "Uber for Houseplants",
    5,
    "On demand emotional support for neglected succulents",
  ],
  [
    "Blockchain Dog Walking",
    7,
    "Every walk is verified except the customer demand",
  ],
  [
    "LinkedIn for Introverts",
    9,
    "Professional networking without the networking",
  ],
  [
    "Subscription Tap Water",
    11,
    "Water as a service because faucets lacked recurring revenue",
  ],
  [
    "Dating App for Cofounders",
    13,
    "Tinder but the breakup includes an intellectual property dispute",
  ],
];

function dailyDemoLeaderboard() {
  const day = Math.floor(Date.now() / 86400000);
  const offset = day % demoLeaderboard.length;
  return [...demoLeaderboard.slice(offset), ...demoLeaderboard.slice(0, offset)]
    .slice(0, 5)
    .sort((a, b) => a[1] - b[1])
    .map(([startupName, score, roastLine], index) => ({
      id: `demo-${day}-${index}`,
      startupName,
      score,
      roastLine,
      demo: true,
    }));
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const condense = (value, limit = 155) => {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit - 1).trim()}…` : text;
};
function Marquee({ children, red = false }) {
  return (
    <div className={"marquee " + (red ? "red" : "")}>
      <div>
        {children} &nbsp; {children}
      </div>
    </div>
  );
}
function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__brand" href="/">
        ROAST<span>.</span>MY<span>.</span>STARTUP
      </a>
    </header>
  );
}
function savedRoast() {
  try {
    return window.location.pathname === "/roast"
      ? JSON.parse(sessionStorage.getItem("roast-result"))
      : null;
  } catch {
    return null;
  }
}
function App() {
  const [form, setForm] = useState({
    idea: "",
    founderBackground: "",
    fullName: "",
    age: "",
    experience: "",
    loc: "",
    email: "",
    linkedin: "",
    leaderboardOptIn: false,
    startupName: "",
  });
  const [result, setResult] = useState(savedRoast);
  const [route, setRoute] = useState(window.location.pathname);
  const [hover, setHover] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [formStarted, setFormStarted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [signupStatus, setSignupStatus] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastProgress, setRoastProgress] = useState(0);
  const [roastError, setRoastError] = useState("");
  const [leaderboard, setLeaderboard] = useState(dailyDemoLeaderboard);
  const [leaderboardIsDemo, setLeaderboardIsDemo] = useState(true);
  const submitted = useRef(false);
  const shareCardRef = useRef(null);
  const shareImageRef = useRef(null);
  const onChange = (e) => {
    startForm();
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };
  const startForm = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackProductEvent("form_started");
    }
  };
  useEffect(() => {
    const trackAbandon = () => {
      if (formStarted && !submitted.current)
        trackProductEvent("form_abandoned");
    };
    window.addEventListener("pagehide", trackAbandon);
    return () => window.removeEventListener("pagehide", trackAbandon);
  }, [formStarted]);
  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    if (route !== "/roast" || !result) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await document.fonts?.ready;
        if (!shareCardRef.current) return;
        const dataUrl = await toJpeg(shareCardRef.current, {
          backgroundColor: "#000",
          cacheBust: true,
          pixelRatio: 1,
          quality: 0.9,
        });
        if (!cancelled) shareImageRef.current = dataUrl;
      } catch {
        shareImageRef.current = null;
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [result, route]);
  useEffect(() => {
    if (!isRoasting) return undefined;
    const timer = window.setInterval(() => {
      setRoastProgress((progress) => {
        if (progress < 35) return Math.min(35, progress + 6);
        if (progress < 65) return Math.min(65, progress + 3);
        if (progress < 85) return Math.min(85, progress + 2);
        return Math.min(96, progress + 1);
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [isRoasting]);
  useEffect(() => {
    const titles = {
      "/roast": "Your Full Autopsy | Roast My Startup",
      "/privacy": "Privacy Policy | Roast My Startup",
      "/terms": "Terms of Use | Roast My Startup",
    };
    document.title =
      titles[route] || "Roast My Startup | Honest Startup Idea Feedback";
    const robots = document.querySelector('meta[name="robots"]');
    if (robots)
      robots.content =
        route === "/roast" ? "noindex, nofollow" : "index, follow";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical)
      canonical.href =
        route === "/"
          ? "https://roastmystartupnow.vercel.app/"
          : `https://roastmystartupnow.vercel.app${route}`;
  }, [route]);
  useEffect(() => {
    let active = true;
    fetch("/api/leaderboard")
      .then((response) => (response.ok ? response.json() : { entries: [] }))
      .then((data) => {
        if (active && Array.isArray(data.entries) && data.entries.length) {
          setLeaderboard(data.entries);
          setLeaderboardIsDemo(false);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const saveContact = async () => {
    if (!form.email) return;
    setSignupStatus("📬 Saving your optional contact details…");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          linkedin: form.linkedin,
          fullName: form.fullName,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Contact signup failed.");
      setSignupStatus("📬 Your contact details were saved.");
      trackProductEvent("lead_capture_succeeded");
    } catch {
      setSignupStatus(
        "⚠️ Your roast survived, but your contact details were not saved.",
      );
      trackProductEvent("lead_capture_failed");
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    submitted.current = true;
    setIsRoasting(true);
    setRoastProgress(4);
    setRoastError("");
    const ideaLength = form.idea.trim().split(/\s+/).filter(Boolean).length;
    const backgroundLength = form.founderBackground
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    trackProductEvent("roast_submitted", {
      idea_length:
        ideaLength < 20 ? "short" : ideaLength < 80 ? "medium" : "long",
      founder_background_length:
        backgroundLength < 20
          ? "short"
          : backgroundLength < 80
            ? "medium"
            : "long",
    });
    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idea: form.idea,
          founderBackground: form.founderBackground,
          fullName: form.fullName,
          age: form.age,
          experience: form.experience,
          loc: form.loc,
          leaderboardOptIn: form.leaderboardOptIn,
          startupName: form.startupName,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? "You have roasted enough startups for now. Try again in ten minutes."
            : data.error || "The roast failed to generate.",
        );
      trackProductEvent("roast_generated", { model: data.model });
      trackProductEvent("roast_viewed");
      setRoastProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      setResult(data.roast);
      sessionStorage.setItem("roast-result", JSON.stringify(data.roast));
      window.history.pushState({}, "", "/roast");
      setRoute("/roast");
      void saveContact();
      setConfetti(
        Array.from({ length: 90 }, (_, i) => ({
          id: Date.now() + i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          emoji:
            Math.random() < 0.35
              ? pick(["🔥", "💀", "🤡", "☠️", "🚫", "📉"])
              : "",
        })),
      );
      window.scrollTo(0, 0);
      setTimeout(() => setConfetti([]), 4300);
    } catch (error) {
      submitted.current = false;
      setRoastProgress(0);
      setRoastError(error.message || "The roast caught fire. Try again.");
      trackProductEvent("roast_generation_failed");
      if (!error.message?.includes("took too long")) {
        Sentry.captureException(error, { tags: { area: "roast_frontend" } });
      }
    } finally {
      setIsRoasting(false);
    }
  };
  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setShareStatus("Copied. Your dignity was not.");
    setTimeout(() => setShareStatus(""), 2500);
  };
  const postToX = async () => {
    const caption = `My startup scored ${result.score}/100 on ROAST.MY.STARTUP and the autopsy was disrespectfully specific Think yours survives`;
    const shareUrl = "https://roastmystartupnow.vercel.app";
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`;
    const probe = new File(["roast"], "roast-my-startup.jpg", {
      type: "image/jpeg",
    });
    const canShareImage = Boolean(
      navigator.share && navigator.canShare?.({ files: [probe] }),
    );
    if (!canShareImage) {
      window.open(intent, "_blank", "noopener,noreferrer");
    }
    setIsSharing(true);
    setShareStatus(
      canShareImage
        ? "Condensing the evidence for your share sheet…"
        : "X opened in a new tab, condensing your image now…",
    );
    try {
      await document.fonts?.ready;
      const dataUrl =
        shareImageRef.current ||
        (await toJpeg(shareCardRef.current, {
          backgroundColor: "#000",
          cacheBust: true,
          pixelRatio: 1,
          quality: 0.9,
        }));
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `roast-my-startup-${result.score}-out-of-100.jpg`,
        {
          type: "image/jpeg",
        },
      );
      if (canShareImage) {
        await navigator.share({
          title: "My startup got roasted",
          text: caption,
          url: shareUrl,
          files: [file],
        });
        trackProductEvent("roast_shared", { channel: "x_image_share" });
        setShareStatus("Evidence released. Reputation pending.");
      } else {
        const download = document.createElement("a");
        download.href = dataUrl;
        download.download = file.name;
        download.click();
        trackProductEvent("roast_shared", { channel: "x_image_download" });
        setShareStatus(
          "Screenshot downloaded. Attach the evidence to your prefilled X post.",
        );
      }
    } catch (error) {
      if (error.name !== "AbortError")
        setShareStatus(
          "The screenshot escaped. Try again before it gets funding.",
        );
    } finally {
      setIsSharing(false);
    }
  };
  const challengeFriend = async () => {
    const data = {
      title: "Your startup could use some honesty",
      text: `Mine survived a ${result.score}/100 roast. Submit yours if your ego has health insurance.`,
      url: "https://roastmystartupnow.vercel.app",
    };
    trackProductEvent("roast_shared", {
      channel: navigator.share ? "native_share" : "challenge_copy",
    });
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        if (error.name !== "AbortError")
          await copyText(`${data.text} ${data.url}`);
      }
    } else {
      await copyText(`${data.text} ${data.url}`);
    }
  };
  const close = () => {
    trackProductEvent("roast_another_clicked");
    submitted.current = false;
    setFormStarted(false);
    setShareStatus("");
    shareImageRef.current = null;
    setSignupStatus("");
    setRoastError("");
    setResult(null);
    sessionStorage.removeItem("roast-result");
    window.history.pushState({}, "", "/");
    setRoute("/");
    setTimeout(
      () =>
        document
          .getElementById("roastform")
          ?.scrollIntoView({ behavior: "smooth" }),
      0,
    );
  };
  if (route === "/privacy")
    return (
      <>
        <Analytics />
        <LegalPage type="privacy" />
      </>
    );
  if (route === "/terms")
    return (
      <>
        <Analytics />
        <LegalPage type="terms" />
      </>
    );
  if (route === "/roast")
    return (
      <main>
        <Analytics />
        <SiteHeader />
        {result ? (
          <div className="overlay overlay--page">
            <Marquee red>
              💀 AUTOPSY COMPLETE 💀 DIAGNOSIS: TERMINAL 💀 NO SURVIVORS 💀
            </Marquee>
            <div className="autopsy">
              <div className="big-fire">🔥</div>
              <h2>THE FULL AUTOPSY</h2>
              <p>{result.greet}</p>
              {signupStatus && (
                <p className="signup-status" aria-live="polite">
                  {signupStatus}
                </p>
              )}
              <div className="score">
                <small>Official Roast Score</small>
                <b>
                  {result.score}
                  <span>/100</span>
                </b>
                <em>
                  {result.score < 10
                    ? "CERTIFIED CATASTROPHE ☠️"
                    : result.score < 18
                      ? "DEEPLY UNWELL 🤒"
                      : "TECHNICALLY ALIVE (barely) 🫥"}
                </em>
              </div>
              <article className="verdict">
                <h3>{result.verdictTitle || "🩻 The Core Delusion"}</h3>
                <p>{result.verdict}</p>
              </article>
              {result.sections.map((s) => (
                <article
                  className="tear"
                  style={{ background: s[1] }}
                  key={s[0]}
                >
                  <h3>{s[0]}</h3>
                  <p>{s[2]}</p>
                </article>
              ))}
              <article className="local">
                <h3>
                  {result.localTitle || "📍 Local Reality Check"}: {result.loc}
                </h3>
                <p>{result.local}</p>
              </article>
              <article className="final">
                <h3>☠️ YOUR PERSONAL CONCLUSION</h3>
                <p>{result.final}</p>
              </article>
              {result.sources?.length > 0 && (
                <section className="roast-sources">
                  <h3>🧾 RECEIPTS</h3>
                  <ol>
                    {result.sources.map((source, index) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          [{index + 1}] {source.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <aside
                className="share-card-capture"
                ref={shareCardRef}
                aria-hidden="true"
              >
                <header>
                  <span>
                    ROAST<b>.</b>MY<b>.</b>STARTUP
                  </span>
                  <small>THE CONDENSED AUTOPSY</small>
                </header>
                <div className="share-card-capture__score">
                  <strong>{result.score}</strong>
                  <span>/100</span>
                  <em>MOSTLY COOKED</em>
                </div>
                <section className="share-card-capture__verdict">
                  <h2>{condense(result.verdictTitle, 70)}</h2>
                  <p>{condense(result.verdict, 260)}</p>
                </section>
                <div className="share-card-capture__grid">
                  {result.sections.map((section, index) => (
                    <article
                      style={{ background: section[1] }}
                      key={`${section[0]}-${index}`}
                    >
                      <h3>{condense(section[0], 58)}</h3>
                      <p>{condense(section[2])}</p>
                    </article>
                  ))}
                  <article style={{ background: "#39ff14" }}>
                    <h3>{condense(result.localTitle, 58)}</h3>
                    <p>{condense(result.local)}</p>
                  </article>
                </div>
                <section className="share-card-capture__final">
                  <h2>☠️ PERSONAL CONCLUSION</h2>
                  <p>{condense(result.final, 280)}</p>
                </section>
                <footer>ROASTMYSTARTUPNOW.VERCEL.APP</footer>
              </aside>
              <section className="share-roast">
                <h3>📢 SHARE YOUR L WITH THE WORLD</h3>
                <p>Misery loves company. Drag your friends down here too. 😈</p>
                <div className="share-roast__buttons">
                  <button
                    className="share-roast__x"
                    type="button"
                    onClick={postToX}
                    disabled={isSharing}
                  >
                    {isSharing
                      ? "📸 DEVELOPING EVIDENCE…"
                      : "🐦 POST MY ROAST ON X"}
                  </button>
                  <button
                    className="share-roast__challenge"
                    type="button"
                    onClick={challengeFriend}
                  >
                    📲 CHALLENGE A FRIEND
                  </button>
                </div>
                <small aria-live="polite">{shareStatus}</small>
              </section>
              <div className="actions">
                <button onClick={close}>← Roast another idea</button>
                <button onClick={close}>😭 I need a hug</button>
              </div>
              <small className="autopsy-footnote">
                no roast emailed. no mercy given. just this. 💅
              </small>
            </div>
          </div>
        ) : (
          <section className="missing-roast">
            <h1>NO BODY FOUND 💀</h1>
            <p>
              This autopsy expired with your browser session. Submit the startup
              again so we can kill it properly.
            </p>
            <button type="button" onClick={close}>
              ← Go get roasted
            </button>
          </section>
        )}
        <div className="confetti">
          {confetti.map((c) => (
            <i
              className="piece"
              style={{
                left: `${c.left}%`,
                animationDelay: `${c.delay}s`,
                background: c.emoji
                  ? "transparent"
                  : pick(["#FF0040", "#FFFF00", "#39FF14", "#FF10F0"]),
              }}
              key={c.id}
            >
              {c.emoji}
            </i>
          ))}
        </div>
      </main>
    );
  return (
    <main>
      <Analytics />
      <SiteHeader />
      <Marquee>
        🔥 YOUR STARTUP SUCKS 🔥 GET DESTROYED 🔥 NO REFUNDS 🔥 YOUR MOM LIED TO
        YOU 🔥 WE FIND WHAT EVERYONE'S TOO POLITE TO MENTION 🔥
      </Marquee>
      <section className="hero">
        <i className="spin left">☢️</i>
        <i className="spin rev right">💀</i>
        <div className="terminal">&gt; SYSTEM READY. FEELINGS: NOT FOUND_</div>
        <h1>
          <span className="hero-line hero-line--yellow">
            <span>YOUR</span>
            <span>STARTUP</span>
            <span>SUCKS</span>
          </span>
          <span className="hero-line hero-line--green">
            <span>AND</span>
            <span>WE'LL</span>
            <span>PROVE IT</span>
          </span>
        </h1>
        <p
          className="hero-sub"
          onMouseEnter={(event) => {
            const banner = event.currentTarget;
            const nextSide =
              banner.dataset.dodgeSide === "left" ? "right" : "left";
            banner.dataset.dodgeSide = nextSide;
            banner.style.setProperty(
              "--hover-shift",
              nextSide === "left" ? "-24px" : "24px",
            );
            banner.style.setProperty(
              "--hover-tilt",
              nextSide === "left" ? "-3.5deg" : "1.5deg",
            );
          }}
        >
          Get honest feedback that doesn't care about your feelings
        </p>
        <div id="roastform" className="form-section hero-form-section">
          <form onSubmit={submit}>
            <label>💡 Your "revolutionary" idea *</label>
            <textarea
              name="idea"
              required
              rows="4"
              value={form.idea}
              onChange={onChange}
              placeholder="It's like Uber but for... (we're already cringing)"
            />
            <div className="field">
              <label>🧠 Founder background (your LinkedIn fan fiction) *</label>
              <textarea
                name="founderBackground"
                required
                rows="4"
                value={form.founderBackground}
                onChange={onChange}
                placeholder="Former McKinsey? College dropout? Your dad knows a VC? Tell us what you've built, studied, survived, or dramatically resigned from."
              />
            </div>
            <Field
              label="Full name *"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Chad Disruptor"
              green
              required
            />
            <div className="grid">
              <Select
                label="Age range *"
                name="age"
                value={form.age}
                onChange={onChange}
                options={["18 to 25", "26 to 35", "36 to 45", "45+"]}
              />
              <Select
                label="Experience *"
                name="experience"
                value={form.experience}
                onChange={onChange}
                options={[
                  "First time founder",
                  "2 to 3 startups",
                  "Serial entrepreneur",
                  "Employee",
                  "Student",
                  "Other",
                ]}
              />
            </div>
            <Field
              label="📍 Location (country/city) *"
              name="loc"
              value={form.loc}
              onChange={onChange}
              placeholder="Silicon Valley (of course)"
              required
            />
            <Field
              label="Email address *"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              placeholder="founder@definitelythefuture.com"
              required
            />
            <Field
              label="LinkedIn profile (optional)"
              name="linkedin"
              type="url"
              autoComplete="url"
              value={form.linkedin}
              onChange={onChange}
              placeholder="https://linkedin.com/in/your-profile"
            />
            <label className="leaderboard-optin">
              <input
                type="checkbox"
                name="leaderboardOptIn"
                checked={form.leaderboardOptIn}
                onChange={onChange}
              />
              <span>
                Put this startup on the public Most Cooked leaderboard
              </span>
            </label>
            {form.leaderboardOptIn && (
              <Field
                label="Startup name for the leaderboard *"
                name="startupName"
                value={form.startupName}
                onChange={onChange}
                placeholder="Delusion Labs"
                maxLength="80"
                required
              />
            )}
            {form.leaderboardOptIn && (
              <p className="leaderboard-disclosure">
                This publicly displays the startup name, a shortened idea, roast
                score, and one roast line but never your personal details
              </p>
            )}
            <button
              className="roast-submit"
              disabled={isRoasting}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <span className="roast-submit__label">
                {isRoasting
                  ? "🔥 THE ROAST IS COOKING… 🔥"
                  : hover
                    ? "😈 I'M READY TO GET DESTROYED 😈"
                    : "🔥 ROAST ME 🔥"}
              </span>
              {isRoasting && (
                <span
                  className="roast-progress"
                  role="progressbar"
                  aria-label="Estimated roast progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={roastProgress}
                >
                  <span
                    className="roast-progress__fill"
                    style={{ width: `${roastProgress}%` }}
                  />
                  <b>{roastProgress}%</b>
                </span>
              )}
            </button>
            {roastError && (
              <strong className="roast-error" role="alert">
                {roastError}
              </strong>
            )}
            <small>
              By roasting, you agree to the <a href="/terms">Terms</a>,{" "}
              <a href="/privacy">Privacy Policy</a>, and product emails,
              unsubscribe anytime, 18+ only 💅
            </small>
          </form>
        </div>
      </section>
      <section className="warnings">
        <div>⚠️ WARNING: This will hurt your feelings</div>
        <div>🔎 AI CAN BE WRONG: Verify facts before betting the runway</div>
        <div>
          🎯 PROMISE: You'll laugh, cringe & find the useful bit hiding inside
        </div>
      </section>
      <section className="leaderboard" aria-labelledby="leaderboard-title">
        <h2 id="leaderboard-title">🔥 THE MOST COOKED STARTUPS 🔥</h2>
        <p className="leaderboard__intro">
          A daily ranking of ideas that entered the kitchen and left as smoke
        </p>
        {leaderboardIsDemo && (
          <p className="leaderboard__demo">
            PRELAUNCH EDITION, THE INTERNET HAS NOT BEEN WARNED YET
          </p>
        )}
        <ol className="leaderboard__list">
          {leaderboard.map((entry, index) => (
            <li
              className="leaderboard__entry"
              key={entry.id || entry.startupName}
            >
              <span className="leaderboard__rank">#{index + 1}</span>
              <div>
                <h3>{entry.startupName}</h3>
                <p>{entry.roastLine}</p>
              </div>
              <strong className="leaderboard__score">{entry.score}/100</strong>
            </li>
          ))}
        </ol>
      </section>
      <section className="graveyard">
        <h2>💀 THE GRAVEYARD 💀</h2>
        <p>This is what honest feedback actually looks like. 🔥🔥🔥</p>
        <div className="roast-list">
          {roasts.map((r, i) => (
            <article
              className="roast-card"
              style={{
                background: r[4],
                transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`,
              }}
              key={r[0]}
            >
              <b className="badge">{r[5]}</b>
              <small>💬 {r[0]} pitched:</small>
              <q>{r[1]}</q>
              <strong>🔥 {r[2]}</strong>
              <em>Cause of death: {r[3]}</em>
            </article>
          ))}
        </div>
        <h3>"We find what everyone else is too polite to mention."</h3>
        <p>Your mom says your idea is great. We'll tell you the truth. 💔</p>
      </section>
      <section className="reviews">
        <h2>
          <span className="review-star" aria-hidden="true">
            ⭐
          </span>
          <span>WHAT PEOPLE HAD TO SAY</span>
          <span className="review-star" aria-hidden="true">
            ⭐
          </span>
        </h2>
        <p>
          Real founders. Real reactions. Apparently honesty has survivors. 😭
        </p>
        <div className="review-grid">
          {testimonials.map((t, i) => (
            <article
              style={{
                background: t[4],
                transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`,
              }}
              key={t[1]}
            >
              <small>
                ★★★★★ <span>(5/5, would cry again)</span>
              </small>
              <q>{t[0]}</q>
              <div>
                {t[3]} <b>{t[1]}</b>
                <em>{t[2]}</em>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer>
        <div className="footer-logo">
          ROAST<span>.</span>MY<span>.</span>STARTUP
        </div>
        <p className="footer-credit">
          Built by a founder who also got roasted and cried briefly. 😭
        </p>
        <div className="footer-legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <span>© 2026 Roast My Startup.</span>
        </div>
      </footer>
      <div className="confetti">
        {confetti.map((c) => (
          <i
            className="piece"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              background: c.emoji
                ? "transparent"
                : pick(["#FF0040", "#FFFF00", "#39FF14", "#FF10F0"]),
            }}
            key={c.id}
          >
            {c.emoji}
          </i>
        ))}
      </div>
    </main>
  );
}
function Field({ label, green, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className={green ? "green" : ""} {...props} />
    </div>
  );
}
function Select({ label, options, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select required {...props}>
        <option value="">Pick one</option>
        {options.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <Sentry.ErrorBoundary
    fallback={
      <main className="missing-roast">
        <h1>THE SITE CAUGHT FIRE 🔥</h1>
        <p>The error has been reported. Refresh the page and try again.</p>
      </main>
    }
  >
    <App />
  </Sentry.ErrorBoundary>,
);
