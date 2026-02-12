# Sample Data Specification

Guidelines for generating realistic test data that matches production patterns.

---

## Overview

Sample data should:
- Match production schema exactly
- Include realistic distributions and edge cases
- Support all dashboard features
- Be deterministic (reproducible with seed)

---

## Volume Guidelines

### Recommended Dataset Sizes

| Entity | Development | Staging | Load Testing |
|--------|-------------|---------|--------------|
| Locations | 6 | 20 | 100 |
| Users (processors) | 12 | 50 | 500 |
| Vendors | 50 | 200 | 2,000 |
| Invoices | 5,000 | 50,000 | 500,000 |
| Exceptions | 1,500 | 15,000 | 150,000 |

### Time Span

- Development: 90 days of data
- Staging: 12 months of data
- Load Testing: 24 months of data

---

## Entity Specifications

### Locations

```python
SAMPLE_LOCATIONS = [
    {"id": "loc_austin", "name": "Austin", "region": "South", "timezone": "America/Chicago"},
    {"id": "loc_chicago", "name": "Chicago", "region": "Midwest", "timezone": "America/Chicago"},
    {"id": "loc_nyc", "name": "NYC", "region": "Northeast", "timezone": "America/New_York"},
    {"id": "loc_la", "name": "LA", "region": "West", "timezone": "America/Los_Angeles"},
    {"id": "loc_seattle", "name": "Seattle", "region": "West", "timezone": "America/Los_Angeles"},
    {"id": "loc_denver", "name": "Denver", "region": "Mountain", "timezone": "America/Denver"},
]
```

### Location Performance Profiles

Assign each location a performance profile:

| Location | Profile | Score Range | Exception Rate | Notes |
|----------|---------|-------------|----------------|-------|
| Austin | Excellent | 91-95 | 7-10% | Best practices location |
| Chicago | Good | 88-92 | 9-12% | Solid performer |
| Denver | Good | 88-92 | 9-11% | Consistent |
| Seattle | Average | 85-90 | 10-13% | Room for improvement |
| NYC | Below Average | 82-88 | 11-15% | High volume challenges |
| LA | Struggling | 78-85 | 13-18% | Needs intervention |

### Users (Processors)

```python
def generate_users(locations, users_per_location=2):
    """Generate users with realistic name distribution."""
    
    FIRST_NAMES = ["Lara", "Marcus", "Sarah", "Ana", "Joseph", "Diana", "Mike", "John", 
                   "Emily", "David", "Lisa", "Robert", "Jennifer", "Michael", "Ashley"]
    LAST_NAMES = ["Patel", "Johnson", "Wilson", "Martinez", "Kim", "Chen", "Davis", 
                  "Miller", "Garcia", "Rodriguez", "Lee", "Thompson", "White", "Brown"]
    
    users = []
    for location in locations:
        for i in range(users_per_location):
            # Assign performance based on location profile + individual variance
            base_performance = LOCATION_PROFILES[location["id"]]["base_performance"]
            individual_variance = random.gauss(0, 0.15)  # ±15% individual variation
            
            users.append({
                "id": f"user_{len(users)+1:03d}",
                "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                "email": f"processor{len(users)+1}@company.com",
                "location_id": location["id"],
                "role": "AP Processor",
                "performance_factor": base_performance + individual_variance
            })
    
    return users
```

### User Performance Distribution

Within each location, users should follow a distribution:

| Performance Category | % of Users | Processing Volume Factor |
|---------------------|------------|-------------------------|
| Exceptional | 10% | 1.25-1.40x average |
| Above Average | 20% | 1.05-1.25x average |
| Average | 40% | 0.90-1.10x average |
| Below Average | 20% | 0.75-0.95x average |
| Needs Attention | 10% | 0.60-0.80x average |

### Vendors

```python
VENDOR_PROFILES = [
    # High volume, good quality
    {"name": "Sysco", "invoice_frequency": "daily", "quality": "excellent", "spend_tier": "high"},
    {"name": "US Foods", "invoice_frequency": "daily", "quality": "good", "spend_tier": "high"},
    
    # Medium volume, mixed quality
    {"name": "Worldwide Produce", "invoice_frequency": "weekly", "quality": "poor", "spend_tier": "medium"},
    {"name": "Sunrise Produce", "invoice_frequency": "weekly", "quality": "poor", "spend_tier": "low"},
    
    # Low volume, good quality
    {"name": "Imperial Dade", "invoice_frequency": "monthly", "quality": "excellent", "spend_tier": "medium"},
    {"name": "Ecolab", "invoice_frequency": "monthly", "quality": "good", "spend_tier": "medium"},
]

VENDOR_QUALITY_METRICS = {
    "excellent": {"po_match_rate": (0.95, 0.99), "error_rate": (0.01, 0.04)},
    "good": {"po_match_rate": (0.88, 0.95), "error_rate": (0.03, 0.08)},
    "average": {"po_match_rate": (0.80, 0.90), "error_rate": (0.06, 0.12)},
    "poor": {"po_match_rate": (0.50, 0.80), "error_rate": (0.10, 0.20)},
}
```

---

## Invoice Generation

### Invoice Distribution

```python
def generate_invoices(
    users: list,
    vendors: list,
    start_date: date,
    end_date: date,
    daily_average: int = 50
):
    """Generate invoices with realistic patterns."""
    
    invoices = []
    current_date = start_date
    
    while current_date <= end_date:
        # Skip weekends (lower volume)
        if current_date.weekday() >= 5:
            day_volume = int(daily_average * 0.2)
        else:
            # Vary daily volume ±20%
            day_volume = int(daily_average * random.uniform(0.8, 1.2))
        
        for _ in range(day_volume):
            # Select user weighted by performance factor
            user = weighted_random_choice(users, key=lambda u: u["performance_factor"])
            
            # Select vendor weighted by invoice frequency
            vendor = weighted_random_choice(vendors, key=lambda v: FREQUENCY_WEIGHTS[v["invoice_frequency"]])
            
            invoice = generate_single_invoice(user, vendor, current_date)
            invoices.append(invoice)
        
        current_date += timedelta(days=1)
    
    return invoices
```

### Single Invoice Generation

```python
def generate_single_invoice(user: dict, vendor: dict, date: date) -> dict:
    """Generate a single invoice with exceptions based on profiles."""
    
    vendor_quality = VENDOR_QUALITY_METRICS[vendor["quality"]]
    user_performance = user["performance_factor"]
    
    # Determine if exceptions occur
    has_exception = random.random() > vendor_quality["po_match_rate"][0] * user_performance
    
    # Processing time based on exceptions and user performance
    if has_exception:
        base_processing_hours = random.uniform(12, 72)
    else:
        base_processing_hours = random.uniform(2, 24)
    
    processing_hours = base_processing_hours / user_performance
    
    # Generate invoice
    invoice = {
        "id": f"INV-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": vendor["id"],
        "processor_id": user["id"],
        "location_id": user["location_id"],
        "amount": generate_amount(vendor["spend_tier"]),
        "received_at": datetime.combine(date, time(random.randint(6, 18), random.randint(0, 59))),
        "processed_at": None,  # Set based on processing time
        "status": "resolved",
        "po_number": generate_po_number() if random.random() < vendor_quality["po_match_rate"][1] else None,
    }
    
    # Set processed time
    invoice["processed_at"] = invoice["received_at"] + timedelta(hours=processing_hours)
    
    return invoice

def generate_amount(spend_tier: str) -> float:
    """Generate realistic invoice amounts."""
    AMOUNT_RANGES = {
        "high": (500, 25000),
        "medium": (100, 5000),
        "low": (50, 1000),
    }
    low, high = AMOUNT_RANGES[spend_tier]
    # Log-normal distribution for realistic spread
    return round(random.lognormvariate(math.log((low + high) / 2), 0.8), 2)
```

---

## Exception Generation

### Exception Types Distribution

| Exception Type | % of All Exceptions | Typical Cause |
|----------------|--------------------:|---------------|
| Missing PO | 35% | Vendor didn't include; unauthorized purchase |
| GL Code Missing | 30% | New expense; processor unfamiliar |
| Vendor Mapping | 15% | New vendor; name variation |
| Amount Mismatch | 15% | Price change; quantity variance |
| Duplicate Invoice | 5% | Vendor resubmission |

### Exception Generation Logic

```python
def generate_exceptions(invoices: list) -> list:
    """Generate exceptions for invoices that should have them."""
    
    exceptions = []
    
    for invoice in invoices:
        if should_have_exception(invoice):
            exception_type = select_exception_type(invoice)
            
            exception = {
                "id": f"exc_{uuid.uuid4().hex[:8]}",
                "invoice_id": invoice["id"],
                "exception_type": exception_type,
                "flagged_at": invoice["received_at"] + timedelta(hours=random.uniform(0.5, 4)),
                "resolved_at": None,
                "resolved_by": None,
            }
            
            # 80% of exceptions get resolved
            if random.random() < 0.80:
                resolution_hours = random.uniform(4, 120)  # 4 hours to 5 days
                exception["resolved_at"] = exception["flagged_at"] + timedelta(hours=resolution_hours)
                exception["resolved_by"] = invoice["processor_id"]
            
            exceptions.append(exception)
    
    return exceptions
```

---

## Specific Test Scenarios

### Scenario 1: Struggling Employee

Create one user who clearly needs attention:
- Processing volume: 35% below team average
- Exception rate: 25%+
- Location: LA (already struggling location)
- Trend: Getting worse over past 4 weeks

```python
STRUGGLING_USER = {
    "id": "user_008",
    "name": "John Miller",
    "location_id": "loc_la",
    "performance_factor": 0.65,  # Will result in low volume
    "exception_multiplier": 1.8,  # High exceptions
    "trend": "declining"  # Getting worse
}
```

### Scenario 2: Top Performer (Mentor Candidate)

Create one user who excels:
- Processing volume: 40% above team average
- Exception rate: <8%
- Location: Austin (best location)
- Consistent performance

```python
TOP_PERFORMER = {
    "id": "user_001",
    "name": "Lara Patel",
    "location_id": "loc_austin",
    "performance_factor": 1.4,
    "exception_multiplier": 0.5,
    "trend": "stable"
}
```

### Scenario 3: Problematic Vendor

Create one vendor with significant issues:
- Missing PO rate: 68%
- Processing time: 10x average
- GL errors: High

```python
PROBLEM_VENDOR = {
    "id": "vendor_003",
    "name": "Worldwide Produce",
    "quality": "poor",
    "po_match_rate": 0.32,
    "avg_processing_days": 47,
    "locations": ["loc_nyc", "loc_la", "loc_seattle"]
}
```

---

## Data Seeding Script

```python
# scripts/generate_sample_data.py

import random
import json
from datetime import date, timedelta

def main(seed: int = 42, output_dir: str = "sample_data"):
    random.seed(seed)
    
    # Generate entities
    locations = generate_locations()
    users = generate_users(locations)
    vendors = generate_vendors()
    
    # Generate transactional data
    end_date = date.today()
    start_date = end_date - timedelta(days=90)
    
    invoices = generate_invoices(users, vendors, start_date, end_date)
    exceptions = generate_exceptions(invoices)
    gl_codes = generate_gl_codes(invoices)
    
    # Save to files
    save_json(locations, f"{output_dir}/locations.json")
    save_json(users, f"{output_dir}/users.json")
    save_json(vendors, f"{output_dir}/vendors.json")
    save_json(invoices, f"{output_dir}/invoices.json")
    save_json(exceptions, f"{output_dir}/exceptions.json")
    save_json(gl_codes, f"{output_dir}/gl_codes.json")
    
    # Print summary
    print(f"Generated:")
    print(f"  - {len(locations)} locations")
    print(f"  - {len(users)} users")
    print(f"  - {len(vendors)} vendors")
    print(f"  - {len(invoices)} invoices")
    print(f"  - {len(exceptions)} exceptions")

if __name__ == "__main__":
    main()
```

---

## Validation Checks

After generating data, validate:

1. **Distribution checks:**
   - Exception rate by location matches profile
   - User performance distribution roughly matches expected percentages
   - Vendor quality metrics fall within expected ranges

2. **Referential integrity:**
   - All invoice.processor_id exist in users
   - All invoice.vendor_id exist in vendors
   - All invoice.location_id exist in locations
   - All exception.invoice_id exist in invoices

3. **Business logic:**
   - processed_at > received_at always
   - resolved_at > flagged_at when resolved
   - No future dates
   - Amounts are positive

```python
def validate_data(data: dict) -> list:
    """Return list of validation errors."""
    errors = []
    
    # Check referential integrity
    user_ids = {u["id"] for u in data["users"]}
    for invoice in data["invoices"]:
        if invoice["processor_id"] not in user_ids:
            errors.append(f"Invoice {invoice['id']} has invalid processor_id")
    
    # Check date logic
    for invoice in data["invoices"]:
        if invoice["processed_at"] and invoice["processed_at"] < invoice["received_at"]:
            errors.append(f"Invoice {invoice['id']} processed before received")
    
    return errors
```
