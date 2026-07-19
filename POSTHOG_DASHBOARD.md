# Roast My Startup — Product Dashboard

Create one PostHog dashboard called **Roast My Startup — Product Health** with these insights:

1. **Total viewers** — page views, displayed as a total.
2. **Unique viewers** — unique visitors, displayed as a total.
3. **Total completed roasts** — count of `roast_submitted`.
4. **Unique roast users** — unique persons who triggered `roast_submitted`.
5. **Form starts** — count of `form_started`.
6. **Form abandons** — count of `form_abandoned`.
7. **Roast completion funnel** — `form_started` → `roast_submitted` → `roast_viewed`.
8. **Repeat-roast rate** — unique persons with two or more `roast_submitted` events.
9. **Completed roasts over time** — daily count of `roast_submitted`.
10. **Acquisition quality** — `roast_submitted` broken down by initial referrer and UTM source.
11. **Idea-length conversion** — `roast_submitted` broken down by the safe `idea_length` property (`short`, `medium`, `long`).

Never capture startup-plan text, names, email addresses, LinkedIn URLs, or locations. The tracking implementation sends only event names and the idea-length bucket.
