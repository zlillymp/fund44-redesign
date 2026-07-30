import {
  analyticsConsentGranted,
  analyticsEnvironment,
  registerAnalyticsDestination,
} from '../../analytics.js';
import {
  GA4_DESTINATION_ID,
  GA4_MEASUREMENT_ID,
  createGa4Destination,
  isGa4DestinationEnabled,
} from './ga4.js';

export const analyticsDestinationManifest = Object.freeze([
  Object.freeze({
    id: GA4_DESTINATION_ID,
    vendor: 'google_analytics_4',
    propertyId: GA4_MEASUREMENT_ID,
    productionOnly: true,
    consentDefault: 'denied',
    sendsVendorPageViews: false,
  }),
]);

export function initAnalyticsDestinations({
  windowRef,
  documentRef,
  environment = analyticsEnvironment(),
  hostname,
  consent,
} = {}) {
  const win = windowRef || (typeof window === 'undefined' ? null : window);
  const resolvedHostname = hostname ?? win?.location?.hostname ?? '';
  const resolvedConsent = consent || {
    analyticsGranted: analyticsConsentGranted(),
    adsGranted: false,
  };

  const ga4 = createGa4Destination({
    environment,
    hostname: resolvedHostname,
    consent: resolvedConsent,
    windowRef: win,
    documentRef,
  });

  registerAnalyticsDestination(ga4);

  if (isGa4DestinationEnabled({ environment, hostname: resolvedHostname })) {
    ga4.load();
  }

  return [ga4];
}
