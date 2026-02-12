# Insight Rules

This document defines the rules that generate AI-powered insights. Each rule specifies the condition that triggers an insight, how to calculate cost impact, and the recommended actions.

---

## Insight Structure

Every insight contains:

```typescript
interface Insight {
  id: string;
  type: InsightType;
  severity: 'critical' | 'warning' | 'opportunity';
  title: string;           // Clear, actionable headline
  description: string;     // What the data shows
  costImpact: number;      // Monthly dollar amount
  recommendation: string;  // What to do about it
  actions: Action[];       // Available action buttons
  entities: {              // Related data
    userId?: string;
    locationId?: string;
    vendorId?: string;
  };
  metricsSnapshot: object; // Data at time of generation
  generatedAt: Date;
}
```

---

## Severity Levels

| Severity | Criteria | UI Treatment |
|----------|----------|--------------|
| **Critical** | Immediate action required; significant cost impact | Red badge, top of list |
| **Warning** | Attention needed; moderate impact | Amber badge, standard position |
| **Opportunity** | Potential improvement; proactive | Green badge, lower priority |

---

## Staff Performance Insights

### INSIGHT-001: Staff Significantly Below Average

**Trigger Condition:**
```python
user_processing_volume < team_average * 0.80  # >20% below
```

**Severity:** Critical (if >35% below) or Warning (if 20-35% below)

**Title Template:**
- Critical: `"{name} needs immediate attention"`
- Warning: `"{name} is processing below team average"`

**Description Template:**
```
{name} is processing {volume} invoices per day, which is {pct_below}% below 
the team average of {team_avg}. This has been consistent for the past {weeks} weeks.
```

**Cost Impact Calculation:**
```python
gap_invoices = team_average - user_volume  # daily gap
minutes_lost = gap_invoices * 8  # 8 min per invoice
monthly_cost = (minutes_lost / 60) * 25 * 22  # hours * rate * workdays
```

**Recommended Actions:**
1. `assign_mentor` — Pair with top performer
2. `prepare_review` — Generate performance review prep

**Example:**
> **John Miller needs immediate attention**
> 
> John Miller is processing 65 invoices per day, which is 23% below the team average of 84. This has been consistent for the past 4 weeks.
> 
> **Cost Impact:** $840/month
> 
> **Recommended:** Schedule a 1:1 to discuss workload and consider pairing with a mentor.
> 
> [Assign Mentor] [Prepare Review]

---

### INSIGHT-002: High Exception Rate (Individual)

**Trigger Condition:**
```python
user_exception_rate > 0.15  # >15% of their invoices have exceptions
```

**Severity:** Critical (if >25%) or Warning (if 15-25%)

**Title Template:**
```
"{name} has elevated exception rate"
```

**Description Template:**
```
{name}'s invoices have a {rate}% exception rate, compared to the team average 
of {team_avg}%. The most common exception types are: {top_exceptions}.
```

**Cost Impact Calculation:**
```python
excess_exceptions = user_exceptions - (user_volume * team_avg_rate)
monthly_cost = excess_exceptions * 15 / 60 * 25  # 15 min per exception
```

**Recommended Actions:**
1. `prepare_review` — Discuss exception patterns
2. `generate_training_recommendation` — If specific exception type dominates

**Exception Type to Training Mapping:**
| Exception Type | Training Recommendation |
|----------------|------------------------|
| GL Code Missing | GL Code Training |
| Missing PO | PO Compliance Training |
| Vendor Mapping | Vendor Master Training |
| Amount Mismatch | Invoice Verification Training |

---

### INSIGHT-003: Training Opportunity Detected

**Trigger Condition:**
```python
# Specific exception type is >50% of user's exceptions
dominant_exception_pct > 0.50 AND total_exceptions > 10
```

**Severity:** Warning

**Title Template:**
```
"Training recommended for {name}: {exception_type}"
```

**Description Template:**
```
{pct}% of {name}'s exceptions are {exception_type} issues. Targeted training 
could reduce this by an estimated 40-60%.
```

**Cost Impact Calculation:**
```python
reducible_exceptions = user_exceptions_of_type * 0.50  # assume 50% reduction
monthly_savings = reducible_exceptions * 15 / 60 * 25
```

**Recommended Actions:**
1. `generate_training_recommendation` — Create training brief

---

## Location Performance Insights

### INSIGHT-010: Location Significantly Below Best Performer

**Trigger Condition:**
```python
location_score < best_location_score * 0.90  # >10% below best
```

**Severity:** Critical (if >20% below) or Warning (if 10-20% below)

**Title Template:**
- Critical: `"{location} requires intervention"`
- Warning: `"{location} is underperforming vs. {best_location}"`

**Description Template:**
```
{location} has a score of {score}, which is {pct_below}% below {best_location} ({best_score}). 
Key gaps: {gap_summary}.
```

**Cost Impact Calculation:**
```python
# Based on cost per invoice difference
cost_gap = location_cost_per_invoice - best_cost_per_invoice
monthly_volume = location_invoice_count
monthly_cost = cost_gap * monthly_volume
```

**Recommended Actions:**
1. `generate_location_comparison` — Detailed gap analysis
2. `set_benchmark_target` — Set improvement goals
3. `generate_training_recommendation` — If exception-driven

---

### INSIGHT-011: Location Best Practice Opportunity

**Trigger Condition:**
```python
location_score >= 90 AND location_score == max(all_location_scores)
```

**Severity:** Opportunity

**Title Template:**
```
"{location} best practices ready to replicate"
```

**Description Template:**
```
{location} is your top performer with a score of {score}. Key strengths: 
{strengths}. These practices could benefit other locations.
```

**Cost Impact Calculation:**
```python
# Potential savings if other locations matched
other_locations_gap = sum(best_score - loc_score for loc in other_locations)
potential_savings = average_savings_per_point * other_locations_gap
```

**Recommended Actions:**
1. `generate_location_comparison` — Document what makes them great
2. `request_sop_upload` — Gather their documentation

---

### INSIGHT-012: Location Exception Spike

**Trigger Condition:**
```python
current_period_exception_rate > previous_period_rate * 1.25  # >25% increase
AND current_period_exception_rate > 0.10  # Must be meaningful level
```

**Severity:** Warning

**Title Template:**
```
"Exception rate rising at {location}"
```

**Description Template:**
```
{location}'s exception rate increased from {prev_rate}% to {curr_rate}% 
over the past {period}. Primary drivers: {top_exception_changes}.
```

**Recommended Actions:**
1. `generate_location_comparison` — Investigate vs. stable locations
2. `generate_training_recommendation` — If training-addressable

---

## Vendor Insights

### INSIGHT-020: Vendor Critical Issues

**Trigger Condition:**
```python
vendor_score < 70
```

**Severity:** Critical

**Title Template:**
```
"{vendor} causing significant processing overhead"
```

**Description Template:**
```
{vendor} has a vendor score of {score}. Issues: {issues_summary}. 
This vendor accounts for {pct}% of your exceptions.
```

**Cost Impact Calculation:**
```python
vendor_exceptions = count_exceptions_from_vendor(vendor_id)
monthly_cost = vendor_exceptions * 15 / 60 * 25
```

**Recommended Actions:**
1. `start_vendor_workflow` — Begin improvement process

---

### INSIGHT-021: Vendor High Missing PO Rate

**Trigger Condition:**
```python
vendor_po_match_rate < 0.70  # <70% have POs
AND vendor_invoice_count > 50  # Meaningful volume
```

**Severity:** Critical (if <50%) or Warning (if 50-70%)

**Title Template:**
```
"{vendor} missing PO on {pct}% of invoices"
```

**Description Template:**
```
{pct}% of invoices from {vendor} are missing purchase orders. This creates 
manual work for your team and delays processing by an average of {days} days.
```

**Cost Impact Calculation:**
```python
missing_po_invoices = vendor_invoices * (1 - po_match_rate)
monthly_cost = missing_po_invoices * 15 / 60 * 25  # extra handling time
```

**Recommended Actions:**
1. `start_vendor_workflow` — PO compliance outreach

---

### INSIGHT-022: Vendor Processing Delays

**Trigger Condition:**
```python
vendor_avg_processing_time > overall_avg_time * 2  # 2x slower than average
AND vendor_invoice_count > 20
```

**Severity:** Warning

**Title Template:**
```
"Invoices from {vendor} take {time} days to process"
```

**Description Template:**
```
{vendor} invoices take an average of {time} days to process, compared to 
your overall average of {avg_time} days. This is primarily due to: {reasons}.
```

**Recommended Actions:**
1. `start_vendor_workflow` — Address root cause

---

### INSIGHT-023: Vendor GL Mapping Issues

**Trigger Condition:**
```python
vendor_gl_mapping_rate < 0.80  # <80% correct on first attempt
AND vendor_invoice_count > 30
```

**Severity:** Warning

**Title Template:**
```
"{vendor} GL mapping needs attention"
```

**Description Template:**
```
{pct}% of invoices from {vendor} require GL code correction. Common issues: 
{common_gl_errors}.
```

**Recommended Actions:**
1. `start_vendor_workflow` — Discuss invoice formatting
2. `generate_training_recommendation` — If processor-side issue

---

## Insight Generation Logic

### Generation Frequency

| Insight Type | Refresh Frequency |
|--------------|-------------------|
| Staff Performance | Every 4 hours |
| Location Performance | Every 4 hours |
| Vendor Issues | Every 4 hours |
| Training Opportunities | Daily |
| Best Practice | Weekly |

### Deduplication Rules

1. **Same insight, same entity:** Don't regenerate if existing active insight
2. **Similar insights:** Combine (e.g., multiple exception types for same user)
3. **Superseded insights:** Mark old as inactive when conditions change

### Priority Scoring

```python
def calculate_insight_priority(insight):
    base_score = {
        'critical': 100,
        'warning': 50,
        'opportunity': 25
    }[insight.severity]
    
    # Boost by cost impact (normalized)
    cost_boost = min(insight.cost_impact / 1000, 50)  # Max 50 points
    
    # Boost if no action taken yet
    action_boost = 20 if not insight.has_actions_taken else 0
    
    # Recency boost
    recency_boost = 10 if insight.age_days < 7 else 0
    
    return base_score + cost_boost + action_boost + recency_boost
```

### Display Limits

- **Overview tab:** Top 5 insights by priority
- **Full insights view:** All active insights, paginated
- **Per-entity view:** All insights for that user/location/vendor

---

## Insight Dismissal

Users can dismiss insights with a reason:

| Dismissal Reason | Effect |
|------------------|--------|
| "Already addressed" | Mark inactive, log action |
| "Not relevant" | Mark inactive, don't regenerate for 30 days |
| "Will address later" | Keep active but lower priority |

Dismissed insights logged in activity history.

---

## Insight Title Guidelines

**Do:**
- Lead with the entity name
- Use action-oriented language
- Be specific about the issue

**Don't:**
- Use technical jargon (no "z-score", no "standard deviation")
- Be vague ("Performance issue detected")
- Use alarming language unnecessarily

**Good Examples:**
- "John Miller needs immediate attention"
- "LA office exception rate rising"
- "Sysco invoices processing smoothly" (opportunity)

**Bad Examples:**
- "User ID 12345 below threshold"
- "Warning: Location underperforming"
- "Vendor score critical alert"

---

## Tooltip Text

Each insight should have hover text explaining:

1. **How was this calculated?**
   > "Based on {name}'s processing volume of {X} invoices/day compared to the team average of {Y}."

2. **What does the cost represent?**
   > "This represents the estimated monthly cost of the productivity gap at $25/hour."

3. **Why this recommendation?**
   > "Mentor assignments have shown a 25% improvement rate in similar cases."
