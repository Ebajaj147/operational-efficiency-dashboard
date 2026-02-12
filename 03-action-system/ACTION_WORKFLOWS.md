# Action Workflows

Complete end-to-end workflows for every action in the system. This document specifies the exact sequence of operations, API calls, database changes, and UI states for each action.

---

## Workflow Principles

1. **Every action has a clear end state** — User knows when it's complete
2. **Every action creates a record** — Full audit trail in activity log
3. **No fake confirmations** — Actions either do something real or generate useful content
4. **Graceful failure handling** — Clear error messages, retry options

---

## Action: Assign Mentor

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                              │
│ User clicks "Assign Mentor" from:                                   │
│ • Insight card action button                                        │
│ • Staff table row action menu                                       │
│ • Staff detail page                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: OPEN DRAWER                                                  │
│                                                                      │
│ API Call: GET /api/actions/mentor/prepare?mentee_id={id}            │
│                                                                      │
│ Response:                                                            │
│ {                                                                    │
│   "mentee": { id, name, location, metrics },                        │
│   "recommended_mentors": [                                          │
│     { id, name, location, metrics, match_score, match_reasons }     │
│   ],                                                                 │
│   "focus_areas_suggested": ["GL codes", "Exception handling"],      │
│   "email_templates": {                                              │
│     "to_mentor": "...",                                             │
│     "to_mentee": "..."                                              │
│   }                                                                  │
│ }                                                                    │
│                                                                      │
│ UI State: Drawer opens with mentor selection form                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: USER CONFIGURATION                                           │
│                                                                      │
│ User selects:                                                        │
│ • Mentor from dropdown (required)                                   │
│ • Focus areas (multi-select, at least 1)                           │
│ • Email customization (optional edits)                              │
│ • Send emails checkbox (default: checked)                           │
│                                                                      │
│ UI Validation:                                                       │
│ • Mentor must be selected                                           │
│ • At least one focus area                                           │
│ • Email content not empty if sending                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: CONFIRMATION DIALOG                                          │
│                                                                      │
│ "Assign {mentor_name} as mentor for {mentee_name}?"                 │
│                                                                      │
│ Summary shown:                                                       │
│ • Mentor: Lara Patel (Austin)                                       │
│ • Mentee: John Miller (LA)                                          │
│ • Focus: GL codes, Exception handling                               │
│ • Emails will be sent: Yes                                          │
│                                                                      │
│ Buttons: [Cancel] [Confirm & Assign]                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: EXECUTE ACTION                                               │
│                                                                      │
│ API Call: POST /api/actions/mentor/assign                           │
│                                                                      │
│ Request Body:                                                        │
│ {                                                                    │
│   "mentor_id": "user_001",                                          │
│   "mentee_id": "user_008",                                          │
│   "focus_areas": ["GL codes", "Exception handling"],                │
│   "reason": "Processing volume 23% below average",                  │
│   "send_emails": true,                                              │
│   "email_content": {                                                │
│     "to_mentor": "...",                                             │
│     "to_mentee": "..."                                              │
│   },                                                                 │
│   "triggered_by_insight_id": "insight_456"                          │
│ }                                                                    │
│                                                                      │
│ Backend Operations:                                                  │
│ 1. Create mentor_relationships record                               │
│ 2. Create mentor_followups record (due in 7 days)                   │
│ 3. Create tasks:                                                     │
│    - "Schedule first meeting" (due: 3 days)                         │
│    - "Week 1 check-in" (due: 7 days)                                │
│ 4. Send emails (if enabled)                                         │
│ 5. Create activity_log entry                                        │
│ 6. Mark insight as "action_taken" (if from insight)                 │
│                                                                      │
│ Response:                                                            │
│ {                                                                    │
│   "success": true,                                                   │
│   "relationship_id": "rel_123",                                     │
│   "tasks_created": ["task_1", "task_2"],                            │
│   "emails_sent": ["mentor@company.com", "mentee@company.com"]       │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: SUCCESS STATE                                                │
│                                                                      │
│ Drawer updates to show:                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Mentor Assigned Successfully                                  │ │
│ │                                                                 │ │
│ │ Lara Patel → John Miller                                       │ │
│ │                                                                 │ │
│ │ What happens next:                                              │ │
│ │ • Emails sent to both parties                                  │ │
│ │ • Task created: "Schedule first meeting" (due Jan 20)          │ │
│ │ • You'll be prompted for a check-in in 7 days                  │ │
│ │                                                                 │ │
│ │ Track progress in Staff → John Miller → Mentorship             │ │
│ │                                                                 │ │
│ │ [View Relationship] [Close]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Changes

```sql
-- 1. Create mentor relationship
INSERT INTO dashboard.mentor_relationships (
    id, mentor_id, mentee_id, status, reason, focus_areas,
    started_at, created_by, metrics_at_start
) VALUES (
    'rel_123', 'user_001', 'user_008', 'active',
    'Processing volume 23% below average',
    ['GL codes', 'Exception handling'],
    NOW(), 'user_manager',
    '{"mentee_volume": 65, "mentee_exceptions": 52}'
);

-- 2. Create initial follow-up
INSERT INTO dashboard.mentor_followups (
    id, relationship_id, due_date, status, followup_type
) VALUES (
    'followup_1', 'rel_123', NOW() + INTERVAL 7 DAY, 'pending', 'week_1'
);

-- 3. Create tasks
INSERT INTO dashboard.tasks (id, title, assigned_to, due_date, related_type, related_id)
VALUES 
    ('task_1', 'Schedule first mentor meeting with Lara and John', 'user_manager', NOW() + INTERVAL 3 DAY, 'mentor_relationship', 'rel_123'),
    ('task_2', 'Week 1 mentor check-in: Lara → John', 'user_manager', NOW() + INTERVAL 7 DAY, 'mentor_relationship', 'rel_123');

-- 4. Log activity
INSERT INTO dashboard.activity_log (
    event_type, event_description, performed_by, 
    related_type, related_id, context_data
) VALUES (
    'mentor_assigned',
    'Mentor assigned: Lara Patel → John Miller',
    'user_manager',
    'mentor_relationship', 'rel_123',
    '{"mentor_id": "user_001", "mentee_id": "user_008", "focus_areas": ["GL codes", "Exception handling"]}'
);
```

### Follow-up Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 7 DAYS LATER: FOLLOW-UP PROMPT                                       │
│                                                                      │
│ Dashboard shows notification:                                        │
│ "Mentor check-in due: Lara Patel → John Miller"                     │
│                                                                      │
│ Click opens follow-up form:                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Week 1 Check-in                                                 │ │
│ │                                                                 │ │
│ │ How is the mentorship progressing?                              │ │
│ │ ○ On Track - Meetings happening, progress visible               │ │
│ │ ○ Needs Attention - Some issues to address                      │ │
│ │ ○ Not Started - Haven't met yet                                 │ │
│ │                                                                 │ │
│ │ Notes (optional):                                               │ │
│ │ [                                                    ]          │ │
│ │                                                                 │ │
│ │ John's metrics since pairing:                                   │ │
│ │ • Volume: 65 → 68 (+5%)                                        │ │
│ │ • Exceptions: 52 → 48 (-8%)                                    │ │
│ │                                                                 │ │
│ │ [Save Check-in]                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Completion Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPLETING A MENTORSHIP                                              │
│                                                                      │
│ After 4-8 weeks, manager can mark complete:                         │
│                                                                      │
│ API: POST /api/actions/mentor/{relationship_id}/complete            │
│                                                                      │
│ Request:                                                             │
│ {                                                                    │
│   "outcome": "successful",                                          │
│   "notes": "John improved significantly...",                        │
│   "metrics_improvement": {                                          │
│     "volume_change_pct": 18,                                        │
│     "exception_change_pct": -35                                     │
│   }                                                                  │
│ }                                                                    │
│                                                                      │
│ This creates an "inferred impact" record linking the mentorship     │
│ to the performance improvement (correlation, not causation).        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Action: Start Vendor Workflow

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                              │
│ User clicks "Start Vendor Workflow" from:                           │
│ • Vendor insight card                                               │
│ • Vendor table row action                                           │
│ • Vendor detail page                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: OPEN WORKFLOW DRAWER                                         │
│                                                                      │
│ API Call: GET /api/actions/vendor-workflow/prepare?vendor_id={id}   │
│                                                                      │
│ Response:                                                            │
│ {                                                                    │
│   "vendor": { id, name, metrics, issue_summary },                   │
│   "detected_issues": [                                              │
│     { type: "missing_po", severity: "critical", pct: 68 },          │
│     { type: "processing_delay", severity: "warning", days: 47 }     │
│   ],                                                                 │
│   "recommended_workflow_type": "po_compliance",                     │
│   "cost_impact": 8240,                                              │
│   "email_template": "...",                                          │
│   "available_owners": [{ id, name }]                                │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: CONFIGURE WORKFLOW                                           │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Start Vendor Improvement Workflow                               │ │
│ │                                                                 │ │
│ │ Vendor: Worldwide Produce                                       │ │
│ │ Issue: 68% of invoices missing PO                               │ │
│ │ Cost Impact: $8,240/month                                       │ │
│ │                                                                 │ │
│ │ Workflow Type: [PO Compliance ▼]                                │ │
│ │                                                                 │ │
│ │ Assign Owner: [Sarah Wilson ▼]                                  │ │
│ │                                                                 │ │
│ │ Target Resolution: [30 days ▼]                                  │ │
│ │                                                                 │ │
│ │ ☑ Send initial outreach email                                   │ │
│ │                                                                 │ │
│ │ Email Preview:                                                  │ │
│ │ ┌───────────────────────────────────────────────────────────┐  │ │
│ │ │ To: ap@worldwideproduce.com                               │  │ │
│ │ │ Subject: Invoice PO Compliance - Worldwide Produce        │  │ │
│ │ │                                                           │  │ │
│ │ │ Dear Accounts Receivable Team,                            │  │ │
│ │ │                                                           │  │ │
│ │ │ We're reaching out regarding purchase order compliance... │  │ │
│ │ │                                                           │  │ │
│ │ │ [Edit Email]                                              │  │ │
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ │                                                                 │ │
│ │ [Cancel] [Start Workflow]                                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: EXECUTE                                                      │
│                                                                      │
│ API Call: POST /api/actions/vendor-workflow/start                   │
│                                                                      │
│ Backend Operations:                                                  │
│ 1. Create vendor_workflows record (status: "contacted")             │
│ 2. Create vendor_workflow_activities record (initial)               │
│ 3. Send email (if enabled)                                          │
│ 4. Create task for owner: "Follow up with {vendor}" (due: 7 days)  │
│ 5. Create activity_log entry                                        │
│ 6. Schedule automated reminder (14 days - escalation warning)       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ WORKFLOW STATUS PROGRESSION                                          │
│                                                                      │
│ identified → assigned → contacted → responded → in_progress → resolved
│                                                              ↘        │
│                                                           escalated   │
│                                                                      │
│ Each transition requires:                                            │
│ • User action (button click in workflow detail)                     │
│ • Optional notes                                                     │
│ • Activity log entry                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow Status Updates

```
┌─────────────────────────────────────────────────────────────────────┐
│ WORKFLOW DETAIL VIEW (Vendors Tab → Active Workflows → Click)       │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Worldwide Produce - PO Compliance                               │ │
│ │ Status: Contacted | Started: Jan 15 | Owner: Sarah Wilson       │ │
│ │                                                                 │ │
│ │ Progress: ●───●───○───○───○                                    │ │
│ │          Assigned Contacted Responded In Progress Resolved      │ │
│ │                                                                 │ │
│ │ ─────────────────────────────────────────────────────────────  │ │
│ │                                                                 │ │
│ │ Update Status:                                                  │ │
│ │ [Mark Responded] [Mark In Progress] [Escalate] [Resolve]       │ │
│ │                                                                 │ │
│ │ ─────────────────────────────────────────────────────────────  │ │
│ │                                                                 │ │
│ │ Activity Timeline:                                              │ │
│ │                                                                 │ │
│ │ Jan 17, 2:30 PM - Sarah Wilson                                 │ │
│ │ Added note: "Spoke with their AR team, they're reviewing..."   │ │
│ │                                                                 │ │
│ │ Jan 15, 10:00 AM - System                                      │ │
│ │ Email sent to ap@worldwideproduce.com                          │ │
│ │                                                                 │ │
│ │ Jan 15, 9:45 AM - Manager                                      │ │
│ │ Workflow started, assigned to Sarah Wilson                     │ │
│ │                                                                 │ │
│ │ ─────────────────────────────────────────────────────────────  │ │
│ │                                                                 │ │
│ │ Add Note:                                                       │ │
│ │ [                                                    ] [Add]   │ │
│ │                                                                 │ │
│ │ ─────────────────────────────────────────────────────────────  │ │
│ │                                                                 │ │
│ │ Current Metrics vs. Start:                                      │ │
│ │ • PO Match Rate: 32% → 32% (no change yet)                     │ │
│ │ • Avg Processing: 47.1 days → 45.2 days (-4%)                  │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Escalation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ AUTOMATED ESCALATION (14 days no update)                             │
│                                                                      │
│ System checks daily:                                                 │
│ - Workflows in "contacted" status > 14 days                         │
│ - Workflows in "in_progress" status > 30 days with no improvement   │
│                                                                      │
│ If triggered:                                                        │
│ 1. Change status to "escalation_pending"                            │
│ 2. Create task for owner's manager                                  │
│ 3. Send notification email                                          │
│ 4. Show warning in dashboard                                        │
│                                                                      │
│ Manager can then:                                                    │
│ - Dismiss escalation (with reason)                                  │
│ - Formally escalate (reassign, involve procurement)                 │
│ - Close as unresolved                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ RESOLVING A WORKFLOW                                                 │
│                                                                      │
│ When user clicks "Resolve":                                          │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Resolve Vendor Workflow                                         │ │
│ │                                                                 │ │
│ │ Outcome:                                                        │ │
│ │ ○ Successful - Issue addressed, metrics improved                │ │
│ │ ○ Partially Successful - Some improvement                       │ │
│ │ ○ Unsuccessful - No improvement achieved                        │ │
│ │ ○ Closed - No longer relevant                                   │ │
│ │                                                                 │ │
│ │ Resolution Notes:                                               │ │
│ │ [Vendor agreed to include PO on all future invoices.           │ │
│ │  AR contact: Jane Smith, jane@worldwideproduce.com             │ │
│ │  Will monitor for 30 days to confirm compliance.        ]      │ │
│ │                                                                 │ │
│ │ Metrics at Resolution:                                          │ │
│ │ • PO Match Rate: 32% → 78% (+144%)                             │ │
│ │ • Processing Time: 47.1 → 12.3 days (-74%)                     │ │
│ │                                                                 │ │
│ │ [Cancel] [Resolve Workflow]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Creates inferred_impact record linking workflow to improvement      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Action: Generate Training Recommendation

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                              │
│ User clicks "Generate Training Recommendation" from:                │
│ • Training opportunity insight                                      │
│ • Staff detail page → Actions                                       │
│ • Location detail page → Training needs                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: GENERATE RECOMMENDATION                                      │
│                                                                      │
│ API Call: POST /api/actions/training/generate                       │
│                                                                      │
│ Request:                                                             │
│ {                                                                    │
│   "target_type": "user",  // or "location"                         │
│   "target_id": "user_008",                                          │
│   "detected_issue": "gl_code_errors",                               │
│   "triggered_by_insight_id": "insight_789"                          │
│ }                                                                    │
│                                                                      │
│ Backend Logic:                                                       │
│ 1. Analyze exception patterns for target                            │
│ 2. Identify dominant exception type                                 │
│ 3. Map to training type                                             │
│ 4. Calculate current cost and projected savings                     │
│ 5. Generate training document from template                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: DISPLAY IN DRAWER                                            │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🎓 Training Recommendation                                      │ │
│ │                                                                 │ │
│ │ For: John Miller (LA)                                          │ │
│ │ Training Type: GL Code Assignment                               │ │
│ │                                                                 │ │
│ │ ───────────────────────────────────────────────────────────── │ │
│ │                                                                 │ │
│ │ WHY THIS TRAINING                                               │ │
│ │                                                                 │ │
│ │ 42% of John's exceptions are GL code errors, compared to       │ │
│ │ the team average of 18%. This is costing approximately         │ │
│ │ $840/month in extra processing time.                           │ │
│ │                                                                 │ │
│ │ RECOMMENDED MODULES                                             │ │
│ │                                                                 │ │
│ │ 1. GL Code Fundamentals (45 min)                               │ │
│ │    - Expense category structure                                 │ │
│ │    - Common GL codes and when to use them                      │ │
│ │                                                                 │ │
│ │ 2. GL Assignment Best Practices (30 min)                       │ │
│ │    - Using vendor defaults                                      │ │
│ │    - Handling ambiguous line items                             │ │
│ │                                                                 │ │
│ │ 3. Practical Exercise (30 min)                                 │ │
│ │    - Work through 10 real GL exceptions                        │ │
│ │                                                                 │ │
│ │ EXPECTED OUTCOME                                                │ │
│ │                                                                 │ │
│ │ • GL exception rate: 42% → <20%                                │ │
│ │ • Monthly savings: ~$420                                       │ │
│ │                                                                 │ │
│ │ ───────────────────────────────────────────────────────────── │ │
│ │                                                                 │ │
│ │ [Copy Content] [Create Training Record]                        │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: CREATE TRAINING RECORD (Optional)                            │
│                                                                      │
│ If user clicks "Create Training Record":                            │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Track This Training                                             │ │
│ │                                                                 │ │
│ │ Trainee: John Miller                                           │ │
│ │ Training: GL Code Assignment                                    │ │
│ │                                                                 │ │
│ │ Target Completion Date: [Feb 28, 2026 ▼]                       │ │
│ │                                                                 │ │
│ │ ☑ Send training notification to John                           │ │
│ │ ☑ Create task reminder for me                                  │ │
│ │                                                                 │ │
│ │ [Cancel] [Create Record]                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Creates:                                                             │
│ - training_records entry (status: "recommended")                    │
│ - Task: "Follow up on John's GL training" (due: target date)       │
│ - Notification email to trainee (if checked)                        │
│ - Activity log entry                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Training Status Progression

```
recommended → initiated → in_progress → completed
                                    ↘
                                  not_completed

Status updates via Staff detail page → Training section
Each status change:
- Logged in activity_log
- Updates training_records.status_changed_at
- Recalculates "days to complete"
```

### Measuring Training Impact

```
┌─────────────────────────────────────────────────────────────────────┐
│ 30 DAYS AFTER COMPLETION                                             │
│                                                                      │
│ System automatically calculates:                                     │
│                                                                      │
│ metrics_before = get_metrics(user_id, training.created_at - 30 days)│
│ metrics_after = get_metrics(user_id, training.completed_at + 30 days)│
│                                                                      │
│ Creates inferred_impact record:                                      │
│ {                                                                    │
│   "source_type": "training",                                        │
│   "source_id": "training_123",                                      │
│   "metric": "gl_exception_rate",                                    │
│   "before_value": 0.42,                                             │
│   "after_value": 0.18,                                              │
│   "change_pct": -57,                                                │
│   "correlation_note": "Measured 30 days post-training"              │
│ }                                                                    │
│                                                                      │
│ Displayed in:                                                        │
│ - Staff detail → Training history                                   │
│ - Activity log                                                       │
│ - Reports                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Action: Generate Location Comparison

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                              │
│ User clicks "Compare to Best" or "Generate Comparison" from:        │
│ • Location insight card                                             │
│ • Location table row                                                │
│ • Location detail page                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: GENERATE COMPARISON                                          │
│                                                                      │
│ API Call: GET /api/actions/location-comparison/generate             │
│           ?location_id={id}&compare_to=best                         │
│                                                                      │
│ Response includes:                                                   │
│ - Subject location metrics                                          │
│ - Best performer metrics                                            │
│ - Metric-by-metric gaps                                             │
│ - Cost of each gap                                                  │
│ - Suggested focus areas                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: DISPLAY COMPARISON                                           │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Location Comparison: LA vs Austin (Best)                        │ │
│ │                                                                 │ │
│ │ Overall Gap: 8.8 points | Monthly Cost: $4,420                 │ │
│ │                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────┐│ │
│ │ │ Metric          │  LA   │ Austin │  Gap  │ Cost Impact      ││ │
│ │ ├─────────────────┼───────┼────────┼───────┼──────────────────┤│ │
│ │ │ Score           │ 84.3  │  93.1  │ -8.8  │ —                ││ │
│ │ │ Exception Rate  │ 14.2% │  8.9%  │ +5.3% │ $1,840/mo        ││ │
│ │ │ Touchless Rate  │ 81.3% │ 91.2%  │ -9.9% │ $1,280/mo        ││ │
│ │ │ Processing Time │ 7.8d  │  5.8d  │ +2.0d │ $890/mo          ││ │
│ │ │ Cost/Invoice    │ $6.20 │ $4.20  │ +$2   │ $410/mo          ││ │
│ │ └─────────────────────────────────────────────────────────────┘│ │
│ │                                                                 │ │
│ │ KEY DIFFERENCES                                                 │ │
│ │                                                                 │ │
│ │ 1. Exception Handling                                          │ │
│ │    Austin resolves exceptions 40% faster. Their process:       │ │
│ │    - Daily 10-min exception huddle                             │ │
│ │    - Dedicated exception queue owner                           │ │
│ │                                                                 │ │
│ │ 2. GL Pre-Assignment                                           │ │
│ │    Austin pre-assigns GL codes for top 50 vendors.             │ │
│ │    LA has no pre-assignment in place.                          │ │
│ │                                                                 │ │
│ │ 3. Team Structure                                               │ │
│ │    Austin uses buddy system for complex invoices.              │ │
│ │                                                                 │ │
│ │ RECOMMENDED ACTIONS                                             │ │
│ │                                                                 │ │
│ │ [Set Benchmark Target] [Generate Training Plan] [Request SOPs] │ │
│ │                                                                 │ │
│ │ ───────────────────────────────────────────────────────────── │ │
│ │                                                                 │ │
│ │ [Copy Comparison] [Export PDF]                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Action: Request SOP Upload & Generate Playbook

### Two-Part Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ PART 1: REQUEST SOP UPLOAD                                           │
│                                                                      │
│ Triggered from best-performing location or after comparison         │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Request Process Documentation                                   │ │
│ │                                                                 │ │
│ │ Austin is your top performer. To create a playbook for other   │ │
│ │ locations, we need their process documentation.                │ │
│ │                                                                 │ │
│ │ Request documents from Austin team:                             │ │
│ │ ☑ Exception handling process                                    │ │
│ │ ☑ GL code assignment guide                                      │ │
│ │ ☑ Daily workflow checklist                                      │ │
│ │ ☐ Vendor communication templates                                │ │
│ │ ☐ Training materials                                            │ │
│ │                                                                 │ │
│ │ Send request to: [austin-ap-lead@company.com    ]              │ │
│ │                                                                 │ │
│ │ [Cancel] [Send Request]                                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Creates:                                                             │
│ - sop_uploads record (status: "requested")                          │
│ - Task: "Upload Austin SOPs" assigned to Austin lead                │
│ - Email notification                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SOP UPLOAD INTERFACE                                                 │
│                                                                      │
│ Austin lead receives link to upload documents:                       │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Upload Process Documentation                                    │ │
│ │                                                                 │ │
│ │ Requested by: [Manager Name]                                   │ │
│ │ For: Austin location best practices                            │ │
│ │                                                                 │ │
│ │ Requested Documents:                                            │ │
│ │                                                                 │ │
│ │ ☑ Exception handling process                                    │ │
│ │   [exception-handling-v2.pdf] ✓ Uploaded                       │ │
│ │                                                                 │ │
│ │ ☑ GL code assignment guide                                      │ │
│ │   [Drag file here or click to upload]                          │ │
│ │                                                                 │ │
│ │ ☑ Daily workflow checklist                                      │ │
│ │   [daily-checklist.docx] ✓ Uploaded                            │ │
│ │                                                                 │ │
│ │ Additional files (optional):                                    │ │
│ │   [Drop files here]                                             │ │
│ │                                                                 │ │
│ │ [Submit Documents]                                              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PART 2: GENERATE PLAYBOOK                                            │
│                                                                      │
│ After SOPs uploaded, manager can generate playbook:                 │
│                                                                      │
│ API Call: POST /api/actions/playbook/generate                       │
│                                                                      │
│ Request:                                                             │
│ {                                                                    │
│   "source_location_id": "loc_austin",                               │
│   "sop_upload_ids": ["sop_1", "sop_2", "sop_3"],                   │
│   "target_locations": ["loc_la", "loc_nyc"]                        │
│ }                                                                    │
│                                                                      │
│ Backend:                                                             │
│ 1. Extract text/content from uploaded documents                     │
│ 2. Combine with Austin's metrics data                               │
│ 3. Generate playbook document using template                        │
│ 4. Include adaptation notes for each target location                │
│                                                                      │
│ Output: Downloadable playbook document                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Generated Playbook Structure

```markdown
# Austin Best Practices Playbook
## For deployment to: LA, NYC

### Executive Summary
Austin achieves a 93.1 efficiency score through three key practices...

### Practice 1: Daily Exception Huddle
**What:** 10-minute morning standup focused on exceptions
**Who:** All AP processors + team lead
**When:** 9:00 AM daily

**Process (from Austin SOP):**
1. Team lead pulls overnight exception queue
2. Each processor reports their top 3 blockers
3. Assign complex exceptions to most appropriate processor
4. Target: Clear 80% of exceptions by end of day

**Metrics Impact:**
- Exception resolution time: -40%
- Same-day resolution rate: +35%

**Adaptation for LA:**
- Consider 8:30 AM given timezone (overlap with HQ)
- Start with 3x weekly, move to daily

### Practice 2: GL Pre-Assignment
[Content from uploaded GL guide...]

### Practice 3: Buddy System
[Content from uploaded workflow checklist...]

### Implementation Timeline
Week 1: Train team leads
Week 2: Pilot daily huddle
Week 3-4: Add GL pre-assignment
Week 5-6: Implement buddy system
Week 7-8: Measure and adjust

### Success Metrics
Track these weekly for 60 days:
- Exception rate (target: <10%)
- Touchless rate (target: >88%)
- Processing time (target: <6.5 days)
```

---

## Action: Export Report

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                              │
│ User clicks "Export" or "Download Report" from:                     │
│ • Reports tab                                                       │
│ • Any dashboard tab header                                          │
│ • Insight/entity detail view                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: CONFIGURE REPORT                                             │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Export Report                                                   │ │
│ │                                                                 │ │
│ │ Report Type:                                                    │ │
│ │ ○ Executive Summary (1-2 pages)                                │ │
│ │ ● Location Report (2-3 pages)                                  │ │
│ │ ○ Team Performance (2-3 pages)                                 │ │
│ │ ○ Vendor Analysis (1-2 pages)                                  │ │
│ │ ○ Full QBR (4-6 pages)                                         │ │
│ │ ○ Current View (as displayed)                                  │ │
│ │                                                                 │ │
│ │ Scope:                                                          │ │
│ │ Location: [LA ▼]                                               │ │
│ │ Period: [Last 30 Days ▼]                                       │ │
│ │                                                                 │ │
│ │ Include:                                                        │ │
│ │ ☑ Three Things to Know (AI summary)                            │ │
│ │ ☑ Charts and visualizations                                    │ │
│ │ ☑ Recommendations                                              │ │
│ │ ☐ Detailed invoice list                                        │ │
│ │                                                                 │ │
│ │ [Cancel] [Generate PDF]                                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: GENERATE                                                     │
│                                                                      │
│ UI shows: "Generating report..." with progress                      │
│                                                                      │
│ API Call: POST /api/reports/generate                                │
│                                                                      │
│ Backend:                                                             │
│ 1. Fetch all required data for scope                                │
│ 2. Generate "Three Things to Know" (AI summary)                     │
│ 3. Render charts as images                                          │
│ 4. Apply report template                                            │
│ 5. Generate PDF via WeasyPrint                                      │
│ 6. Return download URL                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: DOWNLOAD                                                     │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Report Ready                                                  │ │
│ │                                                                 │ │
│ │ LA Location Report                                              │ │
│ │ Period: Jan 1 - Jan 31, 2026                                   │ │
│ │ Generated: Jan 31, 2026 at 2:45 PM                             │ │
│ │                                                                 │ │
│ │ [Download PDF] [Email Report] [Schedule This Report]           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Activity logged: "Report generated: LA Location Report"             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Standard Error States

```
┌─────────────────────────────────────────────────────────────────────┐
│ EMAIL SEND FAILURE                                                   │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Email could not be sent                                       │ │
│ │                                                                 │ │
│ │ The mentor assignment was created, but the notification         │ │
│ │ emails failed to send.                                          │ │
│ │                                                                 │ │
│ │ Error: Invalid email address for mentor                         │ │
│ │                                                                 │ │
│ │ What to do:                                                     │ │
│ │ • The assignment is still active                                │ │
│ │ • Please notify Lara and John manually                         │ │
│ │ • Update email addresses in user settings                       │ │
│ │                                                                 │ │
│ │ [View Assignment] [Retry Email] [Close]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ REPORT GENERATION TIMEOUT                                            │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Report generation timed out                                   │ │
│ │                                                                 │ │
│ │ The report is taking longer than expected.                      │ │
│ │                                                                 │ │
│ │ Options:                                                        │ │
│ │ • Retry with a smaller date range                              │ │
│ │ • Generate without detailed invoice list                        │ │
│ │ • Try again later                                               │ │
│ │                                                                 │ │
│ │ [Retry] [Modify Settings] [Cancel]                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Validation Errors

```
┌─────────────────────────────────────────────────────────────────────┐
│ VALIDATION ERROR                                                     │
│                                                                      │
│ Form fields show inline errors:                                      │
│                                                                      │
│ Mentor: [Select mentor ▼]                                           │
│         ↳ Please select a mentor                                    │
│                                                                      │
│ Focus Areas: [                    ]                                 │
│              ↳ Select at least one focus area                       │
│                                                                      │
│ Submit button disabled until valid                                  │
└─────────────────────────────────────────────────────────────────────┘
```
