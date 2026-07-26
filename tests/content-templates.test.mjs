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
