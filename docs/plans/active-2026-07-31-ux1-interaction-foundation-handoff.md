# UX1 Interaction Foundation And Copy Inventory Handoff

Status: accepted
Authorization date: 2026-07-31
Authorized by: project owner
Baseline for authorization: `fe5ec52` (RA-RC1 accepted)
Priority: P0 UX foundation — entry gate for UX2-UX6

## Scope

UX1 inventories every user-facing interaction surface in the current Rho desktop
app and defines the terminology, message, and state contracts that UX2-UX6 will
implement. It changes no product behavior and adds no new backend claims.

### Deliverables

1. **Interaction inventory**: every primary action, prompt, confirm, empty state,
   toast, error message, approval label, internal ID display, and Clear action
   in the current baseline — mapped to owning surface and backend contract.
2. **Terminology contract**: mapping from internal terms (Workspace R, Agent
   runtime, artifact, approval request, revision, etc.) to default user-facing
   terms, with rules for when the internal term remains visible.
3. **State presentation contract**: required presentation for each of the 11
   states (ready, loading, running, waiting, completed, warning, failed,
   stopped, changed/stale, unavailable, empty).
4. **Message component model**: `outcome → consequence → recommended action →
   details` formula applied to each identified interaction.
5. **Deterministic mock fixtures**: representative state-by-state mock data
   covering all identified surfaces for browser-mode parity testing.
6. **Task-based usability protocol**: 10 scenarios from the design doc, with
   success criteria and measurement points.

### Rules

- No product-code changes. This is documentation and fixture work only.
- No unsupported backend behavior claims. Every mapped term must have a working
  backend contract.
- Terminology decisions are recorded as the UX language contract that UX2-UX6
  will implement.
- The inventory documents current state honestly — even where it violates the
  intended contract. UX2-UX6 fix those gaps.

## Out of scope

- implementing any UX change (that's UX2-UX6)
- changing backend behavior, approvals, routing, or persistence
- visual design tokens, icons, or layout (modernization Phase 1 owns those)
- posture implementation (separate contract)

## Acceptance gate

> Every decision has a named operation, scope, consequence, recovery behavior,
> and owning backend contract; no ambiguous Clear or generic approval remains
> undocumented.

## Version

UX1 does not bump the application version (no product-code changes).
