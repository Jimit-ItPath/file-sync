import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://4a59636b02dad3c00afbbc5fe07fa7b5@o4509553632542720.ingest.us.sentry.io/4509553633722368',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [],
  sampleRate: 1,
});
