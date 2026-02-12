# Lessons Learned

Capture learnings and patterns here to avoid repeating mistakes.

---

## Format

Each lesson should follow this format:

```
### LESSON-XXX: [Title]
**Date:** [When learned]
**Context:** [What was happening]
**Mistake:** [What went wrong]
**Fix:** [How it was resolved]
**Rule:** [Pattern to follow going forward]
```

---

## Product Decisions

### LESSON-001: Actions Must Be Real
**Date:** February 4, 2026
**Context:** Designing action buttons for insights
**Mistake:** Initially considered fake confirmations ("Meeting scheduled!")
**Fix:** Redesigned all actions to either do something real or generate useful content
**Rule:** Never fake an action. Either execute it, generate content for manual execution, or don't offer it.

### LESSON-002: Can't Generate Playbooks from Metrics
**Date:** February 4, 2026
**Context:** Planning "Create Playbook" feature for best-performing locations
**Mistake:** Assumed we could generate process documentation from performance data
**Fix:** Recognized metrics show WHAT, not HOW. Require SOP upload for playbook generation.
**Rule:** Be honest about what data can tell us. Metrics show outcomes, not processes.

### LESSON-003: Thresholds in Business Language
**Date:** February 4, 2026
**Context:** Displaying performance comparisons
**Mistake:** Initially used z-scores and statistical terminology
**Fix:** Converted all thresholds to percentages and days
**Rule:** Express everything in terms users understand immediately. No jargon.

---

## Technical Decisions

### LESSON-004: [To be added during implementation]

---

## User Feedback

### LESSON-005: [To be added during design partner sessions]

---

## Implementation Notes

### LESSON-006: [To be added during development]
