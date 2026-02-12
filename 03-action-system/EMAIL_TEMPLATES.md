# Email Templates

All system-generated email templates. These are editable by users before sending.

---

## Template System

### Variables

All templates use Jinja2-style variables:

```
{{ variable_name }}
```

Common variables available in all templates:

| Variable | Description |
|----------|-------------|
| `{{ sender_name }}` | User who initiated the action |
| `{{ sender_email }}` | Sender's email |
| `{{ company_name }}` | Customer's company name |
| `{{ current_date }}` | Today's date formatted |

---

## Mentor Assignment Emails

### To Mentor

**Subject:** `Mentorship Request: {{ mentee_name }}`

```html
Hi {{ mentor_name }},

You've been identified as a top performer, and we'd like to pair you 
with {{ mentee_name }} for mentorship support.

**Why you were selected:**
- Your processing volume: {{ mentor_volume }}/day (team avg: {{ team_avg }})
- Your exception rate: {{ mentor_exception_rate }}% (team avg: {{ team_exception_rate }}%)
- {{ specific_strength }}

**Focus areas for {{ mentee_name }}:**
{% for area in focus_areas %}
- {{ area }}
{% endfor %}

**Suggested format:** 2x weekly 30-minute sessions for 4-6 weeks

{{ sender_name }} will follow up to coordinate schedules.

Best,
{{ sender_name }}
{{ company_name }} - AP Operations
```

### To Mentee

**Subject:** `Mentorship Pairing: {{ mentor_name }}`

```html
Hi {{ mentee_name }},

To support your professional development, we're pairing you with 
{{ mentor_name }}, one of our top performers.

**What to expect:**
- Regular check-ins (suggested: 2x weekly, 30 min)
- Focus areas: {{ focus_areas | join(', ') }}
- Duration: Typically 4-6 weeks

**{{ mentor_name }}'s strengths:**
{% for strength in mentor_strengths %}
- {{ strength }}
{% endfor %}

{{ sender_name }} will help coordinate your first meeting.

Best,
{{ sender_name }}
{{ company_name }} - AP Operations
```

---

## Vendor Outreach Emails

### PO Compliance

**Subject:** `Invoice PO Compliance - {{ vendor_name }}`

```html
Dear {{ vendor_contact_name | default('Accounts Receivable Team') }},

We're reaching out regarding purchase order compliance on invoices 
submitted to {{ company_name }}.

**Current situation:**
- {{ missing_po_pct }}% of your invoices are missing purchase orders
- This affects approximately {{ missing_po_count }} invoices per month
- Average processing delay: {{ avg_delay_days }} days

**Why this matters:**
Including PO numbers helps us process your invoices faster and ensure 
timely payment. Without a PO, invoices require additional review and 
approval steps.

**Requested action:**
Please include the PO number on all future invoices. PO numbers can 
typically be found on your original purchase order confirmation.

If you have questions about our PO requirements, please contact us at 
{{ ap_contact_email }}.

Thank you for your partnership.

Best regards,
{{ sender_name }}
{{ company_name }} - Accounts Payable
{{ sender_email }}
```

### High Error Rate

**Subject:** `Invoice Quality Review - {{ vendor_name }}`

```html
Dear {{ vendor_contact_name | default('Accounts Receivable Team') }},

We'd like to discuss invoice quality to help ensure faster processing 
and payment of your invoices.

**Current observations:**
- Error rate: {{ error_rate }}% (our average vendor: {{ avg_error_rate }}%)
- Most common issues:
{% for issue in common_issues %}
  - {{ issue.type }}: {{ issue.count }} occurrences
{% endfor %}
- Impact: Processing delays averaging {{ avg_delay_days }} additional days

**We'd like to schedule a brief call to:**
1. Review specific examples of issues encountered
2. Understand any challenges on your end
3. Agree on improvements going forward

Please let us know your availability for a 30-minute call in the next 
two weeks.

Best regards,
{{ sender_name }}
{{ company_name }} - Accounts Payable
{{ sender_email }}
```

### GL Mapping Issues

**Subject:** `Invoice Coding Discussion - {{ vendor_name }}`

```html
Dear {{ vendor_contact_name | default('Accounts Receivable Team') }},

We're reaching out about invoice formatting that would help us process 
your invoices more efficiently.

**Current situation:**
- {{ gl_error_pct }}% of invoices require manual GL code correction
- Common issues:
{% for issue in gl_issues %}
  - {{ issue }}
{% endfor %}

**Requested improvements:**

1. **Line item descriptions:** Please include clear, specific descriptions 
   for each line item (e.g., "Chicken Breast 40lb case" rather than "Food")

2. **Categorization:** If possible, group items by category on invoices

3. **Consistent naming:** Use consistent product names across invoices

These changes would significantly reduce processing time and help ensure 
faster payment.

Would you be available for a brief call to discuss? We can share specific 
examples and answer any questions.

Best regards,
{{ sender_name }}
{{ company_name }} - Accounts Payable
{{ sender_email }}
```

### Follow-up (No Response)

**Subject:** `RE: {{ original_subject }} - Follow Up`

```html
Dear {{ vendor_contact_name | default('Accounts Receivable Team') }},

I wanted to follow up on my previous email from {{ original_email_date }} 
regarding {{ issue_summary }}.

We haven't received a response and wanted to ensure this message reached 
the right person.

**Quick summary of our request:**
{{ request_summary }}

**Impact to your payments:**
- Current processing delay: {{ delay_days }} days
- Potential time saved with improvements: {{ potential_savings }} days

Could you please confirm receipt and let us know the best contact for 
this discussion?

Thank you,
{{ sender_name }}
{{ company_name }} - Accounts Payable
{{ sender_email }}
```

---

## Training Notification Emails

### Training Assigned

**Subject:** `Training Scheduled: {{ training_type }}`

```html
Hi {{ trainee_name }},

You've been scheduled for {{ training_type }} training to help improve 
your AP processing skills.

**Training Details:**
- Topic: {{ training_type }}
- Focus areas: {{ focus_areas | join(', ') }}
- Estimated time: {{ estimated_duration }}
- Target completion: {{ due_date }}

**Why this training:**
Based on recent performance data, this training will help you:
{% for benefit in benefits %}
- {{ benefit }}
{% endfor %}

**Current metrics (for reference):**
- {{ metric_1_name }}: {{ metric_1_value }}
- {{ metric_2_name }}: {{ metric_2_value }}

Please complete this training by {{ due_date }}. Let me know if you 
have any questions.

Best,
{{ sender_name }}
```

### Training Completed Acknowledgment

**Subject:** `Training Completed: {{ training_type }} ✓`

```html
Hi {{ trainee_name }},

Congratulations on completing {{ training_type }} training!

**Completion recorded:** {{ completion_date }}

**What happens next:**
We'll be tracking your metrics over the next 30-60 days to measure the 
impact of this training. You should see improvements in:
{% for metric in tracked_metrics %}
- {{ metric }}
{% endfor %}

If you have questions or need additional support, please reach out.

Best,
{{ sender_name }}
```

---

## Report Emails

### Scheduled Report Delivery

**Subject:** `{{ report_type }} Report - {{ period }}`

```html
Hi {{ recipient_name }},

Your scheduled {{ report_type }} report is attached.

**Report Details:**
- Period: {{ period }}
- Locations: {{ locations | join(', ') }}
- Generated: {{ generation_time }}

**Quick Highlights:**
{% for highlight in highlights %}
- {{ highlight }}
{% endfor %}

View the full report in the attachment or log in to the dashboard for 
interactive analysis.

---
This is an automated report from Ottimate's Operational Efficiency Dashboard.
To modify this schedule, log in to the Dashboard and go to Reports > Scheduled Reports.
```

---

## System Notifications

### Escalation Alert

**Subject:** `[Action Required] Vendor Workflow Escalation: {{ vendor_name }}`

```html
Hi {{ escalation_recipient }},

A vendor improvement workflow has been escalated and requires your attention.

**Vendor:** {{ vendor_name }}
**Issue:** {{ issue_type }}
**Days open:** {{ days_open }}
**Original owner:** {{ original_owner }}

**Timeline:**
- Workflow started: {{ start_date }}
- Last activity: {{ last_activity_date }}
- Escalation reason: {{ escalation_reason }}

**Current status:** {{ current_status }}

**Cost impact:** ${{ monthly_cost_impact }}/month

Please review and take appropriate action.

[View Workflow Details]({{ workflow_url }})

---
This escalation was triggered automatically based on workflow rules.
```

### Benchmark Target At Risk

**Subject:** `Benchmark Alert: {{ target_name }} at risk`

```html
Hi {{ recipient_name }},

A benchmark target you're tracking is at risk of not being achieved.

**Target:** {{ target_name }}
**Metric:** {{ metric_name }}
**Due date:** {{ due_date }} ({{ days_remaining }} days remaining)

**Progress:**
- Baseline: {{ baseline_value }}
- Current: {{ current_value }}
- Target: {{ target_value }}
- Progress: {{ progress_pct }}%

**Expected progress by now:** {{ expected_progress }}%

**Recommended actions:**
{% for action in recommended_actions %}
- {{ action }}
{% endfor %}

[View in Dashboard]({{ dashboard_url }})
```

---

## Email Best Practices

### Tone Guidelines

- Professional but warm
- Direct and action-oriented
- Specific with data where relevant
- Respectful of recipient's time

### Structure Guidelines

1. **Subject:** Clear, specific, scannable
2. **Opening:** Purpose in first sentence
3. **Body:** Bullets for easy scanning
4. **Action:** Clear next step
5. **Closing:** Contact info for questions

### Personalization

Always personalize:
- Recipient name (use title/name, not "Hello")
- Specific metrics and data
- Relevant context

### Preview Before Send

All emails show preview before sending:
- Recipient(s) clearly displayed
- Full email body visible
- Edit option available
- Cancel option prominent
