import {
  getScalableTemplateContracts,
  standardSectionKeys,
  scalableEvidenceFieldKeys,
} from '../schema/scalable-page-contract.mjs';

export const scalablePageTemplates = getScalableTemplateContracts().map((contract) => ({
  ...contract,
  sectionOrder: standardSectionKeys,
  evidenceChecklist: scalableEvidenceFieldKeys,
}));

const templateById = new Map(
  scalablePageTemplates.map((template) => [template.templateId, template]),
);

export function getScalablePageTemplate(templateId) {
  return templateById.get(templateId) || null;
}

export function getScalablePageTemplates() {
  return scalablePageTemplates.slice();
}
