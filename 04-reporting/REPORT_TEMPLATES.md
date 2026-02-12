# Report Templates

Complete specifications for all PDF report templates. Each template includes layout, data requirements, and rendering details.

---

## Report System Overview

### Available Reports

| Report | Audience | Length | Generated From |
|--------|----------|--------|----------------|
| Executive Summary | CFO, VP Finance | 1-2 pages | Overview tab |
| Location Report | Regional Manager | 2-3 pages | Location detail |
| Team Performance | AP Manager | 2-3 pages | Staff tab |
| Vendor Analysis | AP Manager | 1-2 pages | Vendor detail |
| Quarterly Business Review (QBR) | Executive | 4-6 pages | All tabs |

### Common Elements

All reports include:
- Ottimate branding (header logo, footer)
- Report title and date range
- "Three Things to Know" AI-generated summary
- Generated timestamp
- Page numbers

---

## Executive Summary Report

### Purpose
Quick overview for executives who need key metrics and action items in 5 minutes.

### Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [OTTIMATE LOGO]              EXECUTIVE SUMMARY                      │
│                              {Company Name}                         │
│                              {Date Range}                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  THREE THINGS TO KNOW                                               │
│  ─────────────────────                                              │
│                                                                     │
│  1. {AI-generated insight #1 - most important}                     │
│                                                                     │
│  2. {AI-generated insight #2}                                      │
│                                                                     │
│  3. {AI-generated insight #3}                                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  KEY METRICS                                                        │
│  ───────────                                                        │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  INVOICES   │  │ EXCEPTION   │  │  TOUCHLESS  │  │   COST/     ││
│  │  PROCESSED  │  │    RATE     │  │    RATE     │  │  INVOICE    ││
│  │             │  │             │  │             │  │             ││
│  │   12,450    │  │   10.8%     │  │   87.2%     │  │   $4.85     ││
│  │   +8% MoM   │  │   -1.2%     │  │   +2.1%     │  │   -$0.15    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LOCATION PERFORMANCE                                               │
│  ────────────────────                                               │
│                                                                     │
│  [Horizontal bar chart: Location scores]                           │
│                                                                     │
│  Austin    ████████████████████████████████████████ 93.1           │
│  Denver    ████████████████████████████████████░░░░ 90.8           │
│  Chicago   ████████████████████████████████████░░░░ 91.5           │
│  Seattle   ██████████████████████████████████░░░░░░ 89.7           │
│  NYC       ████████████████████████████████░░░░░░░░ 87.2           │
│  LA        ██████████████████████████████░░░░░░░░░░ 84.3  ⚠        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ACTIVE INITIATIVES                                                 │
│  ──────────────────                                                 │
│                                                                     │
│  • LA Improvement Plan - In Progress (Week 3 of 12)                │
│  • Vendor Portal Enrollment - 3 of 5 complete                      │
│  • Q1 Training Program - 67% complete                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ROI THIS PERIOD                                                    │
│  ───────────────                                                    │
│                                                                     │
│  Documented savings from dashboard-driven actions:                  │
│                                                                     │
│  Training completions          $4,200/month                        │
│  Vendor workflow improvements  $8,400/month                        │
│  Process optimizations         $2,100/month                        │
│  ─────────────────────────────────────────                         │
│  Total Monthly Savings         $14,700/month                       │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Generated: {timestamp} | Page 1 of 1 | Ottimate Operational Dashboard│
└─────────────────────────────────────────────────────────────────────┘
```

### Data Requirements

```python
executive_summary_data = {
    "company_name": str,
    "date_range": { "start": date, "end": date },
    "three_things": [str, str, str],  # AI-generated
    "metrics": {
        "invoices_processed": { "value": int, "change_pct": float },
        "exception_rate": { "value": float, "change_pct": float },
        "touchless_rate": { "value": float, "change_pct": float },
        "cost_per_invoice": { "value": float, "change": float }
    },
    "locations": [
        { "name": str, "score": float, "alert": bool }
    ],
    "initiatives": [
        { "name": str, "status": str, "progress": str }
    ],
    "roi": {
        "training": float,
        "vendor": float,
        "process": float,
        "total": float
    }
}
```

### "Three Things to Know" Generation

```python
def generate_three_things(data: dict) -> list[str]:
    """
    AI-generated summary of the three most important items.
    
    Rules:
    1. Lead with the most impactful insight
    2. Include at least one positive and one area for attention
    3. Be specific with numbers
    4. Keep each under 50 words
    """
    
    insights = []
    
    # Check for critical issues first
    struggling_locations = [l for l in data['locations'] if l['score'] < 85]
    if struggling_locations:
        insights.append(
            f"{struggling_locations[0]['name']} needs attention with a score of "
            f"{struggling_locations[0]['score']}. The team has a 90-day improvement "
            f"plan in progress."
        )
    
    # Highlight wins
    if data['roi']['total'] > 10000:
        insights.append(
            f"Dashboard-driven actions saved ${data['roi']['total']:,.0f} this month, "
            f"primarily from vendor workflow improvements."
        )
    
    # Note trends
    if data['metrics']['touchless_rate']['change_pct'] > 2:
        insights.append(
            f"Touchless processing improved {data['metrics']['touchless_rate']['change_pct']:.1f}% "
            f"this period, reducing manual touches significantly."
        )
    
    return insights[:3]
```

---

## Location Report

### Purpose
Deep-dive into a single location's performance for regional managers.

### Page Layout (Page 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [OTTIMATE LOGO]              LOCATION REPORT                        │
│                              {Location Name}                        │
│                              {Date Range}                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  THREE THINGS TO KNOW                                               │
│  ─────────────────────                                              │
│                                                                     │
│  1. {Location-specific AI insight #1}                              │
│  2. {Location-specific AI insight #2}                              │
│  3. {Location-specific AI insight #3}                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PERFORMANCE SCORE: 84.3                                            │
│  ────────────────────────                                           │
│                                                                     │
│  [Gauge chart showing 84.3 out of 100]                             │
│                                                                     │
│  vs. Company Best (Austin): -8.8 points                            │
│  vs. Company Average: -3.2 points                                   │
│  Trend: ↓ -2.1 points from last period                             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  KEY METRICS                                                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Metric           │ Value  │ Target │ vs Best │ Status       │  │
│  ├──────────────────┼────────┼────────┼─────────┼──────────────┤  │
│  │ Invoices         │ 2,100  │ 2,000  │ —       │ ✓ On Track   │  │
│  │ Exception Rate   │ 14.2%  │ <10%   │ +5.3%   │ ⚠ Attention  │  │
│  │ Touchless Rate   │ 81.3%  │ >88%   │ -9.9%   │ ⚠ Attention  │  │
│  │ Processing Time  │ 7.8d   │ <6d    │ +2.0d   │ ⚠ Attention  │  │
│  │ Cost/Invoice     │ $6.20  │ <$5    │ +$2.00  │ ✗ Off Track  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TREND (Last 12 Weeks)                                              │
│                                                                     │
│  [Line chart: Score over time]                                      │
│                                                                     │
│  Score │                                                            │
│   90 ─┤                        ╭─────╮                              │
│   85 ─┤    ╭───────────────────╯     ╰──╮                          │
│   80 ─┤────╯                             ╰──────                   │
│   75 ─┼──────────────────────────────────────────                  │
│       │  W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Generated: {timestamp} | Page 1 of 3 | Ottimate Operational Dashboard│
└─────────────────────────────────────────────────────────────────────┘
```

### Page Layout (Page 2)

```
┌─────────────────────────────────────────────────────────────────────┐
│                              LOCATION REPORT                        │
│                              {Location Name} - Team Performance     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TEAM BREAKDOWN                                                     │
│  ──────────────                                                     │
│                                                                     │
│  Team Size: 2 processors                                            │
│  Team Average: 69 invoices/day                                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Name          │ Daily  │ vs Avg │ Exceptions │ Category      │  │
│  ├───────────────┼────────┼────────┼────────────┼───────────────┤  │
│  │ Mike Davis    │ 72     │ +4%    │ 41         │ Below Average │  │
│  │ John Miller   │ 65     │ -6%    │ 52         │ Needs Help    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [Performance bar chart by team member]                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  EXCEPTION ANALYSIS                                                 │
│  ──────────────────                                                 │
│                                                                     │
│  Total Exceptions: 298                                              │
│  Exception Rate: 14.2%                                              │
│                                                                     │
│  By Type:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Missing PO      ████████████████████████████  42%  (125)    │   │
│  │ GL Code Missing ██████████████████░░░░░░░░░░  28%  (83)     │   │
│  │ Vendor Mapping  ████████░░░░░░░░░░░░░░░░░░░░  15%  (45)     │   │
│  │ Amount Mismatch █████░░░░░░░░░░░░░░░░░░░░░░░  10%  (30)     │   │
│  │ Other           ███░░░░░░░░░░░░░░░░░░░░░░░░░   5%  (15)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Top Root Causes:                                                   │
│  1. Worldwide Produce accounts for 68% of Missing PO exceptions    │
│  2. GL training gap identified for both team members               │
│  3. New vendor mapping issues from recent additions                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ACTIVE ACTIONS                                                     │
│  ──────────────                                                     │
│                                                                     │
│  ✓ John Miller assigned mentor (Lara Patel) - Week 2               │
│  ◐ GL Code training scheduled - 50% complete                       │
│  ○ Worldwide Produce workflow - Pending vendor response            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Generated: {timestamp} | Page 2 of 3 | Ottimate Operational Dashboard│
└─────────────────────────────────────────────────────────────────────┘
```

### Page Layout (Page 3)

```
┌─────────────────────────────────────────────────────────────────────┐
│                              LOCATION REPORT                        │
│                              {Location Name} - Recommendations      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  RECOMMENDATIONS                                                    │
│  ───────────────                                                    │
│                                                                     │
│  PRIORITY 1: Address Worldwide Produce PO Issues                   │
│  ─────────────────────────────────────────────                     │
│  Impact: $2,840/month                                              │
│  Current: 68% of their invoices missing PO                         │
│  Action: Vendor workflow started Jan 15, awaiting response         │
│  Owner: Sarah Wilson                                               │
│  Target: 30 days to resolution                                     │
│                                                                     │
│  PRIORITY 2: GL Code Training                                       │
│  ────────────────────────────                                       │
│  Impact: $1,420/month                                              │
│  Current: 28% of exceptions are GL-related                         │
│  Action: Training modules assigned, 50% complete                   │
│  Owner: [Manager Name]                                             │
│  Target: Feb 28 completion                                         │
│                                                                     │
│  PRIORITY 3: Replicate Austin Practices                            │
│  ──────────────────────────────────────                            │
│  Impact: $4,420/month potential                                    │
│  Current: 8.8 point gap to Austin                                  │
│  Action: Requested Austin SOPs, playbook pending                   │
│  Owner: [Manager Name]                                             │
│  Target: Q1 2026                                                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  30-DAY TARGETS                                                     │
│  ──────────────                                                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Metric           │ Current │ Target  │ Gap to Close         │   │
│  ├──────────────────┼─────────┼─────────┼──────────────────────┤   │
│  │ Exception Rate   │ 14.2%   │ 11.0%   │ -3.2%                │   │
│  │ Touchless Rate   │ 81.3%   │ 85.0%   │ +3.7%                │   │
│  │ Processing Time  │ 7.8d    │ 7.0d    │ -0.8d                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  These targets represent a realistic 30-day improvement based on   │
│  active initiatives. Full alignment with Austin expected in 90d.   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Generated: {timestamp} | Page 3 of 3 | Ottimate Operational Dashboard│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Team Performance Report

### Purpose
Staff performance overview for AP managers conducting reviews.

### Content Structure

**Page 1: Team Overview**
- Team size and average metrics
- Performance distribution chart
- Top performers and those needing attention
- Team trend over time

**Page 2: Individual Details**
- Each team member's metrics table
- Performance category and trend
- Exception breakdown per person
- Active development actions (mentorship, training)

**Page 3: Recommendations**
- Training needs summary
- Suggested mentor pairings
- Workload rebalancing suggestions
- 30-day improvement targets

---

## Vendor Analysis Report

### Purpose
Single vendor deep-dive for procurement discussions or vendor reviews.

### Content Structure

**Page 1: Vendor Overview**
- Vendor name, spend, invoice volume
- Vendor score breakdown
- Key issues identified
- Comparison to average vendor

**Page 2: Issue Details & Actions**
- Exception breakdown by type
- Trend over time
- Active workflow status
- Cost impact calculations
- Recommended next steps

---

## QBR (Quarterly Business Review)

### Purpose
Comprehensive quarterly review for executive presentations.

### Content Structure

**Page 1: Executive Summary**
- Quarter highlights
- Key metrics vs. goals
- ROI summary

**Page 2: Location Performance**
- All locations comparison
- Quarter-over-quarter trends
- Best practices identified

**Page 3: Team Performance**
- Aggregate team metrics
- Training completion rates
- Mentorship program results

**Page 4: Vendor Analysis**
- Top vendors by volume/spend
- Problem vendors addressed
- Vendor portal adoption

**Page 5: Initiatives & ROI**
- Completed initiatives and outcomes
- In-progress initiatives
- Documented savings

**Page 6: Next Quarter Plan**
- Priorities identified
- Target metrics
- Planned initiatives

---

## PDF Generation Technical Specs

### Template Engine

```python
# app/services/reports.py
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
import io

class ReportGenerator:
    def __init__(self):
        self.templates = Environment(
            loader=FileSystemLoader('templates/reports')
        )
        self.base_css = CSS(filename='templates/reports/base.css')
    
    def generate_executive_summary(self, data: dict) -> bytes:
        # Generate AI summary
        data['three_things'] = self._generate_three_things(data)
        
        # Render charts as base64 images
        data['location_chart'] = self._render_location_chart(data['locations'])
        
        # Render template
        template = self.templates.get_template('executive_summary.html')
        html_content = template.render(data)
        
        # Generate PDF
        pdf_buffer = io.BytesIO()
        HTML(string=html_content).write_pdf(
            pdf_buffer,
            stylesheets=[self.base_css]
        )
        
        return pdf_buffer.getvalue()
```

### CSS Styling

```css
/* templates/reports/base.css */

@page {
    size: letter;
    margin: 0.75in;
    
    @top-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 9pt;
        color: #666;
    }
    
    @bottom-center {
        content: "Generated by Ottimate Operational Dashboard";
        font-size: 8pt;
        color: #999;
    }
}

body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #1e293b;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 12pt;
    margin-bottom: 18pt;
}

.logo {
    height: 32pt;
}

.title {
    font-size: 18pt;
    font-weight: 700;
    color: #0f172a;
}

.subtitle {
    font-size: 11pt;
    color: #64748b;
}

.section {
    margin-bottom: 18pt;
}

.section-title {
    font-size: 12pt;
    font-weight: 600;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6pt;
    margin-bottom: 12pt;
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12pt;
}

.metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6pt;
    padding: 12pt;
    text-align: center;
}

.metric-value {
    font-size: 20pt;
    font-weight: 700;
    color: #0f172a;
}

.metric-label {
    font-size: 8pt;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
}

.metric-change {
    font-size: 9pt;
    margin-top: 4pt;
}

.metric-change.positive { color: #10b981; }
.metric-change.negative { color: #ef4444; }

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
}

th {
    background: #f1f5f9;
    padding: 8pt;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 8pt;
    border-bottom: 1px solid #e2e8f0;
}

.status-good { color: #10b981; }
.status-warning { color: #f59e0b; }
.status-bad { color: #ef4444; }

.three-things {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 12pt;
    margin-bottom: 18pt;
}

.three-things-item {
    margin-bottom: 8pt;
}

.three-things-item:last-child {
    margin-bottom: 0;
}
```

### Chart Rendering

```python
import matplotlib.pyplot as plt
import base64
from io import BytesIO

def render_bar_chart(data: list[dict], title: str) -> str:
    """Render chart and return as base64 for embedding in HTML."""
    
    fig, ax = plt.subplots(figsize=(6, 3))
    
    names = [d['name'] for d in data]
    values = [d['score'] for d in data]
    colors = ['#10b981' if v >= 90 else '#3b82f6' if v >= 85 else '#f59e0b' if v >= 80 else '#ef4444' for v in values]
    
    ax.barh(names, values, color=colors)
    ax.set_xlim(0, 100)
    ax.set_xlabel('Score')
    ax.set_title(title)
    
    # Style
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    # Save to buffer
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    plt.close()
    
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode()
```

---

## Scheduled Reports

### Configuration Storage

```sql
CREATE TABLE dashboard.scheduled_reports (
    id String,
    user_id String,
    report_type String,  -- 'executive_summary', 'location', etc.
    
    -- Scope
    location_ids Array(String),
    
    -- Schedule
    frequency String,  -- 'daily', 'weekly', 'monthly'
    day_of_week Nullable(UInt8),  -- 0-6 for weekly
    day_of_month Nullable(UInt8),  -- 1-28 for monthly
    hour UInt8,  -- 0-23 in user's timezone
    timezone String,
    
    -- Delivery
    recipients Array(String),  -- email addresses
    include_pdf Bool DEFAULT true,
    
    -- Status
    is_active Bool DEFAULT true,
    last_sent_at Nullable(DateTime),
    next_send_at DateTime,
    
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (user_id, id);
```

### Scheduler Job

```python
# app/jobs/report_scheduler.py

from celery import shared_task
from datetime import datetime, timedelta
import pytz

@shared_task
def process_scheduled_reports():
    """Run hourly to send due reports."""
    
    now = datetime.utcnow()
    
    # Find reports due in this hour
    due_reports = db.execute("""
        SELECT * FROM dashboard.scheduled_reports
        WHERE is_active = true
        AND next_send_at <= %(now)s
    """, {'now': now})
    
    for report in due_reports:
        try:
            # Generate report
            pdf_bytes = report_generator.generate(
                report_type=report['report_type'],
                location_ids=report['location_ids']
            )
            
            # Send emails
            for recipient in report['recipients']:
                email_service.send_report(
                    to=recipient,
                    report_type=report['report_type'],
                    pdf_attachment=pdf_bytes
                )
            
            # Update next send time
            next_send = calculate_next_send(report)
            db.execute("""
                UPDATE dashboard.scheduled_reports
                SET last_sent_at = %(now)s, next_send_at = %(next)s
                WHERE id = %(id)s
            """, {'now': now, 'next': next_send, 'id': report['id']})
            
        except Exception as e:
            log.error(f"Failed to send scheduled report {report['id']}: {e}")


def calculate_next_send(report: dict) -> datetime:
    """Calculate next send time based on frequency."""
    
    tz = pytz.timezone(report['timezone'])
    now = datetime.now(tz)
    
    if report['frequency'] == 'daily':
        next_date = now.date() + timedelta(days=1)
        
    elif report['frequency'] == 'weekly':
        days_until = (report['day_of_week'] - now.weekday()) % 7
        if days_until == 0 and now.hour >= report['hour']:
            days_until = 7
        next_date = now.date() + timedelta(days=days_until)
        
    elif report['frequency'] == 'monthly':
        # Next month on the specified day
        if now.day > report['day_of_month']:
            next_month = now.month + 1 if now.month < 12 else 1
            next_year = now.year if now.month < 12 else now.year + 1
        else:
            next_month = now.month
            next_year = now.year
        next_date = date(next_year, next_month, report['day_of_month'])
    
    return tz.localize(datetime.combine(next_date, time(report['hour'], 0)))
```
