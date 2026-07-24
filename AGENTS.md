# Fund44 Agent Protocol

Future agents must treat [ROADMAP.md](ROADMAP.md) as the single source of truth for scope, dependencies, acceptance criteria, and verification. Use [docs/measurement-plan.md](docs/measurement-plan.md) for analytics names, funnel definitions, event properties, dashboard views, and QA rules.

## Core Rules

1. Claim exactly one roadmap task ID at a time.
2. Check dependencies in `ROADMAP.md` before making changes. If a dependency is incomplete, do not start the task.
3. Keep the write set narrow. Edit only the task paths plus directly adjacent files that are required to make the change coherent.
4. Run the verification command or gather the required evidence before marking work complete.
5. Document evidence in `ROADMAP.md` and only then change a task from `[ ]` to `[x]`.
6. Update the roadmap changelog on every task handoff or completion.
7. Do not create shadow roadmaps, ad hoc task lists, or undocumented scope expansions.

## Claiming a Task

1. Read the target task in `ROADMAP.md` in full.
2. Confirm every `Depends on` task is complete or explicitly unblocked.
3. Change that task's `Status:` line from `ready` to `in progress - <agent>/<branch>` before editing code or content.
4. If the task requires clarification or a scope change, update the task metadata first, not after implementation.

## Status Conventions

Keep the checkbox state and `Status:` line in sync using valid GitHub Markdown.

- `[ ]` with `Status: ready` means available to claim.
- `[ ]` with `Status: in progress - <agent>/<branch>` means claimed and actively being worked.
- `[ ]` with `Status: blocked - <reason>; waiting on <task ID or external input>` means not complete and not available for parallel duplication.
- `[x]` with `Status: done` means acceptance criteria and verification are complete and evidence is recorded.

Do not invent extra checkbox symbols. Use the `Status:` line for blocked or in-progress work.

## Allowed Scope

- One task ID per branch or workstream.
- One logical change set per task.
- If you discover additional required work outside the task's listed paths, either:
  - update the task's `Paths:` line before editing, or
  - stop and create or reprioritize a separate roadmap task.

Do not silently bundle unrelated fixes.

## Completion Standard

Before changing `[ ]` to `[x]`, all of the following must be true:

1. The task's acceptance criteria are satisfied.
2. The verification command ran successfully, or the required non-command evidence exists and is linked in the changelog.
3. The `Status:` line is changed to `done`.
4. The roadmap changelog gets a new row with:
   - date
   - task ID
   - concise summary
   - tests/evidence
   - PR/commit/reference
5. Any follow-up tasks or newly discovered risks are added back to `ROADMAP.md`.

If any one of those is missing, leave the task unchecked.

## Changelog Requirement

Every agent update to the roadmap must append a row to the `Change Log` table in `ROADMAP.md`.

Required fields:

- `Date`
- `Task ID`
- `Summary`
- `Tests or Evidence`
- `PR / Commit / Ref`

If work is blocked, the changelog row must say what blocked it and what evidence was collected before stopping.

## Parallel-Work Collision Rules

- Never claim the same task ID as another active agent.
- Do not edit files currently owned by another in-progress task unless the owning agent has handed them off in the roadmap or changelog.
- Shared files such as `ROADMAP.md`, `AGENTS.md`, `docs/measurement-plan.md`, route manifests, content manifests, and analytics config are high-collision surfaces. Touch them only when your task explicitly requires it.
- If two tasks need the same shared file, sequence them instead of racing them.
- If you pull fresh changes and see conflicting edits in your task's path set, stop, review the changelog, and either:
  - re-scope to a non-overlapping task, or
  - continue only after updating the roadmap status and noting the collision resolution.

## Evidence Standards

- Prefer repository-local evidence: test output, generated reports, manifest diffs, screenshots committed to the changelog reference, or validator output.
- For legal, brand, or approval-based tasks, the changelog must name the approval artifact or reviewer even if the artifact lives outside the repo.
- For analytics tasks, evidence must include event names and required properties, not just a statement that tracking was added.
- For content-scale tasks, evidence must include route inventory and quality-gate validation, not just file counts.

## Handoff Template

Copy this into your task note or changelog context when handing off incomplete work:

```md
Task: <TASK ID>
Status: in progress | blocked | done
Summary: <one paragraph on what changed or what remains>
Dependencies checked: <IDs and result>
Files changed: <comma-separated paths>
Verification: <command output summary or approval evidence>
Open risks: <flat list or none>
Next recommended step: <single next action>
Ref: <branch / commit / PR / worktree ref>
```

## Fast Start Checklist

1. Open `ROADMAP.md`.
2. Pick one `[ ]` task with `Status: ready`.
3. Confirm dependencies are done.
4. Claim it by updating the `Status:` line.
5. Make the smallest coherent change set.
6. Run verification or capture required evidence.
7. Update the changelog.
8. Only then mark the checkbox complete.
