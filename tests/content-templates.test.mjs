import test from 'node:test';
import assert from 'node:assert/strict';

import { getContentById } from '../src/lib/content.js';
import { getScalablePageTemplates } from '../content/templates/scalable-page-templates.mjs';
import { standardSectionKeys } from '../content/schema/scalable-page-contract.mjs';

test('scalable page template inventory covers current and future route families', () => {
  const templates = new Map(
    getScalablePageTemplates().map((template) => [template.templateId, template]),
  );

  ['financing_hub', 'product_page', 'use_case_page', 'industry_page', 'state_page'].forEach((templateId) => {
    assert.ok(templates.has(templateId), `missing scalable template ${templateId}`);
    assert.deepEqual(templates.get(templateId).sectionOrder, standardSectionKeys);
  });
});

test('current financing and SBA cluster records satisfy the scalable section contract', () => {
  const records = [
    getContentById('page_financing'),
    getContentById('page_sba_7a'),
    getContentById('page_sba_504'),
    getContentById('page_business_acquisition'),
    getContentById('page_working_capital'),
    getContentById('page_term_loan'),
    getContentById('page_line_of_credit'),
    getContentById('page_equipment_financing'),
  ];

  records.forEach((record) => {
    assert.ok(record.quickAnswer.term);
    assert.ok(record.quickAnswer.definition);
    assert.ok(record.whoItFits.heading);
    assert.ok(record.whoItFits.items.length > 0);
    assert.ok(record.whenItMayNotFit.heading);
    assert.ok(record.whenItMayNotFit.items.length > 0);
    assert.ok(record.typicalDocuments.heading);
    assert.ok(record.typicalDocuments.items.length > 0);
    assert.ok(record.howFund44Fits.heading);
    assert.ok(record.howFund44Fits.summary);
    assert.ok(record.howFund44Fits.bullets.length > 0);
    assert.ok(record.commonQuestions.length > 0);
    assert.ok(record.sectionDisclosureHtml);
    assert.ok(record.disclosureIds.length > 0);
    assert.ok(record.citationIds.length > 0);
    assert.ok(record.measurement.ctaIds.length > 0);
    assert.equal(record.indexability.indexable, true);
  });
});

test('use-case cluster records satisfy the scalable section contract', () => {
  const records = [
    getContentById('use_case_buy_a_business'),
    getContentById('use_case_owner_occupied_real_estate'),
    getContentById('use_case_cash_flow_needs'),
    getContentById('use_case_equipment_purchase'),
    getContentById('use_case_business_expansion'),
    getContentById('use_case_refinance_business_debt'),
  ];

  records.forEach((record) => {
    assert.ok(record.quickAnswer.term);
    assert.ok(record.quickAnswer.definition);
    assert.ok(record.whoItFitsHeading);
    assert.ok(record.bestFitHeading);
    assert.ok(record.whoItFits.heading);
    assert.ok(record.whoItFits.items.length > 0);
    assert.ok(record.whenItMayNotFit.heading);
    assert.ok(record.whenItMayNotFit.items.length > 0);
    assert.ok(record.typicalDocuments.heading);
    assert.ok(record.typicalDocuments.items.length > 0);
    assert.ok(record.howFund44Fits.heading);
    assert.ok(record.howFund44Fits.summary);
    assert.ok(record.howFund44Fits.bullets.length > 0);
    assert.ok(record.bestFitProducts.length >= 2);
    assert.ok(record.alternativePaths.length >= 2);
    assert.ok(record.commonQuestions.length > 0);
    assert.ok(record.sectionDisclosureHtml);
    assert.ok(record.disclosureIds.length > 0);
    assert.ok(record.citationIds.length > 0);
    assert.ok(record.measurement.ctaIds.length > 0);
    assert.equal(record.indexability.indexable, true);
  });
});

test('industry cluster records satisfy the scalable section contract', () => {
  const records = [
    getContentById('industry_franchise_businesses'),
    getContentById('industry_trucking_companies'),
    getContentById('industry_construction_contractors'),
  ];

  records.forEach((record) => {
    assert.ok(record.quickAnswer.term);
    assert.ok(record.quickAnswer.definition);
    assert.ok(record.shortLabel);
    assert.ok(record.whoItFitsHeading);
    assert.ok(record.bestFitHeading);
    assert.ok(record.industryFocusHeading);
    assert.ok(record.whoItFits.heading);
    assert.ok(record.whoItFits.items.length > 0);
    assert.ok(record.whenItMayNotFit.heading);
    assert.ok(record.whenItMayNotFit.items.length > 0);
    assert.ok(record.typicalDocuments.heading);
    assert.ok(record.typicalDocuments.items.length > 0);
    assert.ok(record.howFund44Fits.heading);
    assert.ok(record.howFund44Fits.summary);
    assert.ok(record.howFund44Fits.bullets.length > 0);
    assert.ok(record.bestFitProducts.length >= 3);
    assert.ok(record.underwritingFocusCards.length >= 3);
    assert.ok(record.alternativePaths.length >= 3);
    assert.ok(record.commonQuestions.length > 0);
    assert.ok(record.sectionDisclosureHtml);
    assert.ok(record.disclosureIds.length > 0);
    assert.ok(record.citationIds.length > 0);
    assert.ok(record.measurement.ctaIds.length > 0);
    assert.equal(record.indexability.indexable, true);
  });
});
