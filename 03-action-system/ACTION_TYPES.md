# Action Types

Complete specification of all actions available in the dashboard. Each action includes triggers, workflow, generated content, and tracking requirements.

---

## Action Overview

| Action | Context | Creates | Sends Email |
|--------|---------|---------|-------------|
| Assign Mentor | Staff underperforming | Mentor relationship + Tasks | Yes (with approval) |
| Prepare Performance Review | Staff needs coaching | Document + Task | No |
| Generate Training Recommendation | Skill gap identified | Document + Task | No |
| Generate Location Comparison | Location underperforming | Report document | No |
| Set Benchmark Target | After comparison | Tracked goal | No |
| Request SOP Upload | Best practice capture | Prompt + storage | No |
| Generate Playbook | After SOP upload | Document | No |
| Start Vendor Workflow | Vendor issues | Workflow + Tasks | Yes (with approval) |
| Create Task | Any context | Task | No |
| Export Report | Any dashboard view | PDF file | No |
| Schedule Summary Email | User preference | Scheduled job | Yes (automated) |

---

## Action: Assign Mentor

### Purpose
Pair a struggling processor with a top performer for coaching.

### Trigger Context
- Insight: Staff significantly below average
- Insight: Staff high exception rate
- Manual: Manager selects from Staff tab

### UI Flow

```
1. User clicks "Assign Mentor" on insight or staff row
2. Drawer opens with:
   - Mentee info (current metrics)
   - Recommended mentors (top performers in same/nearby location)
   - Mentor selection dropdown
   - Reason/focus area input
   - Email preview
3. User selects mentor, optionally edits email
4. User clicks "Assign & Send Email"
5. System: Creates relationship, sends emails, creates follow-up task
6. Drawer shows confirmation with next steps
```

### Mentor Selection Logic

```python
def get_recommended_mentors(mentee_id, limit=5):
    mentee = get_user(mentee_id)
    
    # Get top performers
    candidates = get_users_by_performance(
        location_ids=[mentee.location_id],  # Same location first
        min_performance_category='above_average',
        exclude_ids=[mentee_id]
    )
    
    # If not enough, expand to region
    if len(candidates) < limit:
        candidates += get_users_by_performance(
            region=mentee.region,
            min_performance_category='exceptional',
            exclude_ids=[mentee_id] + [c.id for c in candidates]
        )
    
    # Sort by: same location > exceptional > above average
    return sorted(candidates, key=lambda c: (
        c.location_id == mentee.location_id,
        c.performance_category == 'exceptional',
        c.processing_volume
    ), reverse=True)[:limit]
```

### Generated Email Content

**To Mentor:**
```
Subject: Mentorship Request: {mentee_name}

Hi {mentor_name},

You've been identified as a top performer, and we'd like to pair you with 
{mentee_name} for mentorship support.

Why you were selected:
- Your processing volume: {mentor_volume}/day (team avg: {team_avg})
- Your exception rate: {mentor_exception_rate}% (team avg: {team_exception_rate}%)
- {specific_strength}

Focus areas for {mentee_name}:
- {focus_area_1}
- {focus_area_2}

Suggested format: 2x weekly 30-minute sessions

{manager_name} will follow up to coordinate schedules.

Best,
{sender_name}
```

**To Mentee:**
```
Subject: Mentorship Pairing: {mentor_name}

Hi {mentee_name},

To support your development, we're pairing you with {mentor_name}, one of 
our top performers.

What to expect:
- Regular check-ins (suggested: 2x weekly, 30 min)
- Focus on: {focus_areas}
- Duration: Typically 4-8 weeks

{mentor_name}'s strengths:
- {strength_1}
- {strength_2}

{manager_name} will help coordinate your first meeting.

Best,
{sender_name}
```

### Data Created

**Mentor Relationship Record:**
```json
{
  "mentor_id": "user_456",
  "mentee_id": "user_123",
  "status": "active",
  "reason": "Processing volume 23% below average",
  "focus_areas": ["GL code assignment", "Exception handling"],
  "started_at": "2026-02-15T10:30:00Z",
  "next_followup_due": "2026-02-22"
}
```

**Tasks Created:**
1. "Schedule first mentor meeting" — Assigned to manager, due in 3 days
2. "Week 1 mentor check-in" — Assigned to manager, due in 7 days

### Follow-up System

- **Weekly prompt:** Dashboard shows "Mentor check-in due" for active relationships
- **Status options:** On track, Needs attention, Completed
- **Metrics tracking:** Compare mentee's performance before/after

---

## Action: Prepare Performance Review

### Purpose
Generate talking points and documentation for a 1:1 performance conversation.

### Trigger Context
- Insight: Staff performance issues
- Manual: Manager clicks on staff member

### Generated Content

```markdown
# Performance Review Preparation
## {employee_name} | {date}

### Current Performance Summary

| Metric | Value | Team Avg | Status |
|--------|-------|----------|--------|
| Daily Volume | {volume} | {team_avg} | {status_emoji} |
| Exception Rate | {exc_rate}% | {team_exc_rate}% | {status_emoji} |
| Processing Time | {time} days | {team_time} days | {status_emoji} |

### Performance Category: {category}
{category_explanation}

### Key Observations

**Strengths:**
{ai_generated_strengths}

**Areas for Improvement:**
{ai_generated_improvements}

### Exception Analysis

Top exception types for {name}:
1. {exc_type_1}: {count_1} ({pct_1}%)
2. {exc_type_2}: {count_2} ({pct_2}%)
3. {exc_type_3}: {count_3} ({pct_3}%)

### Suggested Discussion Topics

1. **Workload Assessment**
   - Current: {volume}/day, Target: {target}/day
   - Question: "How are you feeling about your current workload?"

2. **{primary_issue} Discussion**
   - Data: {supporting_data}
   - Question: "{suggested_question}"

3. **Support & Resources**
   - Question: "What would help you be more successful?"
   - Possible options: {mentor_option}, {training_option}

### 30-Day Goals (Suggested)

1. Increase daily volume to {target_volume}
2. Reduce {exception_type} exceptions by 25%
3. {custom_goal}

### Follow-up Actions

- [ ] Schedule next 1:1 in 2 weeks
- [ ] {action_item_1}
- [ ] {action_item_2}
```

### Task Created
"Conduct 1:1 with {name}" — Assigned to manager, due in 5 days

---

## Action: Generate Training Recommendation

### Purpose
Create a training brief that identifies skill gaps and recommended curriculum.

### Trigger Context
- Insight: Training opportunity detected
- Insight: High exception rate with dominant type
- Manual: Manager identifies training need

### Training Type Mapping

| Exception Pattern | Training Type | Focus Areas |
|-------------------|---------------|-------------|
| GL Code Missing >15% | GL Code Training | Expense categories, GL structure, common mappings |
| Missing PO >15% | PO Compliance Training | PO lookup, exceptions process, vendor communication |
| Vendor Mapping >10% | Vendor Master Training | Vendor setup, name matching, duplicate detection |
| Amount Mismatch >5% | Invoice Verification | 3-way match, variance tolerance, escalation |
| Duplicate Invoice >3% | Invoice Verification | Duplicate detection, system flags, prevention |

### Generated Content

```markdown
# Training Recommendation
## {training_type} for {entity_name}

### Why This Training

**Trigger:** {exception_type} exceptions at {rate}% (benchmark: <{threshold}%)

**Impact:** 
- Current monthly cost: ${current_cost}
- Projected savings after training: ${projected_savings} (40-60% reduction)

### Current State

| Metric | Value | Target |
|--------|-------|--------|
| {exception_type} Rate | {current_rate}% | <{target_rate}% |
| Related Exceptions/Month | {count} | <{target_count} |
| Processing Time Impact | +{time} days | +0 days |

### Recommended Training Modules

1. **{module_1_name}** (45 min)
   - {module_1_description}
   - Key topics: {topics}

2. **{module_2_name}** (30 min)
   - {module_2_description}
   - Key topics: {topics}

3. **Practical Exercise** (30 min)
   - Work through {n} real exception examples
   - Apply learned concepts

### Success Metrics

After training, measure:
- {exception_type} rate: Target <{target}%
- Time to resolution: Target <{time} days
- Repeat error rate: Target <5%

### Timeline

| Milestone | Target Date |
|-----------|-------------|
| Training initiated | {date + 7 days} |
| Training completed | {date + 14 days} |
| First metrics check | {date + 30 days} |
| Second metrics check | {date + 60 days} |

### Next Steps

1. [ ] Schedule training session(s)
2. [ ] Notify {name} of training plan
3. [ ] Mark training as initiated when started
4. [ ] Mark complete when finished
```

### Data Created

**Training Record:**
```json
{
  "user_id": "user_123",
  "training_type": "gl_code",
  "status": "recommended",
  "metrics_at_recommendation": {
    "gl_exception_rate": 0.23,
    "monthly_exceptions": 42
  },
  "focus_areas": ["Expense categories", "GL structure"]
}
```

### Task Created
"Arrange {training_type} training for {name}" — Assigned to manager

---

## Action: Start Vendor Workflow

### Purpose
Initiate a structured improvement process for a problematic vendor.

### Trigger Context
- Insight: Vendor critical issues
- Insight: Vendor high missing PO rate
- Insight: Vendor processing delays
- Manual: Manager selects vendor

### Workflow Stages

```
Identified → Assigned → Contacted → Responded → In Progress → Resolved
                                                          ↘ Escalated
```

### UI Flow

```
1. User clicks "Start Vendor Workflow" 
2. Drawer opens with:
   - Vendor current metrics
   - Issue summary
   - Owner assignment dropdown
   - Email template (editable)
   - Expected resolution timeline
3. User assigns owner, reviews/edits email
4. User clicks "Start Workflow" or "Start & Send Email"
5. System creates workflow, optionally sends email
6. Workflow appears in Vendor Actions section
```

### Email Templates by Issue Type

**Missing PO Template:**
```
Subject: Invoice PO Compliance - {vendor_name}

Dear {vendor_contact},

We're reaching out regarding purchase order compliance on your invoices 
to {company_name}.

Current situation:
- {pct}% of your invoices are missing purchase orders
- This affects approximately {count} invoices per month
- Average processing delay: {delay} days

Including PO numbers on invoices helps us:
- Process your invoices faster
- Ensure timely payment
- Reduce back-and-forth communication

Requested action:
Please include the PO number on all future invoices. You can find your 
PO numbers in {po_lookup_instructions}.

If you have questions about PO requirements, please contact {ap_contact}.

Thank you for your partnership.

Best regards,
{sender_name}
{company_name} Accounts Payable
```

**High Error Rate Template:**
```
Subject: Invoice Quality Review - {vendor_name}

Dear {vendor_contact},

We'd like to discuss invoice quality to help ensure faster processing 
and payment of your invoices.

Current observations:
- Error rate: {error_rate}% (our average vendor: {avg_rate}%)
- Common issues: {common_issues}
- Impact: Processing delays of {delay} days

We'd like to schedule a brief call to:
1. Review specific examples
2. Understand any challenges on your end
3. Agree on improvements

Please let us know your availability for a 30-minute call in the next week.

Best regards,
{sender_name}
```

### Data Created

**Vendor Workflow:**
```json
{
  "vendor_id": "vendor_123",
  "issue_type": "missing_po",
  "status": "assigned",
  "owner_id": "user_456",
  "cost_impact": 8240,
  "metrics_at_start": {
    "po_match_rate": 0.32,
    "avg_processing_time": 47.1
  }
}
```

### Tracking & Escalation

**Status Updates:**
- Owner can update status from workflow detail view
- Each status change logged with timestamp and notes
- Automated reminder if no update in 7 days

**Escalation Triggers:**
- No response after 14 days of initial contact
- No improvement after 30 days in "In Progress"
- Owner marks as "Needs escalation"

---

## Action: Set Benchmark Target

### Purpose
Create a trackable improvement goal based on a best performer.

### Trigger Context
- After viewing location comparison
- After reviewing staff performance gap
- Manual goal setting

### UI Flow

```
1. User views comparison (location A vs location B)
2. User clicks "Set Target" on a specific metric
3. Modal shows:
   - Current value: {current}
   - Benchmark (best performer): {benchmark}
   - Suggested target: {suggested} (e.g., 80% of gap)
   - Target date selector
4. User adjusts target and date
5. System creates benchmark target
6. Target appears in dashboard with progress tracking
```

### Progress Tracking

```python
def update_benchmark_progress(target_id):
    target = get_target(target_id)
    current = get_current_metric_value(target.metric, target.entity_id)
    
    # Calculate progress
    total_gap = target.baseline_value - target.target_value
    closed_gap = target.baseline_value - current
    progress_pct = closed_gap / total_gap * 100
    
    # Determine status
    days_remaining = (target.target_date - today).days
    expected_progress = (1 - days_remaining / total_days) * 100
    
    if current <= target.target_value:
        status = 'achieved'
    elif progress_pct >= expected_progress - 10:
        status = 'on_track'
    else:
        status = 'at_risk'
    
    update_target(target_id, current_value=current, status=status)
```

### Dashboard Display

```
┌─────────────────────────────────────────────────────┐
│ Benchmark Targets                                    │
├─────────────────────────────────────────────────────┤
│ LA Exception Rate                                    │
│ Target: 9.0% by Mar 31 (benchmark: Austin)          │
│ Current: 11.2% ████████░░░ 65% progress             │
│ Status: On Track ✓                                   │
├─────────────────────────────────────────────────────┤
│ Chicago Processing Time                              │
│ Target: 5.0 days by Apr 15 (benchmark: Austin)      │
│ Current: 6.8 days ███░░░░░░░ 24% progress           │
│ Status: At Risk ⚠                                    │
└─────────────────────────────────────────────────────┘
```

---

## Action: Create Task

### Purpose
Create an ad-hoc task with context linking.

### UI Flow

```
1. User clicks "+ Create Task" or "Add Task" in context
2. Form shows:
   - Title (required)
   - Description (optional)
   - Assignee (default: self)
   - Due date (optional)
   - Related to: [auto-linked if from insight/entity]
3. User fills and saves
4. Task appears in My Tasks panel
```

### Task Display

```
┌─────────────────────────────────────────────────────┐
│ My Tasks                                    3/5 done │
├─────────────────────────────────────────────────────┤
│ ☑ Review Q4 report                         Jan 15   │
│ ☐ Schedule 1:1 with John Miller            Jan 20   │
│   └─ From: Staff Performance insight                │
│ ☐ Contact Sysco about PO compliance        Jan 22   │
│   └─ From: Vendor workflow                          │
│ ☐ Prepare LA training materials            Jan 25   │
└─────────────────────────────────────────────────────┘
```

### Task Reassignment

```
1. User clicks on task → opens detail view
2. Click "Reassign" 
3. Select new assignee from user list
4. Add optional note
5. Task moves to new assignee's list
6. Activity logged
```

---

## Action: Export Report

### Purpose
Generate PDF of current dashboard view or pre-defined report.

### Report Types

| Type | Content | Length |
|------|---------|--------|
| Executive Summary | KPIs, insights, trends, actions | 1-2 pages |
| QBR | Full quarterly analysis | 4-6 pages |
| Location Report | Single location deep-dive | 2-3 pages |
| Vendor Report | Single vendor analysis | 1-2 pages |
| Team Report | Staff performance summary | 2-3 pages |
| Current View | Export of dashboard as-is | Variable |

### PDF Generation

See [REPORT_TEMPLATES.md](../04-reporting/REPORT_TEMPLATES.md) for detailed specs.

---

## Action: Schedule Summary Email

### Purpose
Set up automated report delivery.

### Configuration Options

| Setting | Options |
|---------|---------|
| Report Type | Executive Summary, Location, Custom |
| Frequency | Daily, Weekly, Monthly |
| Day | Mon-Sun (weekly), 1-28 (monthly) |
| Time | Hour selection in user's timezone |
| Recipients | Email list |
| Scope | All locations or selected |

### UI Flow

```
1. User goes to Reports tab → Scheduled Reports
2. Clicks "New Schedule"
3. Configures:
   - Report type
   - Frequency and timing
   - Scope (locations, date range logic)
   - Recipients
4. Saves schedule
5. System confirms next send date
```

---

## Activity Logging

Every action creates an activity log entry:

```json
{
  "event_type": "action_initiated",
  "event_description": "Mentor assigned: Lara Patel → John Miller",
  "performed_by": "user_manager",
  "action_id": "action_123",
  "insight_id": "insight_456",
  "context_data": {
    "mentee_metrics": { "volume": 65, "exceptions": 52 },
    "mentor_metrics": { "volume": 101, "exceptions": 12 }
  },
  "created_at": "2026-02-15T10:30:00Z"
}
```

All activities visible in Activity Log tab, filterable by:
- Action type
- User involved
- Date range
- Entity (location, vendor, staff)
