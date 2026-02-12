# Tech Stack

Technical architecture and tooling decisions for the Operational Efficiency Dashboard.

---

## Overview

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.x |
| State Management | React Context + hooks | — |
| UI Components | Custom + Recharts | — |
| Styling | Tailwind CSS | 3.x |
| Backend | Python + FastAPI | 3.11+ / 0.100+ |
| Database | ClickHouse | 23.x+ |
| PDF Generation | WeasyPrint | 60+ |
| Email | SendGrid or AWS SES | — |
| Auth | Ottimate existing auth | — |

---

## Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── api/              # API client functions
│   │   ├── client.ts     # Base API client
│   │   ├── overview.ts   # Overview endpoints
│   │   ├── users.ts      # User endpoints
│   │   ├── locations.ts  # Location endpoints
│   │   ├── vendors.ts    # Vendor endpoints
│   │   └── invoices.ts   # Invoice endpoints
│   │
│   ├── components/       # Reusable components
│   │   ├── common/       # Generic components
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── charts/       # Chart components
│   │   │   ├── PerformanceChart.tsx
│   │   │   └── TrendChart.tsx
│   │   │
│   │   ├── insights/     # Insight components
│   │   │   ├── InsightCard.tsx
│   │   │   ├── InsightList.tsx
│   │   │   └── InsightDetail.tsx
│   │   │
│   │   ├── actions/      # Action components
│   │   │   ├── ActionDrawer.tsx
│   │   │   ├── MentorAssignment.tsx
│   │   │   ├── TrainingRecommendation.tsx
│   │   │   └── VendorWorkflow.tsx
│   │   │
│   │   └── layout/       # Layout components
│   │       ├── Header.tsx
│   │       ├── TabNavigation.tsx
│   │       └── FilterBar.tsx
│   │
│   ├── pages/            # Page components (tabs)
│   │   ├── Overview.tsx
│   │   ├── StaffPerformance.tsx
│   │   ├── Locations.tsx
│   │   ├── Vendors.tsx
│   │   ├── Reports.tsx
│   │   └── ActivityLog.tsx
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useFilters.ts
│   │   ├── useMetrics.ts
│   │   ├── useTasks.ts
│   │   └── useInsights.ts
│   │
│   ├── context/          # React context
│   │   ├── FilterContext.tsx
│   │   └── TaskContext.tsx
│   │
│   ├── types/            # TypeScript types
│   │   ├── api.ts
│   │   ├── metrics.ts
│   │   ├── insights.ts
│   │   └── actions.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── formatters.ts
│   │   ├── calculations.ts
│   │   └── colors.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### Key Libraries

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0"
  }
}
```

### State Management Pattern

```typescript
// Filter state (global)
const FilterContext = createContext<FilterState | null>(null);

interface FilterState {
  selectedLocations: string[];
  dateRange: DateRange;
  setLocations: (locations: string[]) => void;
  setDateRange: (range: DateRange) => void;
}

// Data fetching with React Query
const useOverviewData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['overview', filters],
    queryFn: () => api.getOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## Backend Architecture

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   │
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   ├── overview.py
│   │   ├── users.py
│   │   ├── locations.py
│   │   ├── vendors.py
│   │   ├── invoices.py
│   │   ├── insights.py
│   │   ├── actions.py
│   │   ├── tasks.py
│   │   └── reports.py
│   │
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── metrics.py       # Metric calculations
│   │   ├── insights.py      # Insight generation
│   │   ├── actions.py       # Action execution
│   │   ├── reports.py       # Report generation
│   │   └── email.py         # Email sending
│   │
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── database.py      # ClickHouse models
│   │
│   ├── core/                # Core utilities
│   │   ├── __init__.py
│   │   ├── database.py      # DB connection
│   │   ├── cache.py         # Caching
│   │   └── auth.py          # Authentication
│   │
│   └── jobs/                # Background jobs
│       ├── __init__.py
│       ├── insight_generator.py
│       └── report_scheduler.py
│
├── templates/               # Email/report templates
│   ├── emails/
│   │   ├── mentor_assignment.html
│   │   └── vendor_outreach.html
│   └── reports/
│       ├── executive_summary.html
│       └── base.html
│
├── tests/
│   ├── test_metrics.py
│   ├── test_insights.py
│   └── test_api.py
│
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Key Dependencies

```
# requirements.txt
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
clickhouse-driver>=0.2.6
pydantic>=2.0.0
python-jose[cryptography]>=3.3.0
weasyprint>=60.0
jinja2>=3.1.0
sendgrid>=6.10.0
redis>=5.0.0
celery>=5.3.0
pytest>=7.4.0
```

### API Pattern

```python
# app/api/users.py
from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.services.metrics import MetricsService
from app.models.schemas import UserMetrics, FilterParams
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[UserMetrics])
async def get_users(
    locations: Optional[List[str]] = Query(None),
    date_start: Optional[str] = Query(None),
    date_end: Optional[str] = Query(None),
    current_user = Depends(get_current_user),
    metrics_service: MetricsService = Depends()
):
    filters = FilterParams(
        locations=locations,
        date_start=date_start,
        date_end=date_end
    )
    return await metrics_service.get_user_metrics(filters)
```

### Service Pattern

```python
# app/services/metrics.py
from typing import List
from app.core.database import ClickHouseClient
from app.models.schemas import UserMetrics, FilterParams
from app.core.cache import cache

class MetricsService:
    def __init__(self, db: ClickHouseClient):
        self.db = db
    
    @cache(ttl=300)  # 5 minute cache
    async def get_user_metrics(self, filters: FilterParams) -> List[UserMetrics]:
        query = """
            SELECT 
                u.id,
                u.name,
                u.location_id,
                COUNT(i.id) as invoice_count,
                AVG(dateDiff('hour', i.received_at, i.processed_at)) as avg_hours
            FROM users u
            LEFT JOIN invoices i ON u.id = i.processor_id
            WHERE 1=1
                {location_filter}
                {date_filter}
            GROUP BY u.id, u.name, u.location_id
        """
        
        # Build filters
        location_filter = ""
        if filters.locations:
            location_filter = f"AND u.location_id IN ({','.join(filters.locations)})"
        
        date_filter = ""
        if filters.date_start and filters.date_end:
            date_filter = f"AND i.processed_at BETWEEN '{filters.date_start}' AND '{filters.date_end}'"
        
        result = await self.db.execute(
            query.format(location_filter=location_filter, date_filter=date_filter)
        )
        
        return [self._map_to_user_metrics(row) for row in result]
    
    def _map_to_user_metrics(self, row) -> UserMetrics:
        # Calculate derived metrics
        team_avg = self._get_team_average()
        variance = (row['invoice_count'] - team_avg) / team_avg * 100
        
        return UserMetrics(
            id=row['id'],
            name=row['name'],
            location_id=row['location_id'],
            invoice_count=row['invoice_count'],
            avg_processing_hours=row['avg_hours'],
            vs_team_average=variance,
            performance_category=self._get_category(variance)
        )
```

---

## Database Access

### ClickHouse Connection

```python
# app/core/database.py
from clickhouse_driver import Client
from contextlib import contextmanager
from app.config import settings

class ClickHouseClient:
    def __init__(self):
        self.client = Client(
            host=settings.CLICKHOUSE_HOST,
            port=settings.CLICKHOUSE_PORT,
            user=settings.CLICKHOUSE_USER,
            password=settings.CLICKHOUSE_PASSWORD,
            database=settings.CLICKHOUSE_DATABASE
        )
    
    async def execute(self, query: str, params: dict = None):
        return self.client.execute(query, params or {})
    
    async def execute_iter(self, query: str, params: dict = None):
        """For large result sets"""
        return self.client.execute_iter(query, params or {})
```

### Query Patterns

```python
# Parameterized queries for safety
query = """
    SELECT * FROM invoices 
    WHERE location_id = %(location_id)s
    AND processed_at >= %(start_date)s
"""
result = db.execute(query, {
    'location_id': location_id,
    'start_date': start_date
})
```

---

## Caching Strategy

### Redis Cache

```python
# app/core/cache.py
import redis
import json
from functools import wraps
from app.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

def cache(ttl: int = 300):
    """Cache decorator with TTL in seconds"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key from function name and args
            key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Check cache
            cached = redis_client.get(key)
            if cached:
                return json.loads(cached)
            
            # Execute and cache
            result = await func(*args, **kwargs)
            redis_client.setex(key, ttl, json.dumps(result, default=str))
            
            return result
        return wrapper
    return decorator
```

### Cache Invalidation

```python
# Invalidate on data changes
def invalidate_user_cache(user_id: str):
    pattern = f"get_user_metrics:*{user_id}*"
    keys = redis_client.keys(pattern)
    if keys:
        redis_client.delete(*keys)
```

---

## Background Jobs

### Celery Setup

```python
# app/jobs/__init__.py
from celery import Celery
from app.config import settings

celery_app = Celery(
    'dashboard',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.beat_schedule = {
    'generate-insights': {
        'task': 'app.jobs.insight_generator.generate_insights',
        'schedule': 14400.0,  # Every 4 hours
    },
    'send-scheduled-reports': {
        'task': 'app.jobs.report_scheduler.send_scheduled_reports',
        'schedule': 3600.0,  # Every hour
    },
}
```

### Insight Generation Job

```python
# app/jobs/insight_generator.py
from app.jobs import celery_app
from app.services.insights import InsightService

@celery_app.task
def generate_insights():
    service = InsightService()
    
    # Generate staff insights
    service.generate_staff_insights()
    
    # Generate location insights
    service.generate_location_insights()
    
    # Generate vendor insights
    service.generate_vendor_insights()
    
    # Clean up old insights
    service.cleanup_expired_insights()
```

---

## Email Integration

### SendGrid Setup

```python
# app/services/email.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from jinja2 import Environment, FileSystemLoader
from app.config import settings

class EmailService:
    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.templates = Environment(
            loader=FileSystemLoader('templates/emails')
        )
    
    async def send_mentor_assignment(
        self,
        mentor_email: str,
        mentee_email: str,
        context: dict
    ):
        # Render templates
        mentor_template = self.templates.get_template('mentor_assignment_mentor.html')
        mentee_template = self.templates.get_template('mentor_assignment_mentee.html')
        
        # Send to mentor
        await self._send(
            to=mentor_email,
            subject=f"Mentorship Request: {context['mentee_name']}",
            html=mentor_template.render(context)
        )
        
        # Send to mentee
        await self._send(
            to=mentee_email,
            subject=f"Mentorship Pairing: {context['mentor_name']}",
            html=mentee_template.render(context)
        )
    
    async def _send(self, to: str, subject: str, html: str):
        message = Mail(
            from_email=Email(settings.FROM_EMAIL, settings.FROM_NAME),
            to_emails=To(to),
            subject=subject,
            html_content=Content("text/html", html)
        )
        
        self.client.send(message)
```

---

## PDF Generation

### WeasyPrint Setup

```python
# app/services/reports.py
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
from io import BytesIO

class ReportService:
    def __init__(self):
        self.templates = Environment(
            loader=FileSystemLoader('templates/reports')
        )
        self.base_css = CSS(filename='templates/reports/base.css')
    
    def generate_executive_summary(self, data: dict) -> bytes:
        template = self.templates.get_template('executive_summary.html')
        html_content = template.render(data)
        
        pdf_buffer = BytesIO()
        HTML(string=html_content).write_pdf(
            pdf_buffer,
            stylesheets=[self.base_css]
        )
        
        return pdf_buffer.getvalue()
```

---

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install WeasyPrint dependencies
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - CLICKHOUSE_HOST=clickhouse
      - REDIS_HOST=redis
    depends_on:
      - redis

  worker:
    build: .
    command: celery -A app.jobs worker --loglevel=info
    depends_on:
      - redis

  beat:
    build: .
    command: celery -A app.jobs beat --loglevel=info
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## Environment Variables

```bash
# .env.example

# Database
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=9000
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=ottimate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@ottimate.com
FROM_NAME=Ottimate

# Auth
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256

# App
DEBUG=false
LOG_LEVEL=INFO
```
