import { liveEligibilityGate } from './legal.js';

const SUBMISSION_TIMEOUT_MS = 15000;

function buildPayload(state, contactFields, submissionType) {
  const values = state.values || {};
  const context = state.context || {};

  return {
    submission_type: submissionType,
    timestamp: new Date().toISOString(),
    business: {
      legal_name: contactFields.businessName || '',
      contact_name: contactFields.contactName || '',
      email: contactFields.email || '',
      phone: contactFields.phone || '',
    },
    financing: {
      use_of_funds: values.use || '',
      amount: values.amount || '',
      time_in_business: values.tib || '',
      annual_revenue: values.revenue || '',
      state: values.stateCode || '',
    },
    funnel_context: {
      mode: context.activeMode || context.requestedMode || 'preview',
      entry_route_id: context.entryRouteId || '',
      entry_page_type: context.entryPageType || '',
      product_context_route_id: context.productContextRouteId || '',
      funnel_context_kind: context.funnelContextKind || 'generic',
      start_surface: context.startSurface || '',
      start_cta_id: context.startCtaId || '',
    },
    outcome: state.outcome
      ? {
          category: state.outcome.outcomeCategory || '',
          reason_code: state.outcome.reasonCode || '',
        }
      : null,
  };
}

export async function submitLead(state, contactFields) {
  const url = liveEligibilityGate.leadWebhookUrl;
  if (!url) {
    return { ok: false, error: 'Lead webhook URL is not configured.' };
  }

  const payload = buildPayload(state, contactFields, 'lead');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { ok: false, error: `Webhook returned ${response.status}`, status: response.status };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, error: 'Submission timed out. Please try again.' };
    }
    return { ok: false, error: error.message || 'Network error during submission.' };
  }
}

export async function submitApplication(state, contactFields) {
  const url = liveEligibilityGate.applicationWebhookUrl;
  if (!url) {
    return { ok: false, error: 'Application webhook URL is not configured.' };
  }

  const payload = buildPayload(state, contactFields, 'application');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { ok: false, error: `Webhook returned ${response.status}`, status: response.status };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, error: 'Submission timed out. Please try again.' };
    }
    return { ok: false, error: error.message || 'Network error during submission.' };
  }
}

export { buildPayload };
