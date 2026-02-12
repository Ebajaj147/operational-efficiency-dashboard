# Glossary

Standard terminology for the Operational Efficiency Dashboard. Use these terms consistently across all documentation, UI copy, API naming, and communications.

---

## Core Metrics

### Processing Volume
- **Definition:** Number of invoices processed by a user/location in a given period
- **Calculation:** `COUNT(invoices) WHERE processor = [user] AND processed_date WITHIN [period]`
- **UI Display:** "142 invoices" or "142/day average"
- **Used In:** Staff tab, Location tab, Overview

### Processing Time
- **Definition:** Average time from invoice receipt to processing completion
- **Calculation:** `AVG(processed_date - received_date)` for invoices in period
- **UI Display:** "4.2 days avg"
- **Note:** Lower is better

### Exception Rate
- **Definition:** Percentage of invoices that triggered an exception
- **Calculation:** `(COUNT(invoices WITH exception) / COUNT(all invoices)) × 100`
- **UI Display:** "12.4%"
- **Note:** Lower is better; industry benchmark <10%

### Touchless Rate
- **Definition:** Percentage of invoices processed without manual intervention
- **Calculation:** `(COUNT(invoices WITH no_manual_touch) / COUNT(all invoices)) × 100`
- **UI Display:** "87.2%"
- **Note:** Higher is better; goal is >85%

### Cost Per Invoice
- **Definition:** Average operational cost to process one invoice
- **Calculation:** `(SUM(processing_time_hours) × $25) / COUNT(invoices)`
- **UI Display:** "$4.82"
- **Note:** Lower is better; industry range $5-15

### Exception Resolution Time
- **Definition:** Average time from exception flagged to exception resolved
- **Calculation:** `AVG(resolution_date - exception_date)` for resolved exceptions
- **UI Display:** "3.2 days"
- **Note:** Lower is better; target <3 days

### PO Match Rate
- **Definition:** Percentage of invoices with valid purchase order match
- **Calculation:** `(COUNT(invoices WITH matched_po) / COUNT(all invoices)) × 100`
- **UI Display:** "91.4%"
- **Note:** Higher is better; target >90%

### GL Mapping Rate
- **Definition:** Percentage of invoices with correct GL code on first attempt
- **Calculation:** `(COUNT(invoices WITHOUT gl_exception) / COUNT(all invoices)) × 100`
- **UI Display:** "88.7%"
- **Note:** Higher is better; target >90%

---

## Composite Scores

### Vendor Score
- **Definition:** Composite score of vendor invoice quality (0-100)
- **Calculation:**
  ```
  (PO Match Rate × 0.40) +
  (GL Mapping Rate × 0.30) +
  ((100 - Error Rate) × 0.30)
  ```
- **UI Display:** Score number with color badge
- **Color Coding:**
  - ≥90: Green (Excellent)
  - 80-89: Blue (Good)
  - 70-79: Amber (Needs Attention)
  - <70: Red (Critical)

### Location Score
- **Definition:** Composite score of location operational efficiency (0-100)
- **Calculation:**
  ```
  (Touchless Rate × 0.30) +
  ((100 - Exception Rate) × 0.25) +
  (Processing Time Score × 0.25) +
  (Cost Efficiency Score × 0.20)
  ```
  Where Processing Time Score and Cost Efficiency Score are relative to best performer
- **UI Display:** Score number with color badge
- **Color Coding:** Same as Vendor Score

### Staff Performance Category
- **Definition:** Categorical assessment of individual processor performance
- **Calculation:** Based on processing volume relative to team average
- **Categories:**
  | Category | Criteria | Color |
  |----------|----------|-------|
  | Exceptional | >20% above team average | Green |
  | Above Average | 5-20% above team average | Blue |
  | Average | Within ±5% of team average | Purple |
  | Below Average | 5-20% below team average | Amber |
  | Needs Attention | >20% below team average | Red |

---

## Entities

### Processor
A user who processes invoices in the Ottimate system.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Full name |
| email | string | Email address |
| role | string | Job role/title |
| location_id | string | Primary location assignment |
| created_at | datetime | Account creation date |

### Location
A physical site, branch, or cost center.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Location name (e.g., "Austin") |
| region | string | Geographic region |
| address | string | Physical address |
| team_size | integer | Number of processors assigned |

### Vendor
A supplier who sends invoices.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Vendor name |
| total_spend | decimal | Total invoice amount (period) |
| invoice_count | integer | Number of invoices (period) |
| locations_served | array | Locations receiving invoices from this vendor |

### Invoice
A single payable document.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Invoice identifier (e.g., "INV-0001") |
| vendor_id | string | Vendor reference |
| processor_id | string | Assigned processor |
| location_id | string | Processing location |
| amount | decimal | Invoice amount |
| received_date | datetime | When invoice was received |
| processed_date | datetime | When processing completed |
| status | enum | Processing status |
| exception_type | enum | Exception type if any |
| po_number | string | Purchase order reference |
| gl_codes | array | General ledger codes |

### Exception
A flag on an invoice requiring attention.

**Types:**
| Type | Description | Common Cause |
|------|-------------|--------------|
| Missing PO | No purchase order attached | Vendor didn't include; unauthorized purchase |
| GL Code Missing | General ledger code not assigned | New expense type; processor error |
| Vendor Mapping | Vendor not recognized in system | New vendor; name variation |
| Amount Mismatch | Invoice amount doesn't match PO | Price change; quantity variance |
| Duplicate Invoice | Invoice already processed | Vendor resubmission; system error |

---

## System Concepts

### Insight
An AI-generated observation about operations, combining data analysis with recommended action.

**Structure:**
| Field | Description |
|-------|-------------|
| id | Unique identifier |
| severity | critical / warning / opportunity |
| title | Short, actionable headline |
| description | What the data shows |
| cost_impact | Dollar amount of inefficiency |
| recommendation | Suggested action |
| actions | Array of available action types |
| entities | Related users/locations/vendors |

### Action
A workflow initiated from an insight or manually triggered.

**Types:** See [ACTION_TYPES.md](../03-action-system/ACTION_TYPES.md)

### Task
A trackable to-do item created by an action or manually.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| title | string | Task description |
| assignee_id | string | Assigned user |
| due_date | date | Target completion |
| status | enum | not_started / in_progress / completed |
| context | object | Related insight/action/entity |
| created_at | datetime | Creation timestamp |
| completed_at | datetime | Completion timestamp |

### Workflow
A multi-step process with status tracking.

**Example: Vendor Improvement Workflow**
```
Identified → Assigned → Contacted → Responded → In Progress → Resolved
                                                          ↘ Escalated
```

### Benchmark Target
A goal set based on internal best performer.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| metric | string | Which metric (e.g., "exception_rate") |
| entity_id | string | Location/user this applies to |
| current_value | decimal | Value when target was set |
| target_value | decimal | Goal value |
| benchmark_source | string | Best performer used as reference |
| target_date | date | When to achieve by |
| status | enum | on_track / at_risk / achieved / missed |

### Activity Log Entry
Historical record of an action taken in the system.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| action_type | string | What was done |
| initiated_by | string | User who triggered |
| initiated_at | datetime | When triggered |
| context | object | Insight/metrics at time |
| entities_involved | array | Users/locations/vendors affected |
| status | enum | Current state |
| follow_ups | array | Subsequent events |
| outcome | object | Results if measured |

### Inferred Impact
Correlation between an action and subsequent metric improvement.

**Important:** This is correlation, not causation. Display as:
> "Since [action] on [date], [metric] improved [X%]"

Not:
> "[Action] caused [X%] improvement"

---

## Thresholds Reference

### Alert Thresholds (Trigger Insights)

| Metric | Condition | Insight Severity |
|--------|-----------|------------------|
| Processing volume | >20% below team avg | Warning |
| Processing volume | >35% below team avg | Critical |
| Exception rate (individual) | >15% of invoices | Warning |
| Exception rate (individual) | >25% of invoices | Critical |
| GL code exceptions | >15% of invoices | Warning |
| Vendor mapping failures | >10% of invoices | Warning |
| PO match rate | <85% | Warning |
| PO match rate | <70% | Critical |
| Processing time | >50% above avg | Warning |
| Processing time | >100% above avg | Critical |
| Exception resolution | >5 days average | Warning |
| Exception resolution | >10 days average | Critical |
| Vendor score | <80 | Warning |
| Vendor score | <70 | Critical |
| Location score | >10% below best | Warning |
| Location score | >20% below best | Critical |

### Cost Basis

| Parameter | Value | Notes |
|-----------|-------|-------|
| AP Staff Hourly Rate | $25/hour | Fixed for V1 |
| Average Exception Resolution Time | 15 minutes | Per exception |
| Average Manual Invoice Processing | 8 minutes | Per invoice |
| Average Touchless Processing | 2 minutes | Per invoice |

---

## Status Enums

### Invoice Status
- `pending` - Awaiting processing
- `in_review` - Being processed/reviewed
- `resolved` - Successfully processed
- `escalated` - Requires management attention

### Task Status
- `not_started` - Created but not begun
- `in_progress` - Work underway
- `completed` - Finished

### Workflow Status (Vendor)
- `identified` - Issue flagged
- `assigned` - Owner assigned
- `contacted` - Outreach sent
- `responded` - Vendor replied
- `in_progress` - Working on resolution
- `resolved` - Issue fixed
- `escalated` - Needs leadership involvement

### Mentor Relationship Status
- `active` - Ongoing mentorship
- `paused` - Temporarily inactive
- `completed` - Successfully concluded
- `terminated` - Ended early

### Training Status
- `recommended` - System suggested training
- `initiated` - Training started
- `completed` - Training finished

### Benchmark Target Status
- `active` - Working toward goal
- `on_track` - Progress as expected
- `at_risk` - May not achieve
- `achieved` - Goal met
- `missed` - Deadline passed, not achieved

---

## UI Terminology

Use these exact terms in the interface:

| Concept | UI Term | Not This |
|---------|---------|----------|
| Individual processor | "Staff member" or name | "User", "Employee" |
| Processing location | "Location" | "Site", "Branch", "Office" |
| Invoice supplier | "Vendor" | "Supplier", "Partner" |
| AI recommendation | "Insight" | "Alert", "Warning", "Notification" |
| Assigned task | "Task" | "To-do", "Action item" |
| Performance review prep | "Review preparation" | "1:1 prep", "Meeting prep" |
| Best performer comparison | "Benchmark" | "Target", "Goal" |
| Dollar impact | "Cost impact" | "Savings", "Loss" |

---

## Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| AP | Accounts Payable |
| PO | Purchase Order |
| GL | General Ledger |
| MRR | Monthly Recurring Revenue |
| KPI | Key Performance Indicator |
| QBR | Quarterly Business Review |
| SOP | Standard Operating Procedure |
