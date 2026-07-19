import posthog from 'posthog-js';

const projectKey = import.meta.env.VITE_POSTHOG_KEY;

if (projectKey) {
  posthog.init(projectKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
  });
}

export function trackProductEvent(event, properties = {}) {
  if (projectKey) posthog.capture(event, properties);
}
