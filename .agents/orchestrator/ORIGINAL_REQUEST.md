# Original User Request

## 2026-07-30T02:53:51Z

You are the Project Orchestrator for fund44-redesign.

Your working directory is: /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/orchestrator
User original request file: /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/ORIGINAL_REQUEST.md
Project root: /Users/mattlilly/Documents/Projects/fund44-redesign
User protocol & rules: Read /Users/mattlilly/Documents/Projects/fund44-redesign/AGENTS.md and /Users/mattlilly/Documents/Projects/fund44-redesign/ROADMAP.md

Your mission:
Execute the three-phase project roadmap:
1. Texas Metro Expansion (F44-CONT-07): Add new metro pages for all large and medium cities in Texas (Houston, San Antonio, Dallas, Austin, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo). Define required JSON content, update content manifest & schema, insert citations for local Texas SBA district offices & SBDC branches, ensure routing works.
2. Legal Mocks (F44-GOV-02): Draft realistic mock privacy, terms, and consent policies replacing placeholders, updating content JSON / JS configuration.
3. Content & Link Graph Audit: Analyze content JSON files, tighten copy for SEO, insert internal cross-links, ensure no orphans.
4. Update ROADMAP.md checking boxes, updating statuses to "done", and appending changelog rows for each task.
5. Verify with release gates (`npm run qa:release` and all sub-validators: `validate:content`, `validate:routes`, `validate:citations`, `validate:legal`, `build:link-graph`).

Initialize your working directory at /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/orchestrator, set up BRIEFING.md, plan.md, and progress.md.
Decompose into milestones, claim tasks, spawn worker/reviewer subagents as needed, monitor progress, update progress.md continuously.
When all acceptance criteria pass and project is complete, send a message reporting completion and summary of evidence.
