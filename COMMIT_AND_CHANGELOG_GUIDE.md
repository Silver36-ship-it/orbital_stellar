# Commit Messages & Changelog Entries

## 📝 Suggested Commit Messages

### Main Commit

```
feat(pulse-webhooks): add structured dead letter queue with URL and time-window filtering

- Introduce DeadLetterStore class with queryable failure tracking
- Support filtering by URL (exact match), time range (since/until), and limit
- Auto-track failed deliveries in WebhookDelivery with dlqId correlation
- Add comprehensive index guidance for adapter authors (URL, timestamp, composite)
- Include 13 test cases covering all filter combinations

Closes #2.46
```

### Alternative (Detailed) Commit Format

```
feat(pulse-webhooks): implement dead letter queue with structured filtering

This implements a fully-queryable Dead Letter Queue (DLQ) for tracking
failed webhook deliveries across the Orbital webhook system.

Features:
- DeadLetterStore class with add/get/remove/list/clear operations
- Structured querying by URL (exact), time window (inclusive), and limit
- Automatic failure tracking integrated with WebhookDelivery
- dlqId correlation in webhook.failed and webhook.dropped events

API:
  DeadLetterStore.list(filter) supports:
  - url: exact endpoint match
  - since: timestamp >= value (inclusive)
  - until: timestamp <= value (inclusive)
  - limit: max entries (sorted oldest first)

Testing:
  - 13 comprehensive test cases
  - All filter combinations tested
  - Integration tests verify auto-tracking

Docs:
  - Added DLQ section to README with usage examples
  - Added index requirements for database adapters
  - Query pattern -> index mapping table

Closes #2.46
Milestone: M4 — Replay primitives
Complexity: Trivial — 100 Points
```

---

## 📋 CHANGELOG Entry

### Location

Add to the appropriate section in:

- Root: `CHANGELOG.md`
- Package: `packages/pulse-webhooks/CHANGELOG.md`

### Format

#### For `packages/pulse-webhooks/CHANGELOG.md`

````markdown
## [Unreleased]

### Added

#### Dead Letter Queue (DLQ) for Failed Deliveries

- New `DeadLetterStore` class for tracking failed webhook deliveries
- Structured querying via `list(filter)` with support for:
  - URL filtering (exact match)
  - Time-window filtering (inclusive `since` and `until`)
  - Result limiting with oldest-first ordering
- Auto-tracking of failed deliveries in `WebhookDelivery`
- `dlqId` correlation in `webhook.failed` and `webhook.dropped` events
- Index guidance for adapter authors implementing database persistence

```typescript
const dlq = new DeadLetterStore();
const delivery = new WebhookDelivery(watcher, config, dlq);

// Query failures by URL in last 24 hours
const failures = dlq.list({
  url: "https://example.com/webhooks",
  since: Date.now() - 24 * 60 * 60 * 1000,
  limit: 100,
});
```
````

#### Documentation Improvements

- Added comprehensive DLQ usage guide to README
- Added SQL index recommendations for production deployments
- Query pattern → index mapping for adapter authors

### Changed

#### WebhookDelivery

- Constructor now accepts optional `dlq?: DeadLetterStore` parameter (optional, backward compatible)
- Failed deliveries now include `dlqId` in event metadata for traceability

### Technical Details

- Unique DLQ entry IDs: `dlq_<counter>_<timestamp>_<random>`
- Filter semantics: URL exact match, time range inclusive
- Sort order: oldest first (by timestamp)
- **No breaking changes** — fully backward compatible

---

#### For Root `CHANGELOG.md` (High-Level Summary)

```markdown
## [Unreleased]

### Added

#### @orbital/pulse-webhooks

- **Dead Letter Queue (DLQ)**: New `DeadLetterStore` class for querying failed webhook deliveries by URL, time window, and limit
- Automatic failure tracking integrated with `WebhookDelivery`
- Index guidance for adapter authors implementing database persistence
- 13 comprehensive tests covering all filter combinations
```

---

## 🏷️ Git Tag (if applicable for release)

For Phase 0 release:

```
git tag -a v0.1.0 -m "Phase 0: Foundation

- pulse-core: EventEngine with Horizon subscription and event normalization
- pulse-webhooks: HMAC-signed delivery with DLQ and structured failure querying
- pulse-notify: React hooks for live Stellar events

Features:
- Full classic operation taxonomy
- HMAC-SHA256 signing and verification
- Webhook retry with exponential backoff
- Dead Letter Queue with URL/time filtering
- Edge-runtime webhook verification
- React hooks: useStellarEvent, useStellarPayment, useStellarActivity"
```

---

## 📌 PR Title Variations

### Concise (Recommended)

```
feat(pulse-webhooks): add dead letter queue with filtering
```

### Descriptive

```
feat(pulse-webhooks): implement DLQ for webhook failure tracking with URL and time-window filtering
```

### With Issue Reference

```
feat(pulse-webhooks): DLQ inspection with URL and time window filtering (#2.46)
```

### With Milestone

```
feat(pulse-webhooks): add dead letter queue (M4 - Replay primitives)
```

---

## 🔍 PR Description Template (Quick Version)

For those who want a shorter PR description:

````markdown
## Description

Implements a structured Dead Letter Queue (DLQ) for tracking failed webhook deliveries with support for querying by URL, time window, and limit.

## Changes

- New `DeadLetterStore` class with add/list/get/remove/clear operations
- Integration with `WebhookDelivery` for auto-tracking failures
- 13 comprehensive test cases
- Updated README with DLQ usage and database index guidance

## Type

- Feature

## Related Issue

Closes #2.46

## Testing

```bash
npm test -- --grep "DeadLetterStore"
```
````

````

---

## 🎯 Squash vs. Multi-Commit Strategy

### Option 1: Single Squashed Commit (Recommended for small PRs)
```bash
git commit --all -m "feat(pulse-webhooks): add dead letter queue with filtering

- Introduce DeadLetterStore class with structured failure tracking
- Support URL, time-range, and limit filtering
- Auto-track failed deliveries in WebhookDelivery
- Add 13 comprehensive test cases
- Document index requirements for adapters

Closes #2.46"
````

### Option 2: Logical Multi-Commit (if breaking into logical units)

```
1. feat(pulse-webhooks): add DeadLetterStore class with core filtering
2. test(pulse-webhooks): add comprehensive DLQ test suite
3. docs(pulse-webhooks): add DLQ usage guide and index recommendations
4. feat(pulse-webhooks): integrate DLQ with WebhookDelivery
```

---

## 📚 Conventional Commits Reference

This PR follows [Conventional Commits](https://www.conventionalcommits.org/):

**Type:** `feat` (feature)  
**Scope:** `pulse-webhooks`  
**Description:** `add dead letter queue with filtering`  
**Body:** Detailed explanation of changes  
**Footer:** `Closes #2.46`

### Example Full Format

```
type(scope): subject

body

footer
```

---

## ✅ Pre-Submission Checklist

Before submitting the PR:

- [ ] Branch name follows convention: `feat/dlq-filtering` or similar
- [ ] Commit messages follow Conventional Commits
- [ ] Code passes linting: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] TypeScript compiles: `npm run build`
- [ ] CHANGELOG.md updated
- [ ] README updated with new features
- [ ] No breaking changes to public API
- [ ] Code review completed
- [ ] PR description filled out completely
