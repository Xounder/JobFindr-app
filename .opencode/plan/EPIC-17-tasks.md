# EPIC 17 — Bug Fixes — User Stories

## Epic overview
[EPIC-17-bug-fixes.md](./epics/EPIC-17-bug-fixes.md)

---

## US-17.1: Fix minTrustScore slider range mismatch

| Field | Value |
|-------|-------|
| **Priority** | P0 — Critical |
| **Layer** | Frontend |
| **Estimate** | Small (1 file) |
| **Depends on** | None |

### Description
As a user searching for jobs, I want to adjust the minimum trust score using a slider, so that I can filter jobs by how reliable the source is. Currently the slider shows values from 0-100 with step 5, but the backend API only accepts values between 0 and 10. Any value above 10 causes a `"minTrustScore must be between 0 and 10"` validation error. I need the slider range to match the backend's expected range so that the filter works without errors.

### Acceptance Criteria
1. **Slider range is 0-10**: The slider `max` attribute is changed from `100` to `10`
2. **Step is 0.5**: The slider `step` attribute is changed from `5` to `0.5`, allowing values like `6.5` (consistent with the trust engine default threshold)
3. **Labels are accurate**: The minimum label shows `"0 (Any)"` and the maximum label shows `"10 (Highest)"`
4. **No validation errors**: Any slider value between 0 and 10 (inclusive) sent to the backend does not trigger a validation error
5. **Decimal values work**: Sending a decimal value like `6.5` is accepted and processed correctly
6. **Existing tests pass**: All existing frontend and backend tests continue to pass

### Technical Notes
- File to modify: `apps/frontend/src/components/TrustFilters.tsx`
- Lines 24-25 contain the slider props (`min={0} max={100} step={5}`)
- Backend validation is correct — only the frontend needs to change
- The `NormalizedJob` trust score is always 0-10, so no data mapping needed

### Testing
- Manual: Slide to various positions and verify no API error
- Automated: Update slider test expectations for new range
- Edge case: Value `0` means "no minimum" (any trust score accepted)

---

