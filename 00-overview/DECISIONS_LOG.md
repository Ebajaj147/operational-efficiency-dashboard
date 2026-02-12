# Decisions Log

Record of key product decisions with rationale. Reference this when questions arise about "why we do it this way."

---

## How to Use This Document

1. **Before implementing:** Check if a relevant decision exists
2. **When questions arise:** Reference the rationale, not just the decision
3. **To propose changes:** Add a new decision that supersedes the old one
4. **After user feedback:** Update "Revisit" notes

---

## Index

| ID | Topic | Decision |
|----|-------|----------|
| DEC-001 | Cost Calculation | Fixed $25/hour |
| DEC-002 | Benchmarking | Internal only |
| DEC-003 | Report Builder | Pre-defined templates only |
| DEC-004 | Historical Reports | Regenerate from data |
| DEC-005 | External Integrations | None for V1 |
| DEC-006 | Email Sending | System sends with approval |
| DEC-007 | Mentor Follow-ups | Dashboard prompts, not email |
| DEC-008 | Training Tracking | Manual status updates |
| DEC-009 | Branding | Ottimate only |
| DEC-010 | Threshold Display | Percentages and days |
| DEC-011 | Playbook Generation | Requires SOP upload |
| DEC-012 | Impact Tracking | Inferred correlation |
| DEC-013 | Vendor Portal | Internal workflows only |
| DEC-014 | Task Persistence | User-level, cross-session |
| DEC-015 | Historical Access | Time-range based |

---

## Decisions

### DEC-001: Cost Calculation Rate

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Use fixed $25/hour for all AP cost calculations

**Alternatives Considered:**
- Configurable per customer ($30-50 range)
- Configurable per location (different labor markets)
- Industry average ($30-35 based on research)

**Rationale:**
- Simplicity for V1—one number everywhere
- $25 is conservative and defensible
- Customers won't argue savings are inflated
- Higher rates would inflate impact numbers beyond credibility

**Implications:**
- All cost calculations use this rate
- Cost per invoice = time × $25
- Exception cost = resolution time × $25
- Displayed in reports and insights

**Revisit:** V2 if customers request configurability or complain about accuracy

---

### DEC-002: Benchmarking Approach

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Benchmark only against internal best performers, not industry data

**Alternatives Considered:**
- Include industry benchmarks from research
- Allow both internal and external comparison
- Partner with industry analyst for benchmark data

**Rationale:**
- We don't have reliable, current industry benchmark data
- Internal benchmarks are always relevant ("your Austin office does it, so can LA")
- Avoids debates about benchmark validity or applicability
- Creates aspirational but achievable targets

**Implications:**
- Location comparisons reference best internal location
- Staff comparisons reference team average and top performer
- No "industry average" displayed anywhere

**Revisit:** If we acquire reliable benchmark data through partnerships or research

---

### DEC-003: Report System Architecture

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Pre-defined report templates only; no custom report builder

**Alternatives Considered:**
- Full drag-and-drop report builder
- Semi-custom (select sections to include/exclude)
- Multiple template variants per report type

**Rationale:**
- Custom builders are complex to build and maintain
- Most users don't know what they want until they see it
- Our templates should cover 90%+ of needs
- Reduces support burden (no "how do I build X" questions)

**Implications:**
- Five report templates: Executive Summary, QBR, Location, Vendor, Team
- User controls: scope (locations), time period, comparison period
- No section selection or reordering

**Revisit:** V2 based on customer feedback about missing report needs

---

### DEC-004: Historical Report Access

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Reports regenerate from historical data on demand; no archive of generated PDFs

**Alternatives Considered:**
- Store every generated PDF permanently
- Store PDFs when explicitly "saved" by user
- Hybrid: regenerate but cache recent reports

**Rationale:**
- Simpler architecture—data is source of truth
- User can always regenerate any historical period
- No storage cost for PDF archives
- Historical data retention handles the audit need

**Implications:**
- "January 2026 Executive Summary" regenerates from January data
- Reports may look slightly different if regenerated (layout updates)
- No "exact copy of what was sent" feature

**Revisit:** If customers need audit trail of exact reports shared externally (legal/compliance)

---

### DEC-005: External Integration Scope

**Date:** February 4, 2026  
**Status:** Active

**Decision:** No external integrations for V1 (calendar, Slack, HRIS, etc.)

**Alternatives Considered:**
- Calendar integration for scheduling reviews
- Slack notifications for insights
- HRIS integration for training tracking
- Email integration beyond basic send

**Rationale:**
- External integrations add complexity and support burden
- Each integration requires maintenance as APIs change
- Core value is insight + template + tracking
- Users can copy generated content to external tools

**Implications:**
- "Schedule Review" creates a task, not a calendar event
- No Slack/Teams notifications
- Training completion tracked manually
- Email send is one-way (no inbox integration)

**Revisit:** V2 based on demand; track feature requests to prioritize

---

### DEC-006: Email Sending Capability

**Date:** February 4, 2026  
**Status:** Active

**Decision:** System can send emails on user's behalf with explicit approval

**Alternatives Considered:**
- Generate template only; user copies to their email client
- Auto-send without approval (fully automated)
- Queue for batch approval

**Rationale:**
- Reduces friction while maintaining user control
- User sees exact preview before send
- Single approval click, not copy-paste workflow
- Maintains audit trail of sent communications

**Implications:**
- Mentor assignment sends email to both parties (with approval)
- Vendor outreach sends from dashboard (with approval)
- User sees "Preview Email" → "Approve & Send" flow
- All sent emails logged in activity history

**Revisit:** N/A—this is the right balance

---

### DEC-007: Mentor System Follow-ups

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Weekly follow-up prompts displayed in dashboard, not sent via email

**Alternatives Considered:**
- Email reminders to both mentor and mentee
- No follow-up system (set and forget)
- Configurable: dashboard vs. email

**Rationale:**
- Keeps users engaged with dashboard
- Avoids email fatigue from system messages
- Manager sees prompt when already reviewing performance
- Mentor relationship is manager's responsibility

**Implications:**
- Dashboard shows "Mentor check-in due" prompt
- No email reminders for mentor activities
- Follow-up status tracked in mentor relationship record

**Revisit:** If mentor program adoption is low, consider email option

---

### DEC-008: Training Tracking Approach

**Date:** February 4, 2026  
**Status:** Active

**Decision:** User manually marks training as initiated/complete; we track dates and correlate with metric changes

**Alternatives Considered:**
- LMS integration for automatic tracking
- Detailed module-level tracking
- No training tracking (just recommend)

**Rationale:**
- We're not an LMS—that's not our business
- Simple status tracking is sufficient for our purposes
- Value is in correlating training to outcomes, not tracking curriculum
- Manual update ensures user engagement

**Implications:**
- Training states: Recommended → Initiated → Complete
- User clicks to update status
- System records timestamps
- Inferred impact calculated from post-training metrics

**Revisit:** If customers have specific LMS integration requests with volume

---

### DEC-009: Report Branding

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Ottimate branding only on all reports and exports

**Alternatives Considered:**
- Customer logo upload for reports
- White-label option (no branding)
- Co-branded (both logos)

**Rationale:**
- Simplifies implementation—no logo storage/management
- We don't currently store customer logos anywhere
- Ottimate branding reinforces product value
- Customers sharing reports spread brand awareness

**Implications:**
- All PDFs have Ottimate logo/branding
- No configuration for branding
- "Powered by Ottimate" on all exports

**Revisit:** Enterprise tier feature consideration if demanded

---

### DEC-010: Threshold Expression Format

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Express all thresholds in percentages and days, not statistical terms

**Alternatives Considered:**
- Statistical terms (z-scores, standard deviations)
- Both options shown
- Configurable by user preference

**Rationale:**
- Users understand "20% below average" immediately
- "1.5 standard deviations" requires explanation
- Business language, not academic language
- Backend can use statistics; frontend speaks business

**Implications:**
- UI shows: "23% below team average"
- Not: "Z-score: -1.53"
- Processing time: "2.3 days above average"
- All insights use plain language

**Revisit:** N/A—clear user preference from research

---

### DEC-011: Playbook Generation Requirement

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Cannot generate playbooks from metrics alone; require SOP/documentation upload

**Alternatives Considered:**
- Generate playbooks purely from metric patterns
- Interview-based playbook creation
- Skip playbook feature entirely

**Rationale:**
- Metrics show WHAT is happening, not WHY or HOW
- We know Austin has 91% touchless rate; we don't know their process
- Without SOPs, playbooks would be generic and unhelpful
- Uploading docs enables genuine value creation

**Implications:**
- "Generate Playbook" requires SOP upload first
- Can still generate: Comparison Reports, Benchmark Targets, Hypothesis lists
- SOP upload analyzed for transferable practices
- Feature may have lower adoption (requires user effort)

**Revisit:** If AI capabilities improve to infer processes from patterns

---

### DEC-012: Impact Tracking Approach

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Track inferred impact (correlation), explicitly not claiming causation

**Alternatives Considered:**
- No impact tracking (too hard to prove)
- A/B testing approach (control groups)
- User-attributed impact ("this saved us $X")

**Rationale:**
- Correlation is valuable even without causation proof
- "Since training, GL exceptions down 23%" is useful
- Scientific rigor isn't the goal—directional signal is
- User can decide if correlation is meaningful

**Implications:**
- Display: "Since [action] on [date], [metric] changed [X%]"
- Not: "[Action] caused [X%] improvement"
- Clear labeling: "Inferred Impact" or "Observed Change"
- No statistical significance claims

**Revisit:** N/A—this is the honest approach

---

### DEC-013: Vendor Portal Approach

**Date:** February 4, 2026  
**Status:** Active

**Decision:** No external vendor portal; all vendor actions are internal workflows

**Alternatives Considered:**
- Build vendor self-service portal
- Integration with existing vendor portals
- Vendor-facing communication channel

**Rationale:**
- Building a vendor portal is a separate product
- Current scope is operational intelligence, not vendor management
- Internal workflow tracking serves the core need
- User handles actual vendor communication externally

**Implications:**
- "Add to Portal" becomes "Start Vendor Improvement Workflow"
- Workflow tracks internal status and outreach
- Email templates for vendor communication
- No vendor-facing interface

**Revisit:** V2+ if vendor management becomes strategic priority

---

### DEC-014: Task System Persistence

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Tasks persist at user level, stored in database, accessible across sessions; can be reassigned

**Alternatives Considered:**
- Session-only tasks (lost on logout)
- Shared task pool (everyone sees everything)
- Location-based task pools

**Rationale:**
- Users need to track work across days/weeks
- Personal task list with reassignment flexibility
- Supports handoffs (e.g., vendor negotiation to procurement)
- Standard task management pattern

**Implications:**
- Tasks stored in database with user_id
- "My Tasks" panel shows current user's tasks
- Reassign action changes assignee
- Activity log tracks assignment changes

**Revisit:** N/A—standard pattern

---

### DEC-015: Historical Data Access Pattern

**Date:** February 4, 2026  
**Status:** Active

**Decision:** Access historical data via time-range selection, not via archive of past reports/views

**Alternatives Considered:**
- Archive every generated view/report
- Snapshot system state periodically
- Both: time-range + snapshots

**Rationale:**
- Time-range selection is more flexible
- User can see any period, not just what was previously viewed
- Simpler architecture—one source of truth
- Storage efficient

**Implications:**
- Filters include: time period selector
- Any historical period can be viewed
- Data retention policy determines how far back
- No "what did the dashboard show on January 15" feature

**Revisit:** If audit requirements demand point-in-time snapshots

---

## Decision Template

Use this template for new decisions:

```markdown
### DEC-XXX: [Title]

**Date:** [Date]  
**Status:** Active / Superseded by DEC-XXX

**Decision:** [Clear statement of what was decided]

**Alternatives Considered:**
- [Option 1]
- [Option 2]
- [Option 3]

**Rationale:**
- [Why this decision makes sense]
- [Trade-offs accepted]
- [Constraints that drove the decision]

**Implications:**
- [What this means for implementation]
- [What this means for users]
- [What this prevents/enables]

**Revisit:** [Conditions that would trigger reconsideration]
```

---

## Superseded Decisions

None yet. When a decision is changed, move it here with a note pointing to the new decision.
