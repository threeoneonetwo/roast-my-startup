import { useEffect } from 'react';
import './legal.css';

const SITE_URL = 'https://roastmystartupnow.vercel.app';
const CONTACT_URL = 'https://x.com/threeoneonetwo';

function LegalHeader() {
  return <header className="site-header"><a className="site-header__brand" href="/">ROAST<span>.</span>MY<span>.</span>STARTUP</a></header>;
}

function LegalFooter() {
  return <footer className="legal-footer"><nav aria-label="Legal"><a href="/">Home</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a></nav><p>© 2026 Roast My Startup — an independent project by Vansh Pandita.</p></footer>;
}

function PrivacyPolicy() {
  return <>
    <h1>PRIVACY POLICY</h1>
    <p className="legal-date">Effective: July 20, 2026</p>
    <aside><strong>The short version:</strong> your startup submission is sent to OpenAI to generate the roast. We do not maintain an account database or intentionally save submissions on our own servers. Analytics measure how the product is used without intentionally receiving your pitch, name, or contact details. Do not submit confidential information.</aside>

    <section><h2>1. Who runs this thing?</h2><p>Roast My Startup is an independent project operated by Vansh Pandita. It is not presented as a limited liability company. For privacy questions or deletion requests, contact <a href={CONTACT_URL} target="_blank" rel="noreferrer">@threeoneonetwo on X</a>.</p></section>

    <section><h2>2. Information you provide</h2><p>To generate a roast, the site asks for your startup idea, founder background, first name, age range, experience level, and city or country. This information may identify you, especially when combined with a distinctive business idea.</p><p>We do not ask for an email address, last name, password, payment information, or LinkedIn URL. Please do not place those details inside another field.</p></section>

    <section><h2>3. OpenAI processing</h2><p>The submitted fields are sent through a Vercel serverless function to the OpenAI API. OpenAI generates the roast and may use web search to find current market or competitor information. Search queries may therefore be derived from details in your submission.</p><p>The API request is configured with <code>store: false</code>, so Roast My Startup does not ask OpenAI to retain response application state. OpenAI states that API data is not used to train its models unless the API customer opts in. Under OpenAI's default controls, prompts and responses may still appear in abuse-monitoring logs retained for up to 30 days, or longer when legally or safety-required. Read <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer">OpenAI's API data controls</a>.</p></section>

    <section><h2>4. What Roast My Startup stores</h2><p>Roast My Startup has no user accounts and no application database for submissions or generated roasts. The generated result is saved in your browser's <code>sessionStorage</code> so the autopsy page survives navigation in that tab. Starting another roast, clearing site data, or ending the browser session removes that browser copy.</p><p>Infrastructure providers may retain security, request, and operational logs according to their own settings and legal obligations. We do not deliberately write startup submissions to application logs.</p></section>

    <section><h2>5. Analytics</h2><h3>PostHog</h3><p>PostHog records page views, page exits, and product events such as starting, submitting, completing, failing, or sharing a roast. Event properties are limited to coarse idea/background length buckets, model name, and sharing channel. Autocapture and session recording are disabled. We do not intentionally send startup text, founder names, locations, or other form contents to PostHog. PostHog may use browser storage and receive ordinary technical information required to process analytics. See <a href="https://posthog.com/privacy" target="_blank" rel="noreferrer">PostHog's privacy policy</a>.</p><h3>Vercel Web Analytics</h3><p>Vercel Web Analytics records aggregated page information including timestamp, page URL, referrer, coarse geolocation, browser, operating system, and device type. Vercel says these analytics do not use third-party cookies or associate page views with an identifiable person or IP address. See <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Analytics privacy information</a>.</p></section>

    <section className="legal-warning"><h2>6. Do not submit confidential information</h2><p>Do not submit trade secrets, unreleased inventions, customer lists, credentials, financial account data, health information, government identifiers, private third-party information, or anything covered by an NDA. If losing control of the information would damage you or your company, do not feed it to the roast machine.</p></section>

    <section><h2>7. Sharing</h2><p>If you use a share button, your browser or the selected social platform receives the content you choose to share. Sharing is optional and is governed by that platform's privacy terms.</p></section>

    <section><h2>8. Deletion and your choices</h2><p>You can delete the browser copy of a roast by starting another roast, closing the session, or clearing this site's browser data. You can block analytics using browser privacy controls or content blockers, although totals may become less accurate.</p><p>For a deletion or privacy request, contact <a href={CONTACT_URL} target="_blank" rel="noreferrer">@threeoneonetwo on X</a> with the approximate date and time of your visit and the request. Do not resend your confidential submission. Because the site has no accounts and analytics are anonymous or pseudonymous, it may not always be possible to connect a record to you. Provider security records may also be retained where required for safety, fraud prevention, or law.</p></section>

    <section><h2>9. Age limit and changes</h2><p>The service is intended for people aged 18 or older. We may update this policy as the product or its providers change. The effective date at the top will be updated when material changes are made.</p></section>
  </>;
}

function Terms() {
  return <>
    <h1>TERMS OF USE</h1>
    <p className="legal-date">Effective: July 20, 2026</p>
    <aside><strong>The short version:</strong> this is an AI-generated comedy roast, not a consultant, lawyer, accountant, therapist, oracle, or substitute for customer research. Verify anything important before using it to make a decision.</aside>

    <section><h2>1. Acceptance and eligibility</h2><p>By using Roast My Startup, you agree to these Terms and the <a href="/privacy">Privacy Policy</a>. You must be at least 18 years old and legally able to agree to these Terms.</p></section>

    <section><h2>2. What the service provides</h2><p>Roast My Startup generates personalized comedic criticism using artificial intelligence and, when available, web research. The output is designed primarily for entertainment, with a smaller amount of practical startup feedback.</p></section>

    <section><h2>3. AI output can be wrong</h2><p>Roasts may be inaccurate, incomplete, outdated, offensive, repetitive, or based on misunderstood context. Sources may not support every inference. Scores are theatrical opinions, not valuations or predictions. You are responsible for checking facts and obtaining qualified professional advice before making business, legal, financial, employment, or investment decisions.</p></section>

    <section className="legal-warning"><h2>4. No confidential information</h2><p>You must not submit trade secrets, credentials, private customer data, regulated data, unreleased patentable details, NDA-protected material, or sensitive information about yourself or another person. Only submit content you are permitted to process through third-party AI and hosting providers.</p></section>

    <section><h2>5. Your content</h2><p>You retain whatever rights you have in your submission. You give Roast My Startup a limited permission to transmit and process that submission solely to operate, secure, troubleshoot, and improve the service as described in the Privacy Policy. You confirm that your submission does not violate another person's rights or applicable law.</p></section>

    <section><h2>6. Generated roasts</h2><p>You may copy and share your generated roast for lawful purposes. AI outputs may not be unique, and another user may receive similar language. You are responsible for reviewing a roast before publishing it and for any consequences of sharing it, including when it contains claims about a person or company.</p></section>

    <section><h2>7. Acceptable use</h2><p>Do not use the service to harass or threaten someone, impersonate another person, expose private information, generate unlawful content, attack the infrastructure, evade usage controls, scrape at abusive volume, or submit content on behalf of someone who did not authorize it.</p></section>

    <section><h2>8. Availability and changes</h2><p>The service may be changed, limited, suspended, or discontinued without notice. Requests may fail because of provider outages, usage limits, safety systems, or the machine simply deciding it has heard enough startup ideas for one day.</p></section>

    <section><h2>9. Disclaimer and responsibility</h2><p>The service is provided on an "as is" and "as available" basis without promises that it will be accurate, uninterrupted, secure, or suitable for a particular purpose. To the extent permitted by applicable law, the operator is not responsible for indirect or consequential losses arising from your use of or reliance on the service. Nothing in these Terms excludes responsibility that cannot legally be excluded.</p></section>

    <section><h2>10. Contact and updates</h2><p>Questions can be sent to <a href={CONTACT_URL} target="_blank" rel="noreferrer">@threeoneonetwo on X</a>. We may update these Terms as the service changes. Continued use after an update means the revised Terms apply from their effective date.</p></section>
  </>;
}

export default function LegalPage({ type }) {
  const privacy = type === 'privacy';

  useEffect(() => {
    const path = privacy ? '/privacy' : '/terms';
    const title = privacy ? 'Privacy Policy | Roast My Startup' : 'Terms of Use | Roast My Startup';
    const description = privacy ? 'How Roast My Startup processes submissions and analytics data.' : 'Terms for using Roast My Startup and its AI-generated roasts.';
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `${SITE_URL}${path}`;
    window.scrollTo(0, 0);
  }, [privacy]);

  return <><LegalHeader /><main className="legal-page">{privacy ? <PrivacyPolicy /> : <Terms />}</main><LegalFooter /></>;
}
