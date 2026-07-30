import { sanitizeDestinationParams } from '../../analytics.js';

export const GA4_DESTINATION_ID = 'ga4';
export const GA4_MEASUREMENT_ID = 'G-W5V9YVKQJC';
export const GA4_LOADED_FLAG = '__FUND44_GA4_LOADED__';
export const GA4_PRODUCTION_HOSTS = Object.freeze(['fund44.com', 'www.fund44.com']);

// Consent Mode v2 defaults. Everything stays denied until the layer reports consent,
// which stays blocked while F44-GOV-02 owns final consent copy.
export const GA4_CONSENT_DEFAULTS = Object.freeze({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
});

// SPA page views are dispatched by the analytics layer, so GA4 auto page views stay off
// to avoid double-counting route changes.
export const GA4_CONFIG_PARAMS = Object.freeze({ send_page_view: false });

export function ga4ScriptSrc(measurementId = GA4_MEASUREMENT_ID) {
  return `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
}

export function isGa4DestinationEnabled({ environment, hostname } = {}) {
  if (environment !== 'production') return false;
  return GA4_PRODUCTION_HOSTS.includes(String(hostname || '').toLowerCase());
}

function consentUpdatePayload({ analyticsGranted = false, adsGranted = false } = {}) {
  return {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: adsGranted ? 'granted' : 'denied',
    ad_user_data: adsGranted ? 'granted' : 'denied',
    ad_personalization: adsGranted ? 'granted' : 'denied',
  };
}

function toGa4ParamValue(value) {
  return Array.isArray(value) ? value.join(',') : value;
}

function mapParams(params) {
  return Object.fromEntries(
    Object.entries(sanitizeDestinationParams(params)).map(([key, value]) => [key, toGa4ParamValue(value)]),
  );
}

export function createGa4Destination({
  measurementId = GA4_MEASUREMENT_ID,
  environment,
  hostname,
  consent = {},
  windowRef,
  documentRef,
} = {}) {
  const win = windowRef || (typeof window === 'undefined' ? null : window);
  const doc = documentRef || (typeof document === 'undefined' ? null : document);
  const enabled = Boolean(win) && isGa4DestinationEnabled({ environment, hostname });
  const scriptSrc = ga4ScriptSrc(measurementId);

  function gtag() {
    if (!Array.isArray(win.dataLayer)) {
      win.dataLayer = [];
    }
    win.dataLayer.push(arguments);
  }

  function injectScript() {
    if (!doc || typeof doc.createElement !== 'function') return;
    if (doc.querySelector?.(`script[src="${scriptSrc}"]`)) return;

    const script = doc.createElement('script');
    script.async = true;
    script.src = scriptSrc;
    (doc.head || doc.body)?.appendChild(script);
  }

  function updateConsent(nextConsent = {}) {
    if (!enabled || !win[GA4_LOADED_FLAG]) return false;
    gtag('consent', 'update', consentUpdatePayload(nextConsent));
    return true;
  }

  function load() {
    if (!enabled || win[GA4_LOADED_FLAG]) return false;

    gtag('consent', 'default', { ...GA4_CONSENT_DEFAULTS });
    injectScript();
    win[GA4_LOADED_FLAG] = true;
    gtag('js', new Date());
    gtag('config', measurementId, { ...GA4_CONFIG_PARAMS });

    if (consent.analyticsGranted || consent.adsGranted) {
      updateConsent(consent);
    }

    return true;
  }

  function send(eventName, params = {}) {
    if (!enabled) return false;
    load();
    gtag('event', eventName, mapParams(params));
    return true;
  }

  return {
    id: GA4_DESTINATION_ID,
    measurementId,
    enabled,
    load,
    send,
    updateConsent,
  };
}
