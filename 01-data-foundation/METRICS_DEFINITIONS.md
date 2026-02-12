# Metrics Definitions

Complete specification for all metrics displayed in the dashboard. Each metric includes calculation logic, display format, and implementation notes.

---

## Metric Categories

| Category | Metrics |
|----------|---------|
| Volume | Processing Volume, Invoice Count |
| Time | Processing Time, Exception Resolution Time |
| Quality | Exception Rate, Touchless Rate, PO Match Rate, GL Mapping Rate |
| Cost | Cost Per Invoice, Total AP Cost, Cost Impact |
| Composite | Location Score, Vendor Score, Staff Performance Category |

---

## Volume Metrics

### Processing Volume (Individual)

**Purpose:** Measure individual processor throughput

**Calculation:**
```sql
SELECT 
    processor_id,
    COUNT(*) as invoice_count,
    COUNT(*) / DATEDIFF('day', MIN(processed_at), MAX(processed_at) + 1) as daily_average
FROM invoices
WHERE processed_at BETWEEN @start_date AND @end_date
  AND processor_id = @user_id
GROUP BY processor_id
```

**Display:**
- Primary: "87 invoices" (period total)
- Secondary: "14.5/day avg"

**Comparison:**
```sql
-- Team average for comparison
SELECT AVG(user_count) as team_average
FROM (
    SELECT processor_id, COUNT(*) as user_count
    FROM invoices
    WHERE processed_at BETWEEN @start_date AND @end_date
      AND location_id IN (@selected_locations)
    GROUP BY processor_id
)
```

**UI Notes:**
- Show vs. team average as +/- number
- Color code: green if above average, red if >20% below

---

### Processing Volume (Location)

**Purpose:** Measure location throughput

**Calculation:**
```sql
SELECT 
    location_id,
    COUNT(*) as invoice_count
FROM invoices
WHERE processed_at BETWEEN @start_date AND @end_date
  AND location_id = @location_id
GROUP BY location_id
```

**Display:** "2,890 invoices"

---

### Processing Volume (Vendor)

**Purpose:** Measure invoice volume from vendor

**Calculation:**
```sql
SELECT 
    vendor_id,
    COUNT(*) as invoice_count,
    SUM(amount) as total_spend
FROM invoices
WHERE received_at BETWEEN @start_date AND @end_date
  AND vendor_id = @vendor_id
GROUP BY vendor_id
```

**Display:** 
- "970 invoices"
- "$858,677 spend"

---

## Time Metrics

### Processing Time (Average)

**Purpose:** Measure efficiency of invoice processing

**Calculation:**
```sql
SELECT 
    AVG(
        DATEDIFF('hour', received_at, processed_at) / 24.0
    ) as avg_processing_days
FROM invoices
WHERE processed_at BETWEEN @start_date AND @end_date
  AND processed_at IS NOT NULL
  AND [filter by user/location/vendor]
```

**Display:** "4.2 days avg"

**Interpretation:**
- <3 days: Excellent
- 3-5 days: Good
- 5-7 days: Average
- >7 days: Needs attention

**UI Notes:**
- Show trend arrow if comparing periods
- Highlight if >50% above team/location average

---

### Exception Resolution Time

**Purpose:** Measure time to resolve flagged issues

**Calculation:**
```sql
SELECT 
    AVG(
        DATEDIFF('hour', flagged_at, resolved_at) / 24.0
    ) as avg_resolution_days
FROM invoice_exceptions
WHERE resolved_at BETWEEN @start_date AND @end_date
  AND resolved_at IS NOT NULL
  AND [filter by related invoice's user/location]
```

**Display:** "3.2 days avg"

**Thresholds:**
- <2 days: Excellent
- 2-3 days: Good
- 3-5 days: Average
- >5 days: Needs attention (trigger insight)

---

## Quality Metrics

### Exception Rate

**Purpose:** Measure invoice quality/processing accuracy

**Calculation:**
```sql
SELECT 
    COUNT(DISTINCT ie.invoice_id) * 100.0 / COUNT(DISTINCT i.id) as exception_rate
FROM invoices i
LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
WHERE i.processed_at BETWEEN @start_date AND @end_date
  AND [filter by user/location/vendor]
```

**Display:** "12.4%"

**Thresholds:**
- <8%: Excellent
- 8-12%: Good
- 12-15%: Average
- >15%: Needs attention (trigger insight at individual level)
- >20%: Critical

**UI Notes:**
- Lower is better
- Color: green <10%, amber 10-15%, red >15%

---

### Exception Rate by Type

**Purpose:** Break down exceptions for targeted improvement

**Calculation:**
```sql
SELECT 
    exception_type,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM invoice_exceptions ie
JOIN invoices i ON ie.invoice_id = i.id
WHERE ie.flagged_at BETWEEN @start_date AND @end_date
  AND [filter by user/location/vendor]
GROUP BY exception_type
ORDER BY count DESC
```

**Display:**
| Exception Type | Count | % of Total |
|----------------|-------|------------|
| GL Code Missing | 142 | 34% |
| Missing PO | 98 | 23% |
| ... | ... | ... |

---

### Touchless Rate

**Purpose:** Measure automation effectiveness

**Calculation:**
```sql
SELECT 
    COUNT(CASE WHEN ie.id IS NULL THEN 1 END) * 100.0 / COUNT(*) as touchless_rate
FROM invoices i
LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
WHERE i.processed_at BETWEEN @start_date AND @end_date
  AND [filter by location]
```

**Display:** "87.2%"

**Note:** Touchless = no exceptions flagged (processed automatically)

**Thresholds:**
- >90%: Excellent
- 85-90%: Good
- 80-85%: Average
- <80%: Needs attention

---

### PO Match Rate

**Purpose:** Measure purchase order compliance

**Calculation:**
```sql
SELECT 
    COUNT(CASE WHEN po_number IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as po_match_rate
FROM invoices
WHERE processed_at BETWEEN @start_date AND @end_date
  AND [filter by location/vendor]
```

**Display:** "91.4%"

**Thresholds:**
- >95%: Excellent
- 90-95%: Good
- 85-90%: Average
- <85%: Needs attention (trigger insight)
- <70%: Critical

---

### GL Mapping Rate

**Purpose:** Measure GL code accuracy

**Calculation:**
```sql
SELECT 
    COUNT(CASE WHEN NOT EXISTS (
        SELECT 1 FROM invoice_exceptions ie 
        WHERE ie.invoice_id = i.id 
        AND ie.exception_type = 'gl_code_missing'
    ) THEN 1 END) * 100.0 / COUNT(*) as gl_mapping_rate
FROM invoices i
WHERE i.processed_at BETWEEN @start_date AND @end_date
  AND [filter by user/location]
```

**Display:** "88.7%"

**Thresholds:**
- >95%: Excellent
- 90-95%: Good
- 85-90%: Average
- <85%: Needs attention (trigger training recommendation)

---

## Cost Metrics

### Cost Per Invoice

**Purpose:** Primary efficiency metric

**Calculation:**
```sql
WITH processing_time AS (
    SELECT 
        SUM(
            CASE 
                WHEN ie.id IS NOT NULL THEN 15  -- 15 min for exception handling
                ELSE 0 
            END +
            CASE 
                WHEN ie.id IS NULL THEN 2  -- 2 min touchless
                ELSE 8  -- 8 min manual
            END
        ) / 60.0 as total_hours,
        COUNT(*) as invoice_count
    FROM invoices i
    LEFT JOIN invoice_exceptions ie ON i.id = ie.invoice_id
    WHERE i.processed_at BETWEEN @start_date AND @end_date
      AND [filter by location]
)
SELECT 
    (total_hours * 25.00) / invoice_count as cost_per_invoice
FROM processing_time
```

**Display:** "$4.82"

**Cost Basis:**
- $25/hour AP staff rate
- 2 minutes touchless processing
- 8 minutes manual processing
- 15 minutes exception resolution

**Thresholds:**
- <$4: Excellent
- $4-5: Good
- $5-7: Average
- >$7: Needs attention

---

### Total AP Cost

**Purpose:** Aggregate cost for period

**Calculation:**
```sql
-- Same as above but return total, not per-invoice
SELECT 
    total_hours * 25.00 as total_ap_cost
FROM processing_time_cte
```

**Display:** "$142,800"

---

### Cost Impact (for Insights)

**Purpose:** Translate inefficiency to dollars

**Calculation Patterns:**

**Underperforming Staff:**
```sql
-- Hours lost due to below-average performance
WITH team_avg AS (
    SELECT AVG(invoice_count) as avg_invoices
    FROM user_processing_summary
    WHERE location_id IN (@locations)
),
user_perf AS (
    SELECT invoice_count
    FROM user_processing_summary
    WHERE user_id = @user_id
)
SELECT 
    (team_avg.avg_invoices - user_perf.invoice_count) 
    * 8 / 60  -- 8 min per invoice gap
    * 25.00   -- hourly rate
    * 22      -- work days per month
    as monthly_cost_impact
FROM team_avg, user_perf
```

**Exception Overhead:**
```sql
SELECT 
    COUNT(*) * 15 / 60 * 25.00 as exception_cost
FROM invoice_exceptions
WHERE flagged_at BETWEEN @start_date AND @end_date
  AND [filter]
```

**Display:** "$2,340/month" or "~$28,000/year"

---

## Composite Scores

### Location Score

**Purpose:** Single number for location health

**Calculation:**
```python
def calculate_location_score(location_id, period):
    # Get component metrics
    touchless_rate = get_touchless_rate(location_id, period)
    exception_rate = get_exception_rate(location_id, period)
    
    # Get best performer for comparison
    best_processing_time = get_best_processing_time(period)
    location_processing_time = get_processing_time(location_id, period)
    
    best_cost = get_best_cost_per_invoice(period)
    location_cost = get_cost_per_invoice(location_id, period)
    
    # Calculate relative scores (0-100)
    processing_time_score = max(0, 100 - (location_processing_time / best_processing_time - 1) * 100)
    cost_score = max(0, 100 - (location_cost / best_cost - 1) * 100)
    
    # Weighted composite
    score = (
        touchless_rate * 0.30 +
        (100 - exception_rate) * 0.25 +
        processing_time_score * 0.25 +
        cost_score * 0.20
    )
    
    return round(score, 1)
```

**Weights:**
| Component | Weight | Rationale |
|-----------|--------|-----------|
| Touchless Rate | 30% | Automation is primary goal |
| Exception Rate (inverse) | 25% | Quality matters |
| Processing Time vs Best | 25% | Speed matters |
| Cost vs Best | 20% | Efficiency outcome |

**Display:** "91.3" with color badge

**Color Coding:**
- ≥90: Green (Excellent)
- 80-89: Blue (Good)
- 70-79: Amber (Needs Attention)
- <70: Red (Critical)

---

### Vendor Score

**Purpose:** Single number for vendor invoice quality

**Calculation:**
```python
def calculate_vendor_score(vendor_id, period):
    po_match_rate = get_po_match_rate(vendor_id, period)
    gl_mapping_rate = get_gl_mapping_rate(vendor_id, period)
    error_rate = get_error_rate(vendor_id, period)
    
    score = (
        po_match_rate * 0.40 +
        gl_mapping_rate * 0.30 +
        (100 - error_rate) * 0.30
    )
    
    return round(score, 0)
```

**Weights:**
| Component | Weight | Rationale |
|-----------|--------|-----------|
| PO Match Rate | 40% | Primary compliance indicator |
| GL Mapping Rate | 30% | Data quality |
| Error Rate (inverse) | 30% | Overall quality |

**Display:** "84" with color badge

---

### Staff Performance Category

**Purpose:** Categorize staff relative to team

**Calculation:**
```python
def get_performance_category(user_id, period, location_ids):
    user_volume = get_processing_volume(user_id, period)
    team_avg = get_team_average(location_ids, period)
    
    variance_pct = (user_volume - team_avg) / team_avg * 100
    
    if variance_pct > 20:
        return "Exceptional", "green"
    elif variance_pct > 5:
        return "Above Average", "blue"
    elif variance_pct >= -5:
        return "Average", "purple"
    elif variance_pct >= -20:
        return "Below Average", "amber"
    else:
        return "Needs Attention", "red"
```

**Categories:**
| Category | Criteria | Color | Hex |
|----------|----------|-------|-----|
| Exceptional | >20% above avg | Green | #10b981 |
| Above Average | 5-20% above | Blue | #3b82f6 |
| Average | ±5% of avg | Purple | #8b5cf6 |
| Below Average | 5-20% below | Amber | #f59e0b |
| Needs Attention | >20% below | Red | #ef4444 |

---

## Trend Calculations

### Period-over-Period Change

**Calculation:**
```sql
WITH current_period AS (
    SELECT [metric] as current_value
    FROM [source]
    WHERE date BETWEEN @current_start AND @current_end
),
previous_period AS (
    SELECT [metric] as previous_value
    FROM [source]
    WHERE date BETWEEN @previous_start AND @previous_end
)
SELECT 
    current_value,
    previous_value,
    (current_value - previous_value) / previous_value * 100 as change_pct
FROM current_period, previous_period
```

**Display:**
- "↑ 12.3%" (green if improvement)
- "↓ 5.2%" (red if decline)
- "→ 0.1%" (neutral if <1% change)

**Note:** Direction of "improvement" depends on metric:
- Processing Volume: up is good
- Exception Rate: down is good
- Cost: down is good
- Touchless Rate: up is good

---

## Aggregation Rules

### Time Periods

| Period | Definition |
|--------|------------|
| Last 7 Days | Today - 7 days to Today |
| Last 30 Days | Today - 30 days to Today |
| Last 90 Days | Today - 90 days to Today |
| This Month | First day of current month to Today |
| This Quarter | First day of current quarter to Today |
| Custom | User-selected start and end dates |

### Location Filtering

When multiple locations selected:
- Volume metrics: SUM across locations
- Rate metrics: Weighted average by invoice count
- Scores: Average (unweighted)
- Comparison: Each location shown separately

### Null Handling

| Scenario | Handling |
|----------|----------|
| No invoices in period | Show "No data" |
| No exceptions | Exception rate = 0% |
| No resolved exceptions | Resolution time = "N/A" |
| Division by zero | Return null, display "—" |

---

## Performance Notes

### Query Optimization

1. **Pre-aggregate daily metrics** — Don't calculate from raw invoices on every request
2. **Materialized views** — For location scores, vendor scores
3. **Limit drill-down results** — Max 1000 invoices in detail view
4. **Cache team averages** — Recalculate hourly, not per-request

### Refresh Frequency

| Metric Type | Refresh |
|-------------|---------|
| Real-time counts | On request |
| Averages/rates | Hourly |
| Composite scores | Hourly |
| Trend comparisons | Daily |
| Insights | Every 4 hours |
