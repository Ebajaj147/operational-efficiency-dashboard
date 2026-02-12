# API Endpoints

Complete API specification for all dashboard endpoints.

---

## Base Configuration

```
Base URL: /api/v1/dashboard
Authentication: Bearer token (Ottimate session)
Content-Type: application/json
```

### Common Response Format

```json
{
    "success": true,
    "data": { ... },
    "meta": {
        "request_id": "req_abc123",
        "timestamp": "2026-01-15T10:30:00Z"
    }
}
```

### Error Response

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid date range",
        "details": { ... }
    }
}
```

---

## Metrics Endpoints

### GET /metrics/overview

Get high-level metrics for the Overview tab.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location_ids | string[] | No | Filter by locations |
| start_date | date | No | Period start (default: 30 days ago) |
| end_date | date | No | Period end (default: today) |

**Response:**
```json
{
    "invoices_processed": {
        "value": 12450,
        "previous_value": 11528,
        "change_pct": 8.0
    },
    "exception_rate": {
        "value": 10.8,
        "previous_value": 12.0,
        "change_pct": -10.0
    },
    "touchless_rate": {
        "value": 87.2,
        "previous_value": 85.1,
        "change_pct": 2.5
    },
    "cost_per_invoice": {
        "value": 4.85,
        "previous_value": 5.00,
        "change": -0.15
    },
    "potential_savings": 20400
}
```

### GET /metrics/staff

Get staff performance metrics.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location_ids | string[] | No | Filter by locations |
| start_date | date | No | Period start |
| end_date | date | No | Period end |

**Response:**
```json
{
    "team_size": 8,
    "team_average_volume": 83,
    "staff": [
        {
            "id": "user_001",
            "name": "Lara Patel",
            "location_id": "loc_austin",
            "location_name": "Austin",
            "daily_volume": 101,
            "vs_average": 21.7,
            "exception_count": 12,
            "exception_rate": 11.9,
            "z_score": 1.49,
            "performance_category": "exceptional",
            "accuracy": 98.2,
            "trend": "stable"
        }
    ]
}
```

### GET /metrics/locations

Get location performance metrics.

**Response:**
```json
{
    "locations": [
        {
            "id": "loc_austin",
            "name": "Austin",
            "region": "South",
            "score": 93.1,
            "invoices_processed": 2890,
            "exception_rate": 8.9,
            "touchless_rate": 91.2,
            "avg_processing_time": 5.8,
            "cost_per_invoice": 4.20,
            "team_size": 2,
            "pending_approvals": 23,
            "trend": "stable",
            "vs_best": 0,
            "monthly_cost_gap": 0
        }
    ],
    "best_performer": "loc_austin",
    "company_average_score": 88.4
}
```

### GET /metrics/vendors

Get vendor performance metrics.

**Response:**
```json
{
    "vendors": [
        {
            "id": "vendor_001",
            "name": "Sysco",
            "invoice_count": 2849,
            "total_spend": 2675533,
            "avg_processing_time": 3.0,
            "error_rate": 2.8,
            "po_match_rate": 97.9,
            "gl_mapping_rate": 98.5,
            "score": 92,
            "locations": ["Austin", "Chicago", "NYC", "LA", "Seattle", "Denver"],
            "has_active_workflow": false
        }
    ],
    "total_spend": 5205662,
    "average_error_rate": 6.2
}
```

---

## Insights Endpoints

### GET /insights

Get current insights.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location_ids | string[] | No | Filter by locations |
| severity | string | No | Filter: critical, warning, opportunity |
| limit | int | No | Max results (default: 10) |
| include_dismissed | bool | No | Include dismissed (default: false) |

**Response:**
```json
{
    "insights": [
        {
            "id": "insight_001",
            "type": "staff_below_average",
            "severity": "critical",
            "title": "John Miller needs immediate attention",
            "description": "Processing volume 23% below team average with increasing exceptions",
            "cost_impact": 2340,
            "recommendation": "Schedule 1:1 review and consider mentor pairing",
            "actions": [
                {
                    "key": "schedule_review",
                    "label": "Schedule Review",
                    "type": "drawer"
                },
                {
                    "key": "assign_mentor",
                    "label": "Assign Mentor",
                    "type": "drawer"
                }
            ],
            "related_entity": {
                "type": "user",
                "id": "user_008",
                "name": "John Miller"
            },
            "metrics_snapshot": {
                "daily_volume": 65,
                "team_average": 83,
                "exception_rate": 28,
                "z_score": -1.53
            },
            "created_at": "2026-01-15T06:00:00Z",
            "status": "active"
        }
    ],
    "total_count": 4,
    "total_potential_savings": 20400
}
```

### POST /insights/{id}/dismiss

Dismiss an insight.

**Request:**
```json
{
    "reason": "Already addressed offline"
}
```

**Response:**
```json
{
    "success": true,
    "insight_id": "insight_001",
    "status": "dismissed"
}
```

---

## Action Endpoints

### POST /actions/mentor/prepare

Prepare mentor assignment (get recommendations).

**Request:**
```json
{
    "mentee_id": "user_008"
}
```

**Response:**
```json
{
    "mentee": {
        "id": "user_008",
        "name": "John Miller",
        "location": "LA",
        "metrics": {
            "daily_volume": 65,
            "exception_rate": 28,
            "z_score": -1.53
        }
    },
    "recommended_mentors": [
        {
            "id": "user_001",
            "name": "Lara Patel",
            "location": "Austin",
            "match_score": 95,
            "match_reasons": [
                "Top performer with 101 invoices/day",
                "Exceptional at GL code assignment",
                "Previous successful mentorship"
            ],
            "metrics": {
                "daily_volume": 101,
                "exception_rate": 12
            }
        }
    ],
    "suggested_focus_areas": ["GL codes", "Exception handling", "Vendor communication"],
    "email_templates": {
        "to_mentor": "Hi {mentor_name}...",
        "to_mentee": "Hi {mentee_name}..."
    }
}
```

### POST /actions/mentor/assign

Execute mentor assignment.

**Request:**
```json
{
    "mentor_id": "user_001",
    "mentee_id": "user_008",
    "focus_areas": ["GL codes", "Exception handling"],
    "reason": "Processing volume 23% below average",
    "send_emails": true,
    "email_content": {
        "to_mentor": "Custom email content...",
        "to_mentee": "Custom email content..."
    },
    "triggered_by_insight_id": "insight_001"
}
```

**Response:**
```json
{
    "success": true,
    "relationship_id": "rel_123",
    "tasks_created": [
        {
            "id": "task_001",
            "title": "Schedule first mentor meeting",
            "due_date": "2026-01-18"
        },
        {
            "id": "task_002",
            "title": "Week 1 mentor check-in",
            "due_date": "2026-01-22"
        }
    ],
    "emails_sent": ["mentor@company.com", "mentee@company.com"],
    "next_followup_date": "2026-01-22"
}
```

### POST /actions/training/generate

Generate training recommendation.

**Request:**
```json
{
    "target_type": "user",
    "target_id": "user_008",
    "detected_issue": "gl_code_errors",
    "triggered_by_insight_id": "insight_002"
}
```

**Response:**
```json
{
    "training_type": "gl_code",
    "training_title": "GL Code Assignment Training",
    "target": {
        "type": "user",
        "id": "user_008",
        "name": "John Miller"
    },
    "analysis": {
        "exception_type": "GL Code Missing",
        "current_rate": 42,
        "team_average": 18,
        "gap": 24
    },
    "cost_impact": {
        "current_monthly": 840,
        "projected_savings": 420
    },
    "recommended_modules": [
        {
            "name": "GL Code Fundamentals",
            "duration_minutes": 45,
            "topics": ["Expense categories", "GL structure", "Common mappings"]
        },
        {
            "name": "GL Assignment Best Practices",
            "duration_minutes": 30,
            "topics": ["Vendor defaults", "Ambiguous items"]
        }
    ],
    "success_metrics": {
        "target_exception_rate": 20,
        "measurement_period_days": 30
    },
    "document_content": "# Training Recommendation\n\n..."
}
```

### POST /actions/training/create-record

Create a tracked training record.

**Request:**
```json
{
    "trainee_id": "user_008",
    "training_type": "gl_code",
    "target_completion_date": "2026-02-28",
    "send_notification": true,
    "create_reminder_task": true
}
```

**Response:**
```json
{
    "success": true,
    "training_record_id": "training_123",
    "task_id": "task_456",
    "notification_sent": true
}
```

### POST /actions/vendor-workflow/prepare

Prepare vendor workflow.

**Request:**
```json
{
    "vendor_id": "vendor_003"
}
```

**Response:**
```json
{
    "vendor": {
        "id": "vendor_003",
        "name": "Worldwide Produce",
        "metrics": {
            "invoice_count": 2928,
            "avg_processing_time": 47.1,
            "po_match_rate": 32,
            "error_rate": 4.0
        }
    },
    "detected_issues": [
        {
            "type": "missing_po",
            "severity": "critical",
            "value": 68,
            "threshold": 30,
            "description": "68% of invoices missing PO"
        }
    ],
    "recommended_workflow_type": "po_compliance",
    "cost_impact": 8240,
    "available_owners": [
        {"id": "user_003", "name": "Sarah Wilson"},
        {"id": "user_004", "name": "Ana Martinez"}
    ],
    "email_template": "Dear Accounts Receivable Team..."
}
```

### POST /actions/vendor-workflow/start

Start vendor improvement workflow.

**Request:**
```json
{
    "vendor_id": "vendor_003",
    "workflow_type": "po_compliance",
    "owner_id": "user_003",
    "target_resolution_days": 30,
    "send_email": true,
    "email_content": "Custom email...",
    "email_recipients": ["ap@worldwideproduce.com"]
}
```

**Response:**
```json
{
    "success": true,
    "workflow_id": "workflow_123",
    "status": "contacted",
    "owner": {
        "id": "user_003",
        "name": "Sarah Wilson"
    },
    "task_id": "task_789",
    "email_sent": true,
    "next_followup_date": "2026-01-22",
    "escalation_date": "2026-01-29"
}
```

### PUT /actions/vendor-workflow/{id}/status

Update workflow status.

**Request:**
```json
{
    "status": "responded",
    "notes": "Spoke with AR team, they're reviewing their PO process"
}
```

**Response:**
```json
{
    "success": true,
    "workflow_id": "workflow_123",
    "previous_status": "contacted",
    "new_status": "responded",
    "activity_logged": true
}
```

### POST /actions/vendor-workflow/{id}/resolve

Resolve a vendor workflow.

**Request:**
```json
{
    "outcome": "successful",
    "notes": "Vendor agreed to include PO on all invoices. AR contact: Jane Smith.",
    "metrics_at_resolution": {
        "po_match_rate": 78,
        "avg_processing_time": 12.3
    }
}
```

**Response:**
```json
{
    "success": true,
    "workflow_id": "workflow_123",
    "status": "resolved",
    "impact_recorded": true,
    "impact_summary": {
        "po_match_rate_change": "+144%",
        "processing_time_change": "-74%",
        "estimated_monthly_savings": 7840
    }
}
```

### POST /actions/benchmark/set

Set a benchmark target.

**Request:**
```json
{
    "entity_type": "location",
    "entity_id": "loc_la",
    "metric": "exception_rate",
    "baseline_value": 14.2,
    "target_value": 10.0,
    "benchmark_entity_id": "loc_austin",
    "target_date": "2026-03-31"
}
```

**Response:**
```json
{
    "success": true,
    "target_id": "target_123",
    "entity": {
        "type": "location",
        "id": "loc_la",
        "name": "LA"
    },
    "metric": "exception_rate",
    "baseline": 14.2,
    "target": 10.0,
    "benchmark": {
        "id": "loc_austin",
        "name": "Austin",
        "value": 8.9
    },
    "target_date": "2026-03-31",
    "status": "active"
}
```

---

## Tasks Endpoints

### GET /tasks

Get user's tasks.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | Filter: pending, completed, all |
| limit | int | No | Max results |

**Response:**
```json
{
    "tasks": [
        {
            "id": "task_001",
            "title": "Schedule 1:1 with John Miller",
            "description": null,
            "due_date": "2026-01-20",
            "status": "pending",
            "completed_at": null,
            "related": {
                "type": "mentor_relationship",
                "id": "rel_123",
                "label": "From: Staff Performance insight"
            },
            "created_at": "2026-01-15T10:30:00Z"
        }
    ],
    "pending_count": 3,
    "completed_count": 5
}
```

### POST /tasks

Create a task.

**Request:**
```json
{
    "title": "Follow up on training completion",
    "description": "Check if John completed GL training modules",
    "due_date": "2026-02-01",
    "related_type": "training",
    "related_id": "training_123"
}
```

### PUT /tasks/{id}

Update a task.

**Request:**
```json
{
    "status": "completed"
}
```

### PUT /tasks/{id}/reassign

Reassign a task.

**Request:**
```json
{
    "assignee_id": "user_003",
    "note": "Sarah is handling vendor relationships now"
}
```

---

## Reports Endpoints

### POST /reports/generate

Generate a report.

**Request:**
```json
{
    "report_type": "location",
    "scope": {
        "location_id": "loc_la"
    },
    "period": {
        "start_date": "2026-01-01",
        "end_date": "2026-01-31"
    },
    "include": {
        "three_things": true,
        "charts": true,
        "recommendations": true,
        "invoice_list": false
    }
}
```

**Response:**
```json
{
    "success": true,
    "report_id": "report_123",
    "download_url": "/api/v1/dashboard/reports/report_123/download",
    "expires_at": "2026-01-15T11:30:00Z",
    "metadata": {
        "type": "location",
        "location": "LA",
        "period": "Jan 1-31, 2026",
        "pages": 3,
        "generated_at": "2026-01-15T10:30:00Z"
    }
}
```

### GET /reports/{id}/download

Download generated report PDF.

**Response:** Binary PDF file

### POST /reports/schedule

Create a scheduled report.

**Request:**
```json
{
    "report_type": "executive_summary",
    "scope": {
        "location_ids": []
    },
    "frequency": "weekly",
    "day_of_week": 1,
    "hour": 8,
    "timezone": "America/New_York",
    "recipients": ["manager@company.com", "director@company.com"]
}
```

---

## Activity Log Endpoints

### GET /activity

Get activity log entries.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| category | string | No | Filter by category |
| user_id | string | No | Filter by performer |
| related_type | string | No | Filter by related entity type |
| related_id | string | No | Filter by related entity |
| start_date | date | No | Period start |
| end_date | date | No | Period end |
| limit | int | No | Max results (default: 50) |
| cursor | string | No | Pagination cursor |

**Response:**
```json
{
    "activities": [
        {
            "id": "act_123",
            "event_type": "mentor_assigned",
            "event_category": "action",
            "description": "Mentor assigned: Lara Patel → John Miller",
            "performed_by": {
                "id": "user_manager",
                "name": "Manager Name"
            },
            "related": {
                "type": "user",
                "id": "user_008",
                "name": "John Miller"
            },
            "secondary": {
                "type": "user",
                "id": "user_001",
                "name": "Lara Patel"
            },
            "context": {
                "focus_areas": ["GL codes", "Exception handling"]
            },
            "created_at": "2026-01-15T10:30:00Z"
        }
    ],
    "next_cursor": "abc123",
    "has_more": true
}
```

---

## Drill-Down Endpoints

### GET /invoices

Get invoices with filtering for drill-down.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location_ids | string[] | No | Filter by locations |
| processor_id | string | No | Filter by processor |
| vendor_id | string | No | Filter by vendor |
| status | string | No | Filter by status |
| exception_type | string | No | Filter by exception type |
| has_exception | bool | No | Only with/without exceptions |
| start_date | date | No | Invoice date start |
| end_date | date | No | Invoice date end |
| search | string | No | Search invoice ID or vendor |
| limit | int | No | Max results (default: 50) |
| cursor | string | No | Pagination cursor |

**Response:**
```json
{
    "invoices": [
        {
            "id": "INV-1234",
            "vendor_id": "vendor_001",
            "vendor_name": "Sysco",
            "amount": 1234.56,
            "date": "2026-01-05",
            "processor_id": "user_008",
            "processor_name": "John Miller",
            "location_id": "loc_la",
            "location_name": "LA",
            "status": "Pending",
            "exception_type": "Missing PO",
            "days_open": 10,
            "po_number": null
        }
    ],
    "total_count": 52,
    "total_value": 45230.00,
    "patterns": [
        "42% are Missing PO issues",
        "Sysco appears in 65% of invoices"
    ],
    "next_cursor": "xyz789",
    "has_more": true
}
```

### POST /invoices/bulk-action

Perform bulk action on invoices.

**Request:**
```json
{
    "invoice_ids": ["INV-1234", "INV-1235", "INV-1236"],
    "action": "reassign",
    "parameters": {
        "new_processor_id": "user_003"
    }
}
```

**Response:**
```json
{
    "success": true,
    "affected_count": 3,
    "action": "reassign",
    "new_processor": {
        "id": "user_003",
        "name": "Sarah Wilson"
    }
}
```
