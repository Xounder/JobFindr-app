---
description: Audit .opencode/ .md files for duplicates and intra-file prompt duplication (excludes /plan folder)
---

# Doc Audit Command

Run the doc-audit skill to analyze all `.md` files in `.opencode/` (excluding `/plan` folder) for:

1. **File-level duplicates/similarities** - Files covering same topics with overlapping content
2. **Intra-file prompt duplication** - Repeated prompts/sections within the same file

## Usage

```
/doc-audit
```

## What it does

1. Reads `.opencode/docs-catalog.md` to understand document purposes
2. Scans all `.md` files in `.opencode/` recursively (excluding `.opencode/plan/`)
3. Detects duplicates and similarities
4. **Presents each finding for your approval** before making any changes
5. Consolidates only after explicit "yes" confirmation
6. Updates `docs-catalog.md` after structural changes
7. Enforces 400-line file size limit (splits with index.md if needed)

## Example Output

```
## Finding: File Duplicate

**Files Involved:**
- File A: `.opencode/architecture/01-system-overview.md` (lines 1-50)
- File B: `.opencode/architecture/architecture.md` (lines 1-45)

**Why Consolidate:**
Both files cover system overview with 80% overlapping content. architecture.md is the index file.

**Proposed Result:**
Merge unique content into architecture.md, remove 01-system-overview.md, update docs-catalog.md

**Approve? (yes/no/modify):**
```

Wait for your response before proceeding.