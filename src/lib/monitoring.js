import {
  trackEvent,
  trackApplicationSubmitResult,
} from './analytics.js';

function normalizeErrorName(error) {
  return error?.name || 'Error';
}

function normalizeErrorSource(source) {
  return source || 'window';
}

export function initMonitoring() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    trackEvent('js_error', {
      error_name: normalizeErrorName(event.error || { name: 'ErrorEvent' }),
      error_source: normalizeErrorSource('window.error'),
      is_fatal: true,
      eligibility_mode: 'none',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason : { name: 'UnhandledPromiseRejection' };
    trackEvent('js_error', {
      error_name: normalizeErrorName(reason),
      error_source: normalizeErrorSource('window.unhandledrejection'),
      is_fatal: false,
      eligibility_mode: 'none',
    });
  });
}

export function trackLiveModeUnavailableSubmission() {
  trackApplicationSubmitResult({
    eligibilityMode: 'live',
    result: 'blocked',
    failureReasonCode: 'live_mode_unavailable',
    integrationTarget: 'none',
  });
}
