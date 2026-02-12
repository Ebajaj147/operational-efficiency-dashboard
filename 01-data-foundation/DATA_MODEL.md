# Data Model

This document defines the data structures for the Operational Efficiency Dashboard. It covers both data read from Ottimate's existing database and new tables created for dashboard-specific functionality.

---

## Overview

### Data Sources

| Source | Type | Description |
|--------|------|-------------|
| Ottimate Core | Read-only | Existing invoice, user, vendor, location data |
| Dashboard DB | Read-write | New tables for actions, tasks, workflows, settings |

### Database: ClickHouse

- **Ottimate Core Tables:** Existing schema (documented below for reference)
- **Dashboard Tables:** New tables in `dashboard` database/schema

---

## Ottimate Core Tables (Read-Only)

These tables exist in Ottimate's database. We read from them but never write.

### invoices

Primary invoice data.

```sql
CREATE TABLE invoices (
    id String,
    vendor_id String,
    processor_id String,
    location_id String,
    amount Decimal(15, 2),
    currency String DEFAULT 'USD',
    received_at DateTime,
    processed_at Nullable(DateTime),
    status Enum('pending', 'in_review', 'resolved', 'escalated'),
    po_number Nullable(String),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (location_id, received_at, id);
```

### invoice_exceptions

Exceptions flagged on invoices.

```sql
CREATE TABLE invoice_exceptions (
    id String,
    invoice_id String,
    exception_type Enum('missing_po', 'gl_code_missing', 'vendor_mapping', 'amount_mismatch', 'duplicate_invoice'),
    flagged_at DateTime,
    resolved_at Nullable(DateTime),
    resolved_by Nullable(String),
    resolution_notes Nullable(String)
) ENGINE = MergeTree()
ORDER BY (invoice_id, flagged_at);
```

### invoice_gl_codes

GL code assignments per invoice.

```sql
CREATE TABLE invoice_gl_codes (
    id String,
    invoice_id String,
    gl_code String,
    amount Decimal(15, 2),
    is_correct UInt8 DEFAULT 1,  -- 1 = correct on first attempt
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (invoice_id, gl_code);
```

### users

Ottimate users (processors, managers, etc.).

```sql
CREATE TABLE users (
    id String,
    email String,
    name String,
    role String,
    location_id Nullable(String),
    is_active UInt8 DEFAULT 1,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (id);
```

### locations

Physical locations/sites.

```sql
CREATE TABLE locations (
    id String,
    name String,
    region Nullable(String),
    address Nullable(String),
    timezone String DEFAULT 'UTC',
    is_active UInt8 DEFAULT 1,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (id);
```

### vendors

Vendor/supplier records.

```sql
CREATE TABLE vendors (
    id String,
    name String,
    is_active UInt8 DEFAULT 1,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (id);
```

---

## Dashboard Tables (Read-Write)

New tables for dashboard functionality.

### dashboard.insights

Generated insights (refreshed periodically).

```sql
CREATE TABLE dashboard.insights (
    id String,
    insight_type String,  -- 'staff_performance', 'location_performance', 'vendor_issue', etc.
    severity Enum('critical', 'warning', 'opportunity'),
    title String,
    description String,
    cost_impact Decimal(12, 2),
    recommendation String,
    
    -- Related entities (nullable, depends on insight type)
    user_id Nullable(String),
    location_id Nullable(String),
    vendor_id Nullable(String),
    
    -- Metrics at time of insight generation
    metrics_snapshot String,  -- JSON blob
    
    -- Status
    is_active UInt8 DEFAULT 1,
    is_dismissed UInt8 DEFAULT 0,
    dismissed_by Nullable(String),
    dismissed_at Nullable(DateTime),
    
    -- Timestamps
    generated_at DateTime DEFAULT now(),
    expires_at Nullable(DateTime)
) ENGINE = MergeTree()
ORDER BY (generated_at, severity, id);
```

### dashboard.actions

Actions taken from insights.

```sql
CREATE TABLE dashboard.actions (
    id String,
    action_type Enum(
        'assign_mentor',
        'prepare_review',
        'generate_training_recommendation',
        'generate_location_comparison',
        'set_benchmark_target',
        'start_vendor_workflow',
        'request_sop_upload',
        'generate_playbook',
        'create_task',
        'export_report',
        'schedule_summary'
    ),
    
    -- Context
    insight_id Nullable(String),
    initiated_by String,  -- user_id
    
    -- Related entities
    target_user_id Nullable(String),
    target_location_id Nullable(String),
    target_vendor_id Nullable(String),
    
    -- Metrics at time of action
    metrics_at_initiation String,  -- JSON blob
    
    -- Generated content
    generated_content Nullable(String),  -- AI-generated text
    
    -- Status
    status Enum('initiated', 'in_progress', 'completed', 'cancelled') DEFAULT 'initiated',
    completed_at Nullable(DateTime),
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (created_at, id);
```

### dashboard.tasks

User tasks (created from actions or manually).

```sql
CREATE TABLE dashboard.tasks (
    id String,
    title String,
    description Nullable(String),
    
    -- Assignment
    assignee_id String,
    created_by String,
    
    -- Context
    action_id Nullable(String),
    insight_id Nullable(String),
    related_entity_type Nullable(Enum('user', 'location', 'vendor')),
    related_entity_id Nullable(String),
    
    -- Scheduling
    due_date Nullable(Date),
    
    -- Status
    status Enum('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    completed_at Nullable(DateTime),
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (assignee_id, status, due_date, id);
```

### dashboard.mentor_relationships

Mentor-mentee assignments.

```sql
CREATE TABLE dashboard.mentor_relationships (
    id String,
    mentor_id String,  -- user_id of mentor
    mentee_id String,  -- user_id of mentee
    
    -- Context
    action_id String,  -- originating action
    reason String,  -- why assigned
    
    -- Status
    status Enum('active', 'paused', 'completed', 'terminated') DEFAULT 'active',
    
    -- Follow-ups
    last_followup_at Nullable(DateTime),
    next_followup_due Nullable(Date),
    followup_count UInt16 DEFAULT 0,
    
    -- Timestamps
    started_at DateTime DEFAULT now(),
    ended_at Nullable(DateTime),
    
    -- Outcome
    outcome_notes Nullable(String)
) ENGINE = MergeTree()
ORDER BY (mentee_id, started_at);
```

### dashboard.mentor_followups

Follow-up records for mentor relationships.

```sql
CREATE TABLE dashboard.mentor_followups (
    id String,
    relationship_id String,
    
    -- Follow-up details
    followup_date Date,
    status Enum('pending', 'completed', 'skipped') DEFAULT 'pending',
    notes Nullable(String),
    recorded_by Nullable(String),
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    completed_at Nullable(DateTime)
) ENGINE = MergeTree()
ORDER BY (relationship_id, followup_date);
```

### dashboard.training_records

Training recommendations and completion tracking.

```sql
CREATE TABLE dashboard.training_records (
    id String,
    user_id String,
    location_id Nullable(String),  -- if location-wide training
    
    -- Training details
    training_type String,  -- 'gl_code', 'po_compliance', 'exception_handling', etc.
    recommendation_reason String,
    focus_areas String,  -- JSON array
    
    -- Context
    action_id String,
    metrics_at_recommendation String,  -- JSON blob
    
    -- Status
    status Enum('recommended', 'initiated', 'completed') DEFAULT 'recommended',
    initiated_at Nullable(DateTime),
    completed_at Nullable(DateTime),
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (user_id, created_at);
```

### dashboard.vendor_workflows

Vendor improvement workflow tracking.

```sql
CREATE TABLE dashboard.vendor_workflows (
    id String,
    vendor_id String,
    
    -- Issue details
    issue_type String,  -- 'high_exceptions', 'missing_po', 'gl_mapping', etc.
    issue_description String,
    cost_impact Decimal(12, 2),
    
    -- Assignment
    owner_id Nullable(String),
    assigned_at Nullable(DateTime),
    
    -- Status
    status Enum('identified', 'assigned', 'contacted', 'responded', 'in_progress', 'resolved', 'escalated') DEFAULT 'identified',
    
    -- Context
    action_id String,
    metrics_at_start String,  -- JSON blob
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    resolved_at Nullable(DateTime),
    
    -- Outcome
    resolution_notes Nullable(String)
) ENGINE = MergeTree()
ORDER BY (vendor_id, created_at);
```

### dashboard.vendor_workflow_activities

Activity log for vendor workflows.

```sql
CREATE TABLE dashboard.vendor_workflow_activities (
    id String,
    workflow_id String,
    
    -- Activity details
    activity_type Enum('status_change', 'email_sent', 'note_added', 'owner_changed'),
    description String,
    performed_by String,
    
    -- Email details (if applicable)
    email_subject Nullable(String),
    email_body Nullable(String),
    email_sent_at Nullable(DateTime),
    
    -- Timestamps
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (workflow_id, created_at);
```

### dashboard.benchmark_targets

Goals set based on best performers.

```sql
CREATE TABLE dashboard.benchmark_targets (
    id String,
    
    -- Target details
    metric_name String,  -- 'exception_rate', 'processing_time', etc.
    entity_type Enum('user', 'location'),
    entity_id String,
    
    -- Values
    baseline_value Decimal(12, 4),
    target_value Decimal(12, 4),
    benchmark_source_id String,  -- entity used as benchmark
    benchmark_source_name String,
    
    -- Timeline
    target_date Date,
    
    -- Status
    status Enum('active', 'on_track', 'at_risk', 'achieved', 'missed') DEFAULT 'active',
    current_value Nullable(Decimal(12, 4)),
    last_checked_at Nullable(DateTime),
    
    -- Context
    action_id String,
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (entity_type, entity_id, created_at);
```

### dashboard.activity_log

Comprehensive audit log of all actions.

```sql
CREATE TABLE dashboard.activity_log (
    id String,
    
    -- What happened
    event_type String,
    event_description String,
    
    -- Who did it
    performed_by String,
    
    -- Related entities
    action_id Nullable(String),
    insight_id Nullable(String),
    task_id Nullable(String),
    user_id Nullable(String),
    location_id Nullable(String),
    vendor_id Nullable(String),
    
    -- Context snapshot
    context_data String,  -- JSON blob with relevant metrics/state
    
    -- Timestamps
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (created_at, id);
```

### dashboard.scheduled_reports

Report scheduling configuration.

```sql
CREATE TABLE dashboard.scheduled_reports (
    id String,
    
    -- Report details
    report_type Enum('executive_summary', 'qbr', 'location', 'vendor', 'team'),
    report_name String,
    
    -- Configuration
    config String,  -- JSON: locations, time_period, comparison settings
    
    -- Schedule
    frequency Enum('daily', 'weekly', 'monthly'),
    day_of_week Nullable(UInt8),  -- 1-7 for weekly
    day_of_month Nullable(UInt8),  -- 1-31 for monthly
    send_time String,  -- HH:MM in user's timezone
    timezone String,
    
    -- Recipients
    recipients String,  -- JSON array of email addresses
    created_by String,
    
    -- Status
    is_active UInt8 DEFAULT 1,
    last_sent_at Nullable(DateTime),
    next_send_at Nullable(DateTime),
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (created_by, id);
```

### dashboard.user_settings

Per-user dashboard preferences.

```sql
CREATE TABLE dashboard.user_settings (
    user_id String,
    
    -- Default filters
    default_locations String,  -- JSON array of location_ids
    default_date_range String,  -- '7d', '30d', '90d', 'all'
    
    -- Notification preferences
    insight_notifications UInt8 DEFAULT 1,
    task_reminders UInt8 DEFAULT 1,
    
    -- Timestamps
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (user_id);
```

### dashboard.sop_uploads

Uploaded SOP documents for playbook generation.

```sql
CREATE TABLE dashboard.sop_uploads (
    id String,
    location_id String,
    
    -- File details
    filename String,
    file_type String,  -- 'pdf', 'docx', etc.
    file_size UInt64,
    storage_path String,  -- S3 or similar path
    
    -- Processing
    is_processed UInt8 DEFAULT 0,
    processed_at Nullable(DateTime),
    extracted_content Nullable(String),  -- Processed text
    analysis_result Nullable(String),  -- JSON: key practices identified
    
    -- Upload details
    uploaded_by String,
    
    -- Timestamps
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (location_id, created_at);
```

---

## Computed Views

These are materialized views or query patterns for common metrics.

### User Daily Performance

```sql
-- Get daily processing metrics per user
SELECT
    processor_id,
    toDate(processed_at) as process_date,
    count() as invoices_processed,
    avg(dateDiff('minute', received_at, processed_at)) as avg_processing_minutes,
    countIf(ie.id IS NOT NULL) as exception_count
FROM invoices i
LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
WHERE processed_at IS NOT NULL
GROUP BY processor_id, process_date
```

### Location Score Components

```sql
-- Components for location score calculation
SELECT
    l.id as location_id,
    l.name as location_name,
    count(i.id) as total_invoices,
    countIf(ie.id IS NULL) / count(i.id) * 100 as touchless_rate,
    countIf(ie.id IS NOT NULL) / count(i.id) * 100 as exception_rate,
    avg(dateDiff('hour', i.received_at, i.processed_at)) as avg_processing_hours
FROM locations l
JOIN invoices i ON l.id = i.location_id
LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
WHERE i.processed_at IS NOT NULL
  AND i.processed_at >= now() - INTERVAL 30 DAY
GROUP BY l.id, l.name
```

### Vendor Score Components

```sql
-- Components for vendor score calculation
SELECT
    v.id as vendor_id,
    v.name as vendor_name,
    count(i.id) as total_invoices,
    sum(i.amount) as total_spend,
    countIf(i.po_number IS NOT NULL) / count(i.id) * 100 as po_match_rate,
    countIf(ie.exception_type = 'gl_code_missing') / count(i.id) * 100 as gl_exception_rate,
    countIf(ie.id IS NOT NULL) / count(i.id) * 100 as overall_error_rate
FROM vendors v
JOIN invoices i ON v.id = i.vendor_id
LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
WHERE i.received_at >= now() - INTERVAL 30 DAY
GROUP BY v.id, v.name
```

---

## Data Relationships

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  locations  │     │    users    │     │   vendors   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │                   │                   │
       └─────────┬─────────┴─────────┬─────────┘
                 │                   │
                 ▼                   ▼
          ┌─────────────┐     ┌─────────────────────┐
          │  invoices   │────▶│ invoice_exceptions  │
          └──────┬──────┘     └─────────────────────┘
                 │
                 ▼
          ┌─────────────────┐
          │ invoice_gl_codes│
          └─────────────────┘


Dashboard Tables:

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  insights   │────▶│   actions   │────▶│    tasks    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│mentor_relationships│ │training_records│ │vendor_workflows│
└──────────────────┘ └──────────────┘ └────────┬─────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │vendor_workflow_activities│
                                    └──────────────────────┘
```

---

## Indexing Strategy

### Primary Access Patterns

| Query Pattern | Table | Index/Order |
|--------------|-------|-------------|
| Invoices by location + date | invoices | (location_id, received_at) |
| User's tasks | tasks | (assignee_id, status, due_date) |
| Active insights | insights | (is_active, severity, generated_at) |
| Vendor workflows | vendor_workflows | (vendor_id, created_at) |
| Activity log by date | activity_log | (created_at) |
| User settings lookup | user_settings | (user_id) |

### Secondary Indexes (if needed)

```sql
-- For filtering invoices by processor
ALTER TABLE invoices ADD INDEX idx_processor processor_id TYPE minmax GRANULARITY 4;

-- For filtering by vendor
ALTER TABLE invoices ADD INDEX idx_vendor vendor_id TYPE minmax GRANULARITY 4;
```

---

## Data Retention

| Table | Retention | Rationale |
|-------|-----------|-----------|
| invoices | Per Ottimate policy | Core data |
| insights | 90 days | Regenerated frequently |
| actions | Indefinite | Audit requirement |
| tasks | Indefinite | Historical record |
| activity_log | 2 years | Compliance |
| mentor_relationships | Indefinite | Performance history |
| training_records | Indefinite | Performance history |
| vendor_workflows | Indefinite | Vendor history |
| benchmark_targets | Indefinite | Historical tracking |

---

## Migration Notes

When implementing:

1. **Do not modify Ottimate core tables** — Read only
2. **Create dashboard schema first** — All new tables in `dashboard.*`
3. **Add indexes incrementally** — Based on actual query patterns
4. **Use ReplacingMergeTree for settings** — Handles updates cleanly
5. **JSON blobs for flexible data** — metrics_snapshot, context_data, config
