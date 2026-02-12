# Historical System

Specifications for activity logging, audit trail, and inferred impact tracking.

---

## Overview

The historical system serves three purposes:

1. **Activity Log** — Record of all actions taken in the dashboard
2. **Audit Trail** — Who did what, when, and why
3. **Inferred Impact** — Correlating actions with outcome improvements

---

## Activity Log

### What Gets Logged

| Category | Events |
|----------|--------|
| **Insights** | Viewed, dismissed, action taken |
| **Actions** | All actions initiated and completed |
| **Workflows** | Status changes, notes added, escalations |
| **Tasks** | Created, completed, reassigned |
| **Reports** | Generated, scheduled, sent |
| **Filters** | Major filter changes (for context) |
| **System** | Insight generation runs, data refreshes |

### Activity Log Schema

```sql
CREATE TABLE dashboard.activity_log (
    -- Identity
    id String,
    tenant_id String,
    
    -- Event details
    event_type String,           -- 'mentor_assigned', 'workflow_started', etc.
    event_category String,       -- 'insight', 'action', 'workflow', 'task', 'report'
    event_description String,    -- Human-readable: "Mentor assigned: Lara → John"
    
    -- Actor
    performed_by String,         -- User ID or 'system'
    performed_by_name String,    -- Denormalized for display
    
    -- Related entities
    related_type Nullable(String),   -- 'user', 'location', 'vendor', 'insight', etc.
    related_id Nullable(String),
    related_name Nullable(String),   -- Denormalized
    
    -- Secondary relation (for relationships like mentor→mentee)
    secondary_type Nullable(String),
    secondary_id Nullable(String),
    secondary_name Nullable(String),
    
    -- Context
    context_data String,         -- JSON with additional details
    
    -- Outcome tracking
    outcome_recorded Bool DEFAULT false,
    outcome_data Nullable(String),  -- JSON with before/after metrics
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    
    INDEX idx_tenant (tenant_id),
    INDEX idx_performed_by (performed_by),
    INDEX idx_related (related_type, related_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created (created_at)
)
ENGINE = MergeTree()
ORDER BY (tenant_id, created_at, id)
TTL created_at + INTERVAL 2 YEAR;
```

### Event Types

```python
class EventType(Enum):
    # Insights
    INSIGHT_GENERATED = "insight_generated"
    INSIGHT_VIEWED = "insight_viewed"
    INSIGHT_DISMISSED = "insight_dismissed"
    INSIGHT_ACTION_TAKEN = "insight_action_taken"
    
    # Mentor actions
    MENTOR_ASSIGNED = "mentor_assigned"
    MENTOR_FOLLOWUP_COMPLETED = "mentor_followup_completed"
    MENTOR_RELATIONSHIP_COMPLETED = "mentor_relationship_completed"
    
    # Training actions
    TRAINING_RECOMMENDED = "training_recommended"
    TRAINING_ASSIGNED = "training_assigned"
    TRAINING_STARTED = "training_started"
    TRAINING_COMPLETED = "training_completed"
    
    # Vendor workflows
    VENDOR_WORKFLOW_STARTED = "vendor_workflow_started"
    VENDOR_WORKFLOW_STATUS_CHANGED = "vendor_workflow_status_changed"
    VENDOR_WORKFLOW_NOTE_ADDED = "vendor_workflow_note_added"
    VENDOR_WORKFLOW_ESCALATED = "vendor_workflow_escalated"
    VENDOR_WORKFLOW_RESOLVED = "vendor_workflow_resolved"
    
    # Benchmark targets
    BENCHMARK_TARGET_SET = "benchmark_target_set"
    BENCHMARK_TARGET_ACHIEVED = "benchmark_target_achieved"
    BENCHMARK_TARGET_MISSED = "benchmark_target_missed"
    
    # Tasks
    TASK_CREATED = "task_created"
    TASK_COMPLETED = "task_completed"
    TASK_REASSIGNED = "task_reassigned"
    
    # Reports
    REPORT_GENERATED = "report_generated"
    REPORT_SCHEDULED = "report_scheduled"
    REPORT_SENT = "report_sent"
    
    # SOPs and Playbooks
    SOP_REQUESTED = "sop_requested"
    SOP_UPLOADED = "sop_uploaded"
    PLAYBOOK_GENERATED = "playbook_generated"
    
    # System
    DATA_REFRESHED = "data_refreshed"
    INSIGHTS_REGENERATED = "insights_regenerated"
```

### Logging Implementation

```python
# app/services/activity_log.py

from datetime import datetime
from typing import Optional
import json

class ActivityLogger:
    def __init__(self, db, user_context):
        self.db = db
        self.user_context = user_context
    
    def log(
        self,
        event_type: str,
        description: str,
        related_type: Optional[str] = None,
        related_id: Optional[str] = None,
        related_name: Optional[str] = None,
        secondary_type: Optional[str] = None,
        secondary_id: Optional[str] = None,
        secondary_name: Optional[str] = None,
        context_data: Optional[dict] = None
    ) -> str:
        """Log an activity event."""
        
        event_id = generate_id()
        
        self.db.execute("""
            INSERT INTO dashboard.activity_log (
                id, tenant_id, event_type, event_category, event_description,
                performed_by, performed_by_name,
                related_type, related_id, related_name,
                secondary_type, secondary_id, secondary_name,
                context_data
            ) VALUES (
                %(id)s, %(tenant_id)s, %(event_type)s, %(category)s, %(description)s,
                %(user_id)s, %(user_name)s,
                %(related_type)s, %(related_id)s, %(related_name)s,
                %(secondary_type)s, %(secondary_id)s, %(secondary_name)s,
                %(context)s
            )
        """, {
            'id': event_id,
            'tenant_id': self.user_context.tenant_id,
            'event_type': event_type,
            'category': self._get_category(event_type),
            'description': description,
            'user_id': self.user_context.user_id,
            'user_name': self.user_context.user_name,
            'related_type': related_type,
            'related_id': related_id,
            'related_name': related_name,
            'secondary_type': secondary_type,
            'secondary_id': secondary_id,
            'secondary_name': secondary_name,
            'context': json.dumps(context_data) if context_data else None
        })
        
        return event_id
    
    def log_mentor_assigned(
        self,
        mentor_id: str,
        mentor_name: str,
        mentee_id: str,
        mentee_name: str,
        focus_areas: list[str],
        reason: str
    ):
        """Log a mentor assignment."""
        
        return self.log(
            event_type=EventType.MENTOR_ASSIGNED.value,
            description=f"Mentor assigned: {mentor_name} → {mentee_name}",
            related_type="user",
            related_id=mentee_id,
            related_name=mentee_name,
            secondary_type="user",
            secondary_id=mentor_id,
            secondary_name=mentor_name,
            context_data={
                "focus_areas": focus_areas,
                "reason": reason,
                "mentee_metrics_at_assignment": self._get_user_metrics(mentee_id)
            }
        )
    
    def log_vendor_workflow_started(
        self,
        vendor_id: str,
        vendor_name: str,
        issue_type: str,
        owner_id: str,
        owner_name: str,
        cost_impact: float
    ):
        """Log vendor workflow initiation."""
        
        return self.log(
            event_type=EventType.VENDOR_WORKFLOW_STARTED.value,
            description=f"Vendor workflow started: {vendor_name} ({issue_type})",
            related_type="vendor",
            related_id=vendor_id,
            related_name=vendor_name,
            context_data={
                "issue_type": issue_type,
                "owner_id": owner_id,
                "owner_name": owner_name,
                "cost_impact": cost_impact,
                "vendor_metrics_at_start": self._get_vendor_metrics(vendor_id)
            }
        )
```

---

## Activity Log UI

### Activity Log Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│ Activity Log                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ Filters:                                                             │
│ [All Categories ▼] [All Users ▼] [Last 30 Days ▼] [🔍 Search...]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ TODAY                                                               │
│ ─────                                                               │
│                                                                     │
│ 2:30 PM • Sarah Wilson                                              │
│ Vendor workflow status changed: Worldwide Produce                   │
│ contacted → responded                                               │
│ "Spoke with AR team, they're reviewing PO process"                 │
│ [View Workflow →]                                                   │
│                                                                     │
│ 10:15 AM • System                                                   │
│ Insights regenerated                                                │
│ 4 new insights generated, 2 dismissed as outdated                   │
│                                                                     │
│ 9:45 AM • Manager                                                   │
│ Mentor assigned: Lara Patel → John Miller                          │
│ Focus: GL codes, Exception handling                                 │
│ [View Relationship →]                                               │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                     │
│ YESTERDAY                                                           │
│ ─────────                                                           │
│                                                                     │
│ 4:20 PM • Manager                                                   │
│ Training completed: John Miller - GL Code Training                  │
│ Duration: 5 days | All modules complete                            │
│ [View Training Record →]                                            │
│                                                                     │
│ ...                                                                 │
│                                                                     │
│ [Load More]                                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Options

**By Category:**
- All
- Insights
- Actions
- Workflows
- Tasks
- Reports
- System

**By User:**
- All Users
- Me
- [List of users who have activity]

**By Time:**
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Custom Range

**By Entity:**
- All
- Staff: [dropdown]
- Location: [dropdown]
- Vendor: [dropdown]

### Activity Item Display

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Category Icon] [Time] • [User Name]                                │
│                                                                     │
│ [Event Description - bold]                                          │
│ [Additional context - normal weight]                                │
│                                                                     │
│ [Optional: Note/comment in gray italic]                            │
│                                                                     │
│ [Link to related item →]                                           │
└─────────────────────────────────────────────────────────────────────┘

Category Icons:
- Insights: Lightbulb
- Actions: Sparkles
- Workflows: GitBranch
- Tasks: CheckSquare
- Reports: FileText
- System: Settings
```

---

## Inferred Impact Tracking

### Purpose

Track the correlation (not causation) between actions and metric improvements. This allows us to show ROI estimates and validate that interventions are working.

### Important Disclaimer

All impact tracking is **inferred correlation**, not proven causation. The system:
- Records metrics before and after interventions
- Calculates the change
- Notes the time period
- Does NOT claim the action caused the improvement

Display always includes language like:
- "Since mentor assignment..."
- "Following training completion..."
- "Metrics after vendor workflow..."

### Inferred Impact Schema

```sql
CREATE TABLE dashboard.inferred_impact (
    id String,
    tenant_id String,
    
    -- Source action
    source_type String,      -- 'mentor_relationship', 'training', 'vendor_workflow', 'benchmark_target'
    source_id String,
    source_description String,
    
    -- Target entity
    target_type String,      -- 'user', 'location', 'vendor'
    target_id String,
    target_name String,
    
    -- Metric tracked
    metric_name String,      -- 'processing_volume', 'exception_rate', 'po_match_rate', etc.
    
    -- Before/After
    baseline_date Date,
    baseline_value Float64,
    measurement_date Date,
    measurement_value Float64,
    
    -- Calculated
    absolute_change Float64,
    percent_change Float64,
    
    -- Cost impact (if calculable)
    monthly_cost_impact Nullable(Float64),
    
    -- Confidence/Notes
    measurement_period_days UInt16,
    notes String,
    
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (tenant_id, source_type, source_id, created_at);
```

### Impact Recording Logic

```python
# app/services/impact_tracker.py

from datetime import date, timedelta
from typing import Optional

class ImpactTracker:
    def __init__(self, db, metrics_service):
        self.db = db
        self.metrics = metrics_service
    
    def record_mentor_impact(
        self,
        relationship_id: str,
        mentee_id: str,
        mentee_name: str,
        started_at: date,
        completed_at: date
    ):
        """Record impact of a completed mentorship."""
        
        # Get baseline metrics (30 days before start)
        baseline_date = started_at - timedelta(days=30)
        baseline_metrics = self.metrics.get_user_metrics(
            user_id=mentee_id,
            start_date=baseline_date,
            end_date=started_at
        )
        
        # Get current metrics (30 days after completion)
        measurement_date = completed_at + timedelta(days=30)
        current_metrics = self.metrics.get_user_metrics(
            user_id=mentee_id,
            start_date=completed_at,
            end_date=measurement_date
        )
        
        # Record impact for each metric
        metrics_to_track = [
            ('processing_volume', 'Daily invoice volume'),
            ('exception_rate', 'Exception rate'),
            ('processing_time', 'Avg processing time')
        ]
        
        for metric_key, metric_name in metrics_to_track:
            baseline = baseline_metrics.get(metric_key)
            current = current_metrics.get(metric_key)
            
            if baseline and current:
                self._record_impact(
                    source_type='mentor_relationship',
                    source_id=relationship_id,
                    source_description=f"Mentorship for {mentee_name}",
                    target_type='user',
                    target_id=mentee_id,
                    target_name=mentee_name,
                    metric_name=metric_key,
                    baseline_date=baseline_date,
                    baseline_value=baseline,
                    measurement_date=measurement_date,
                    measurement_value=current,
                    period_days=(measurement_date - baseline_date).days
                )
    
    def record_training_impact(
        self,
        training_id: str,
        trainee_id: str,
        trainee_name: str,
        training_type: str,
        completed_at: date
    ):
        """Record impact of completed training."""
        
        # Training impacts specific metrics based on type
        metric_mapping = {
            'gl_code': 'gl_exception_rate',
            'po_compliance': 'po_exception_rate',
            'vendor_master': 'vendor_mapping_exception_rate',
            'invoice_verification': 'amount_mismatch_rate'
        }
        
        metric_key = metric_mapping.get(training_type, 'exception_rate')
        
        # 30 days before training started
        baseline_date = completed_at - timedelta(days=60)  # Assume ~30 day training
        baseline = self.metrics.get_user_exception_breakdown(
            trainee_id, baseline_date, baseline_date + timedelta(days=30)
        ).get(metric_key)
        
        # 30 days after completion
        measurement_date = completed_at + timedelta(days=30)
        current = self.metrics.get_user_exception_breakdown(
            trainee_id, completed_at, measurement_date
        ).get(metric_key)
        
        if baseline and current:
            self._record_impact(
                source_type='training',
                source_id=training_id,
                source_description=f"{training_type} training for {trainee_name}",
                target_type='user',
                target_id=trainee_id,
                target_name=trainee_name,
                metric_name=metric_key,
                baseline_date=baseline_date,
                baseline_value=baseline,
                measurement_date=measurement_date,
                measurement_value=current,
                period_days=60
            )
    
    def record_vendor_workflow_impact(
        self,
        workflow_id: str,
        vendor_id: str,
        vendor_name: str,
        issue_type: str,
        started_at: date,
        resolved_at: date
    ):
        """Record impact of resolved vendor workflow."""
        
        # Map issue type to relevant metric
        metric_mapping = {
            'missing_po': 'po_match_rate',
            'high_errors': 'error_rate',
            'processing_delay': 'avg_processing_time',
            'gl_mapping': 'gl_mapping_rate'
        }
        
        metric_key = metric_mapping.get(issue_type, 'error_rate')
        
        # Baseline: 30 days before workflow started
        baseline_date = started_at - timedelta(days=30)
        baseline = self.metrics.get_vendor_metrics(
            vendor_id, baseline_date, started_at
        ).get(metric_key)
        
        # Current: 30 days after resolution
        measurement_date = resolved_at + timedelta(days=30)
        current = self.metrics.get_vendor_metrics(
            vendor_id, resolved_at, measurement_date
        ).get(metric_key)
        
        if baseline and current:
            # Calculate cost impact
            monthly_cost_impact = self._calculate_vendor_cost_impact(
                vendor_id, metric_key, baseline, current
            )
            
            self._record_impact(
                source_type='vendor_workflow',
                source_id=workflow_id,
                source_description=f"{issue_type} workflow for {vendor_name}",
                target_type='vendor',
                target_id=vendor_id,
                target_name=vendor_name,
                metric_name=metric_key,
                baseline_date=baseline_date,
                baseline_value=baseline,
                measurement_date=measurement_date,
                measurement_value=current,
                period_days=(measurement_date - baseline_date).days,
                monthly_cost_impact=monthly_cost_impact
            )
    
    def _record_impact(
        self,
        source_type: str,
        source_id: str,
        source_description: str,
        target_type: str,
        target_id: str,
        target_name: str,
        metric_name: str,
        baseline_date: date,
        baseline_value: float,
        measurement_date: date,
        measurement_value: float,
        period_days: int,
        monthly_cost_impact: Optional[float] = None
    ):
        """Insert impact record."""
        
        absolute_change = measurement_value - baseline_value
        percent_change = ((measurement_value - baseline_value) / baseline_value * 100) if baseline_value else 0
        
        self.db.execute("""
            INSERT INTO dashboard.inferred_impact (
                id, tenant_id, source_type, source_id, source_description,
                target_type, target_id, target_name, metric_name,
                baseline_date, baseline_value, measurement_date, measurement_value,
                absolute_change, percent_change, monthly_cost_impact,
                measurement_period_days, notes
            ) VALUES (...)
        """, {
            # ... parameters
            'notes': f"Measured {period_days} days from baseline to measurement"
        })
```

### Impact Display

```
┌─────────────────────────────────────────────────────────────────────┐
│ Mentorship Impact: Lara Patel → John Miller                         │
│ Completed: Jan 15 - Feb 28, 2026                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Metrics Since Mentorship Assignment*                                │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Processing Volume                                              │  │
│ │ Before: 65/day → After: 78/day                                │  │
│ │ Change: +20% ████████████████████░░░░░░░░░░                   │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Exception Rate                                                 │  │
│ │ Before: 28% → After: 18%                                      │  │
│ │ Change: -36% ██████████████████████████████░░░░               │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ Estimated Monthly Savings: $1,840                                   │
│                                                                     │
│ * Correlation only. Other factors may have contributed.            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Aggregate ROI Reporting

```
┌─────────────────────────────────────────────────────────────────────┐
│ Inferred ROI Summary                                                │
│ Jan 1 - Jan 31, 2026                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Actions Completed                    Inferred Savings*              │
│                                                                     │
│ Mentorships (2)                      $3,680/month                  │
│   • Lara → John: $1,840                                            │
│   • Marcus → Diana: $1,840                                         │
│                                                                     │
│ Training Completions (5)             $4,200/month                  │
│   • GL Code (3): $2,520                                            │
│   • PO Compliance (2): $1,680                                      │
│                                                                     │
│ Vendor Workflows Resolved (2)        $9,440/month                  │
│   • Worldwide Produce: $8,240                                      │
│   • Sunrise Produce: $1,200                                        │
│                                                                     │
│ ───────────────────────────────────────────────────────────────── │
│ Total Inferred Monthly Savings       $17,320/month                 │
│                                                                     │
│ * Based on metric improvements following actions.                  │
│   Correlation does not imply causation.                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Retention

### Retention Policies

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Activity Log | 2 years | TTL on table |
| Inferred Impact | 3 years | For long-term ROI tracking |
| Insight History | 90 days | Insights themselves expire |
| Workflow History | 2 years | Aligned with activity log |

### Archival

After retention period:
- Data deleted automatically via ClickHouse TTL
- Summary statistics preserved in aggregate tables
- Significant events may be preserved in audit archive

### GDPR Considerations

If user requests data deletion:
1. Activity log entries by that user: Anonymize `performed_by` fields
2. Activity log entries about that user: Keep for audit, anonymize name
3. Impact records: Anonymize target_name, keep metrics

```sql
-- Anonymize user in activity log
UPDATE dashboard.activity_log
SET 
    performed_by = 'deleted_user',
    performed_by_name = 'Deleted User'
WHERE performed_by = %(user_id)s;

-- Anonymize user as subject
UPDATE dashboard.activity_log
SET 
    related_name = 'Deleted User',
    secondary_name = CASE WHEN secondary_id = %(user_id)s THEN 'Deleted User' ELSE secondary_name END
WHERE related_id = %(user_id)s OR secondary_id = %(user_id)s;
```
