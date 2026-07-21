import { useEffect } from "react";
import "./legal.css";

const SITE_URL = "https://roastmystartupnow.vercel.app";

function LegalHeader() {
  return (
    <header className="site-header">
      <a className="site-header__brand" href="/">
        ROAST<span>.</span>MY<span>.</span>STARTUP
      </a>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <nav aria-label="Legal">
        <a href="/">Home</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms</a>
      </nav>
      <p>© 2026 Roast My Startup.</p>
    </footer>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <h1>PRIVACY POLICY</h1>
      <p className="legal-date">Effective: July 21, 2026</p>
      <aside>
        <strong>The short version:</strong> your startup submission is sent to
        OpenAI to generate the roast. We do not intentionally save startup
        submissions on our own servers. Your required full name and email
        address are also stored in the project's private Neon Postgres database.
        Your full name is included in the roast request sent to OpenAI, while
        your email address is not. Submitting the form also signs the email
        address up for product marketing messages. Analytics measure product
        usage without intentionally receiving your submission or contact
        details. Do not submit confidential information.
      </aside>

      <section>
        <h2>1. Who runs this thing?</h2>
        <p>
          Roast My Startup is an independent project. It is not presented as a
          limited liability company.
        </p>
      </section>

      <section>
        <h2>2. Information you provide</h2>
        <p>
          To generate a roast, the site asks for your startup idea, founder
          background, full name, age range, experience level, city or country,
          and email address. This information may identify you, especially when
          combined with a distinctive business idea.
        </p>
        <p>
          The required email is also enrolled in product marketing when you
          submit the form, as stated in the warning beneath the submit button.
          We do not ask for a password, payment information, or social account
          credentials.
        </p>
      </section>

      <section>
        <h2>3. OpenAI processing</h2>
        <p>
          Your startup idea, founder background, full name, age range,
          experience level, and location are sent through a Vercel serverless
          function to the OpenAI API. Your email address is not included in that
          request. OpenAI generates the roast and may use web search to find
          current market or competitor information. Search queries may therefore
          be derived from details in your submission.
        </p>
        <p>
          The API request is configured with <code>store: false</code>, so Roast
          My Startup does not ask OpenAI to retain response application state.
          OpenAI states that API data is not used to train its models unless the
          API customer opts in. Under OpenAI's default controls, prompts and
          responses may still appear in abuse monitoring logs retained for up to
          30 days, or longer when legally required or needed for safety. Read{" "}
          <a
            href="https://developers.openai.com/api/docs/guides/your-data"
            target="_blank"
            rel="noreferrer"
          >
            OpenAI's API data controls
          </a>
          .
        </p>
      </section>

      <section>
        <h2>4. What Roast My Startup stores</h2>
        <p>
          Roast My Startup has no user accounts and does not save private
          startup submissions or generated roasts in its application database.
          The generated result is saved in your browser's{" "}
          <code>sessionStorage</code> so the autopsy page survives navigation in
          that tab. Starting another roast, clearing site data, or ending the
          browser session removes that browser copy.
        </p>
        <p>
          If you actively join the public leaderboard after seeing a roast, the startup
          name, a shortened version of the idea, its roast score, one generated
          roast line, and the submission time are stored in Neon Postgres and
          displayed publicly. Your full name, founder background, email, age,
          experience, and location are not included in the leaderboard entry.
        </p>
        <p>
          The project's private Neon Postgres database stores your email
          address, full name, marketing consent status, and collection and
          update timestamps. These contact details are kept separate from the
          startup submission and roast. Infrastructure providers may retain
          security, request, and operational logs according to their own
          settings and legal obligations. We do not deliberately write startup
          submissions or contact details to application logs.
        </p>
      </section>

      <section>
        <h2>5. Contact storage, analytics, monitoring, and abuse protection</h2>
        <h3>Neon Postgres</h3>
        <p>
          Neon hosts the project's private Postgres database containing the
          contact records described above. Database credentials are stored as
          encrypted Vercel environment variables and are not exposed to the
          browser. See{" "}
          <a
            href="https://neon.com/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            Neon's privacy policy
          </a>
          .
        </p>
        <h3>Public leaderboard storage</h3>
        <p>
          The same Neon Postgres database stores public leaderboard entries
          submitted with explicit permission. The leaderboard reads the newest
          entries and ranks the most cooked results.
        </p>
        <h3>PostHog</h3>
        <p>
          PostHog records page views, page exits, and product events such as
          starting, submitting, completing, failing, sharing a roast, or
          successfully saving contact details. Event properties are limited to
          coarse idea and background length buckets, model name, and sharing
          channel. Autocapture and session recording are disabled. We do not
          intentionally send startup text, founder names, email addresses,
          locations, or other form contents to PostHog. PostHog may use browser
          storage and receive ordinary technical information required to process
          analytics. See{" "}
          <a
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            PostHog's privacy policy
          </a>
          .
        </p>
        <h3>Vercel Web Analytics</h3>
        <p>
          Vercel Web Analytics records aggregated page information including
          timestamp, page URL, referrer, coarse geolocation, browser, operating
          system, and device type. Vercel says these analytics do not use third
          party cookies or associate page views with an identifiable person or
          IP address. See{" "}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            Vercel Analytics privacy information
          </a>
          .
        </p>
        <h3>Sentry</h3>
        <p>
          Sentry receives error reports from the website and server functions,
          including technical stack information, page route, runtime
          environment, and limited browser or device context. Startup
          submissions, contact details, and form contents are deliberately
          removed from error events. Sentry is used to diagnose failures and
          send operational alerts. See{" "}
          <a href="https://sentry.io/privacy/" target="_blank" rel="noreferrer">
            Sentry's privacy policy
          </a>
          .
        </p>
        <h3>Vercel BotID and firewall</h3>
        <p>
          Vercel BotID runs an invisible browser challenge when you submit a
          roast or join the update list. Vercel processes browser signals to
          distinguish people from automated traffic. The Vercel firewall also
          uses the requesting IP address to limit repeated calls to the roast
          endpoint. These controls are used to prevent abuse and unexpected
          generation costs. See{" "}
          <a
            href="https://vercel.com/docs/botid"
            target="_blank"
            rel="noreferrer"
          >
            Vercel BotID information
          </a>{" "}
          and{" "}
          <a
            href="https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting"
            target="_blank"
            rel="noreferrer"
          >
            Vercel rate limiting information
          </a>
          .
        </p>
      </section>

      <section className="legal-warning">
        <h2>6. Do not submit confidential information</h2>
        <p>
          Do not submit trade secrets, unreleased inventions, customer lists,
          credentials, financial account data, health information, government
          identifiers, private third party information, or anything covered by
          an NDA. If losing control of the information would damage you or your
          company, do not feed it to the roast machine.
        </p>
      </section>

      <section>
        <h2>7. Sharing</h2>
        <p>
          If you use a share button, your browser or the selected social
          platform receives the content you choose to share. Sharing is optional
          and is governed by that platform's privacy terms.
        </p>
      </section>

      <section>
        <h2>8. Deletion and your choices</h2>
        <p>
          You can delete the browser copy of a roast by starting another roast,
          closing the session, or clearing this site's browser data. You can
          block analytics using browser privacy controls or content blockers,
          although totals may become less accurate.
        </p>
        <p>
          You can request deletion of your contact record or withdrawal of
          marketing consent using the contact method provided with a marketing
          message. The site has no accounts or application database containing
          startup submissions. Analytics are anonymous or pseudonymous and may
          not be linkable to an individual visitor. Provider security records
          may be retained where required for safety, fraud prevention, or law.
        </p>
      </section>

      <section>
        <h2>9. Age limit and changes</h2>
        <p>
          The service is intended for people aged 18 or older. We may update
          this policy as the product or its providers change. The effective date
          at the top will be updated when material changes are made.
        </p>
      </section>
    </>
  );
}

function Terms() {
  return (
    <>
      <h1>TERMS OF USE</h1>
      <p className="legal-date">Effective: July 21, 2026</p>
      <aside>
        <strong>The short version:</strong> this is an AI generated comedy
        roast, not a consultant, lawyer, accountant, therapist, oracle, or
        substitute for customer research. Verify anything important before using
        it to make a decision.
      </aside>

      <section>
        <h2>1. Acceptance and eligibility</h2>
        <p>
          By using Roast My Startup, you agree to these Terms and the{" "}
          <a href="/privacy">Privacy Policy</a>. Submitting the roast form also
          signs the required email address up for product marketing messages.
          Every marketing email includes an unsubscribe option. You must be at
          least 18 years old and legally able to agree to these Terms.
        </p>
      </section>

      <section>
        <h2>2. What the service provides</h2>
        <p>
          Roast My Startup generates personalized comedic criticism using
          artificial intelligence and, when available, web research. The output
          is designed primarily for entertainment, with a smaller amount of
          practical startup feedback.
        </p>
      </section>

      <section>
        <h2>3. AI output can be wrong</h2>
        <p>
          Roasts may be inaccurate, incomplete, outdated, offensive, repetitive,
          or based on misunderstood context. Sources may not support every
          inference. Scores are theatrical opinions, not valuations or
          predictions. You are responsible for checking facts and obtaining
          qualified professional advice before making business, legal,
          financial, employment, or investment decisions.
        </p>
      </section>

      <section className="legal-warning">
        <h2>4. No confidential information</h2>
        <p>
          You must not submit trade secrets, credentials, private customer data,
          regulated data, unreleased patentable details, material protected by
          an NDA, or sensitive information about yourself or another person.
          Only submit content you are permitted to process through third party
          AI and hosting providers.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          You retain whatever rights you have in your submission. You give Roast
          My Startup a limited permission to transmit and process that
          submission solely to operate, secure, troubleshoot, and improve the
          service as described in the Privacy Policy. You confirm that your
          submission does not violate another person's rights or applicable law.
        </p>
      </section>

      <section>
        <h2>6. Generated roasts</h2>
        <p>
          You may copy and share your generated roast for lawful purposes. AI
          outputs may not be unique, and another user may receive similar
          language. You are responsible for reviewing a roast before publishing
          it and for any consequences of sharing it, including when it contains
          claims about a person or company.
        </p>
      </section>

      <section>
        <h2>7. Optional public leaderboard</h2>
        <p>
          The public leaderboard is optional. If you join it after seeing your roast, you authorize
          Roast My Startup to display the startup name, shortened idea, roast
          score, and selected roast text publicly until the entry is removed. Do
          not enter a confidential or third party startup. Scores are comedic
          outputs and not objective rankings.
        </p>
      </section>

      <section>
        <h2>8. Acceptable use</h2>
        <p>
          Do not use the service to harass or threaten someone, impersonate
          another person, expose private information, generate unlawful content,
          attack the infrastructure, evade usage controls, scrape at abusive
          volume, or submit content on behalf of someone who did not authorize
          it.
        </p>
      </section>

      <section>
        <h2>9. Availability and changes</h2>
        <p>
          The service may be changed, limited, suspended, or discontinued
          without notice. Requests may fail because of provider outages, usage
          limits, safety systems, or the machine simply deciding it has heard
          enough startup ideas for one day.
        </p>
      </section>

      <section>
        <h2>10. Disclaimer and responsibility</h2>
        <p>
          The service is provided on an "as is" and "as available" basis without
          promises that it will be accurate, uninterrupted, secure, or suitable
          for a particular purpose. To the extent permitted by applicable law,
          the operator is not responsible for indirect or consequential losses
          arising from your use of or reliance on the service. Nothing in these
          Terms excludes responsibility that cannot legally be excluded.
        </p>
      </section>

      <section>
        <h2>11. Updates</h2>
        <p>
          We may update these Terms as the service changes. Continued use after
          an update means the revised Terms apply from their effective date.
        </p>
      </section>
    </>
  );
}

export default function LegalPage({ type }) {
  const privacy = type === "privacy";

  useEffect(() => {
    const path = privacy ? "/privacy" : "/terms";
    const title = privacy
      ? "Privacy Policy | Roast My Startup"
      : "Terms of Use | Roast My Startup";
    const description = privacy
      ? "How Roast My Startup processes submissions and analytics data."
      : "Terms for using Roast My Startup and its AI generated roasts.";
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `${SITE_URL}${path}`;
    window.scrollTo(0, 0);
  }, [privacy]);

  return (
    <>
      <LegalHeader />
      <main className="legal-page">
        {privacy ? <PrivacyPolicy /> : <Terms />}
      </main>
      <LegalFooter />
    </>
  );
}
