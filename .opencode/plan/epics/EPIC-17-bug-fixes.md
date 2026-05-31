# EPIC 17 — Bug Fixes

## Objective
Fix critical and high-impact bugs that affect core functionality and user experience.

## Motivation
The trust score slider mismatch (0-100 vs 0-10) causes validation errors for users, making the trust filter unusable at any value above 10. This is a critical bug that must be resolved first.

## Deliverables
- Fix minTrustScore slider range mismatch

## Related Improvements
- 01-minTrustScore-fix (Critical)

## Priority
Critical — blocks trust filter functionality

## Dependencies
None

## Tasks
- US-17.1: Fix minTrustScore slider range (0-100 → 0-10)

## Acceptance Criteria
- Trust score slider works without validation errors
- Values between 0 and 10 (inclusive) are accepted
- Decimal values (e.g., 6.5) are supported
- Backend validation remains consistent (0-10)

---

