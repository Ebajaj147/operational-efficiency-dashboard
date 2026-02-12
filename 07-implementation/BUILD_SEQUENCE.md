# Build Sequence

This document defines the order in which components should be built. Dependencies are explicitly stated. Each phase has clear deliverables and acceptance criteria.

---

## Overview

```
Phase 1: Foundation (Weeks 1-2)
    ↓
Phase 2: Core Dashboard (Weeks 3-5)
    ↓
Phase 3: Insight Engine (Weeks 6-7)
    ↓
Phase 4: Action System (Weeks 8-10)
    ↓
Phase 5: Reporting (Weeks 11-12)
    ↓
Phase 6: Polish & Integration (Weeks 13-14)
```

**Total Estimated Duration:** 14 weeks (with buffer for design partner feedback)

---

## Phase 1: Foundation

**Duration:** 2 weeks  
**Goal:** Data layer and basic infrastructure

### 1.1 Database Schema (Week 1)

**Dependencies:** None

**Tasks:**
- [ ] Create `dashboard` schema in ClickHouse
- [ ] Create all dashboard tables (see [DATA_MODEL.md](../01-data-foundation/DATA_MODEL.md))
- [ ] Set up indexes
- [ ] Verify read access to Ottimate core tables
- [ ] Create sample data generation script

**Deliverable:** Database ready for queries

**Acceptance Criteria:**
- All tables created and accessible
- Sample data can be inserted
- Core table queries work

---

### 1.2 Metrics Engine (Week 1-2)

**Dependencies:** 1.1 Database Schema

**Tasks:**
- [ ] Implement metric calculation functions (see [METRICS_DEFINITIONS.md](../01-data-foundation/METRICS_DEFINITIONS.md))
- [ ] Create aggregation queries for:
  - User daily performance
  - Location scores
  - Vendor scores
- [ ] Implement cost calculations (see [COST_CALCULATIONS.md](../01-data-foundation/COST_CALCULATIONS.md))
- [ ] Build comparison logic (vs. average, vs. best)
- [ ] Add caching layer for expensive calculations

**Deliverable:** Python module `dashboard.metrics`

**Acceptance Criteria:**
- All metrics from METRICS_DEFINITIONS.md calculable
- Cost impact returns dollar amounts
- Performance acceptable (<500ms for dashboard load)

---

### 1.3 API Foundation (Week 2)

**Dependencies:** 1.2 Metrics Engine

**Tasks:**
- [ ] Set up API framework (FastAPI recommended)
- [ ] Create base endpoints:
  - `GET /api/overview` — Dashboard summary
  - `GET /api/users` — User list with metrics
  - `GET /api/locations` — Location list with scores
  - `GET /api/vendors` — Vendor list with scores
  - `GET /api/invoices` — Invoice list (paginated)
- [ ] Implement filtering:
  - Location filter (multi-select)
  - Date range filter
- [ ] Add authentication hooks (integrate with Ottimate auth)

**Deliverable:** Working API with basic endpoints

**Acceptance Criteria:**
- All endpoints return correct data structure
- Filters work correctly
- Response times <1s

---

## Phase 2: Core Dashboard

**Duration:** 3 weeks  
**Goal:** Working dashboard UI with all tabs (no actions yet)

### 2.1 Dashboard Shell (Week 3)

**Dependencies:** 1.3 API Foundation

**Tasks:**
- [ ] Set up React project structure
- [ ] Create layout components:
  - Header with navigation
  - Tab system
  - Filter bar
- [ ] Implement filter state management
- [ ] Connect to API
- [ ] Build common components:
  - Metric card
  - Score badge
  - Status badge
  - Loading states

**Deliverable:** Dashboard shell with navigation

**Acceptance Criteria:**
- Can navigate between tabs
- Filters persist across tabs
- Data loads from API

---

### 2.2 Overview Tab (Week 3)

**Dependencies:** 2.1 Dashboard Shell

**Tasks:**
- [ ] Build ROI Impact Summary component
- [ ] Build Insights panel (display only, no actions)
- [ ] Build Quick Actions panel (placeholder)
- [ ] Build My Tasks panel (empty state)

**Deliverable:** Working Overview tab

**Acceptance Criteria:**
- Shows correct aggregate metrics
- Insights display with severity indicators
- Responsive layout

---

### 2.3 Staff Performance Tab (Week 4)

**Dependencies:** 2.1 Dashboard Shell

**Tasks:**
- [ ] Build metric cards row (team size, avg, top performer, exceptions)
- [ ] Build performance chart (bar chart by user)
- [ ] Build "Needs Attention" panel
- [ ] Build staff data table with:
  - Sortable columns
  - Performance category badges
  - Click to drill-down
- [ ] Implement comparison indicators (+/- vs. team)

**Deliverable:** Working Staff tab

**Acceptance Criteria:**
- All metrics calculate correctly
- Performance categories display correctly
- Table sorts work
- Drill-down links work (to 2.6)

---

### 2.4 Locations Tab (Week 4)

**Dependencies:** 2.1 Dashboard Shell

**Tasks:**
- [ ] Build metric cards row
- [ ] Build location data table with:
  - Score badges
  - Exception rate display
  - Pending approvals count
- [ ] Build highlight cards (top performer, needs attention)
- [ ] Implement location comparison view

**Deliverable:** Working Locations tab

**Acceptance Criteria:**
- Location scores calculate correctly
- Comparison to best performer works
- Responsive on mobile

---

### 2.5 Vendors Tab (Week 5)

**Dependencies:** 2.1 Dashboard Shell

**Tasks:**
- [ ] Build metric cards row
- [ ] Build vendor scorecard table with:
  - Score badges
  - Error rate highlighting
  - Missing PO highlighting
- [ ] Build vendor issue cards

**Deliverable:** Working Vendors tab

**Acceptance Criteria:**
- Vendor scores calculate correctly
- High-risk vendors highlighted
- Spend totals correct

---

### 2.6 Drill-Down Modal (Week 5)

**Dependencies:** 2.3, 2.4, 2.5 (all entity tabs)

**Tasks:**
- [ ] Build invoice list modal component
- [ ] Implement search within results
- [ ] Implement status filter
- [ ] Build invoice row with all fields
- [ ] Add pagination (show 50, load more)
- [ ] Build pattern detection display
- [ ] Add bulk selection UI (no actions yet)
- [ ] Add export button (CSV)

**Deliverable:** Working drill-down from any metric

**Acceptance Criteria:**
- Click any metric → see underlying invoices
- Search works
- Export works
- Performance acceptable with 1000+ invoices

---

## Phase 3: Insight Engine

**Duration:** 2 weeks  
**Goal:** AI-powered insights generated and displayed

### 3.1 Insight Generation (Week 6)

**Dependencies:** 1.2 Metrics Engine

**Tasks:**
- [ ] Implement insight rules (see [INSIGHT_RULES.md](../02-insight-engine/INSIGHT_RULES.md))
- [ ] Build insight generation job:
  - Staff performance insights
  - Location performance insights
  - Vendor insights
  - Training opportunity detection
- [ ] Implement cost impact calculation for each insight
- [ ] Build deduplication logic
- [ ] Set up scheduled generation (every 4 hours)

**Deliverable:** Insights generating and stored in database

**Acceptance Criteria:**
- All insight types generating
- Cost impacts calculated
- No duplicate insights
- Runs reliably on schedule

---

### 3.2 Insight Display (Week 6-7)

**Dependencies:** 3.1 Insight Generation, 2.2 Overview Tab

**Tasks:**
- [ ] Build insight card component with:
  - Severity indicator
  - Expandable detail
  - Cost impact badge
  - Action buttons (disabled for now)
- [ ] Update Overview tab to show real insights
- [ ] Build full insights view (all insights)
- [ ] Add dismiss functionality
- [ ] Build insight detail view

**Deliverable:** Insights visible throughout dashboard

**Acceptance Criteria:**
- Insights display with correct formatting
- Expand/collapse works
- Dismiss works and persists
- Priority ordering correct

---

### 3.3 Insight Linking (Week 7)

**Dependencies:** 3.2 Insight Display

**Tasks:**
- [ ] Link insights to entity pages (user, location, vendor)
- [ ] Show related insights on entity detail views
- [ ] Implement "Show insight for this" on drill-down
- [ ] Add tooltips explaining insight calculations

**Deliverable:** Insights connected throughout UI

**Acceptance Criteria:**
- Can navigate from insight to related entity
- Entity pages show relevant insights
- Tooltips provide context

---

## Phase 4: Action System

**Duration:** 3 weeks  
**Goal:** All actions functional

### 4.1 Task System (Week 8)

**Dependencies:** 1.1 Database Schema

**Tasks:**
- [ ] Build task CRUD API endpoints
- [ ] Build My Tasks panel with:
  - Task list display
  - Completion toggle
  - Add task form
  - Task detail view
- [ ] Implement task persistence
- [ ] Add task reassignment
- [ ] Build task creation from context (prepare for actions)

**Deliverable:** Working task management

**Acceptance Criteria:**
- Tasks create, complete, reassign
- Persist across sessions
- Appear in My Tasks panel

---

### 4.2 Action Drawer (Week 8)

**Dependencies:** 4.1 Task System

**Tasks:**
- [ ] Build action drawer component
- [ ] Implement AI content generation (templates + data merge)
- [ ] Build "Copy" functionality
- [ ] Build "Add to Tasks" functionality
- [ ] Show filter context in drawer

**Deliverable:** Action drawer shell

**Acceptance Criteria:**
- Drawer opens from insight actions
- Content generates correctly
- Copy works
- Tasks create correctly

---

### 4.3 Mentor System (Week 9)

**Dependencies:** 4.2 Action Drawer

**Tasks:**
- [ ] Build mentor assignment flow
- [ ] Implement mentor selection logic
- [ ] Build email preview/edit
- [ ] Implement email sending (with approval)
- [ ] Create mentor relationship tracking
- [ ] Build follow-up prompt system
- [ ] Add mentor status updates

**Deliverable:** Complete mentor assignment workflow

**Acceptance Criteria:**
- Can assign mentor end-to-end
- Emails send correctly
- Relationship tracked
- Follow-ups appear

---

### 4.4 Training Recommendations (Week 9)

**Dependencies:** 4.2 Action Drawer

**Tasks:**
- [ ] Implement training type detection logic
- [ ] Build training document generation
- [ ] Create training record tracking
- [ ] Build status update flow (initiated → completed)
- [ ] Link training to inferred impact calculation

**Deliverable:** Training recommendation workflow

**Acceptance Criteria:**
- Training recommended based on exception patterns
- Document generates correctly
- Status tracking works
- Impact correlation displays (after completion)

---

### 4.5 Vendor Workflows (Week 10)

**Dependencies:** 4.2 Action Drawer

**Tasks:**
- [ ] Build vendor workflow creation
- [ ] Implement workflow status stages
- [ ] Build email templates by issue type
- [ ] Create Vendor Actions section in Vendors tab
- [ ] Build workflow detail view
- [ ] Implement activity logging for workflow events
- [ ] Add escalation triggers

**Deliverable:** Complete vendor improvement workflow

**Acceptance Criteria:**
- Workflow creates from vendor insight
- Status progression works
- Emails send correctly
- Activity history visible
- Escalation works

---

### 4.6 Benchmark Targets (Week 10)

**Dependencies:** 4.1 Task System

**Tasks:**
- [ ] Build target setting UI from comparisons
- [ ] Implement target tracking logic
- [ ] Build target progress display
- [ ] Add status calculations (on track, at risk)
- [ ] Create target dashboard widget

**Deliverable:** Benchmark target tracking

**Acceptance Criteria:**
- Can set target from comparison
- Progress calculates correctly
- Status updates automatically
- Visible in dashboard

---

## Phase 5: Reporting

**Duration:** 2 weeks  
**Goal:** All reports generating and exportable

### 5.1 Report Generation Engine (Week 11)

**Dependencies:** 1.2 Metrics Engine

**Tasks:**
- [ ] Set up PDF generation library (WeasyPrint or similar)
- [ ] Build report data assembly logic
- [ ] Create base report template
- [ ] Implement chart rendering for PDFs
- [ ] Build "Three Things to Know" AI logic

**Deliverable:** Report generation backend

**Acceptance Criteria:**
- Can generate PDF from data
- Charts render correctly
- Template system works

---

### 5.2 Report Templates (Week 11-12)

**Dependencies:** 5.1 Report Generation Engine

**Tasks:**
- [ ] Implement Executive Summary template
- [ ] Implement QBR template
- [ ] Implement Location Report template
- [ ] Implement Vendor Report template
- [ ] Implement Team Report template

**Deliverable:** All report templates

**Acceptance Criteria:**
- Each report generates correctly
- Formatting consistent
- All data populates
- Ottimate branding present

---

### 5.3 Reports Tab (Week 12)

**Dependencies:** 5.2 Report Templates

**Tasks:**
- [ ] Build Reports tab UI
- [ ] Implement report configuration (scope, period)
- [ ] Build report preview
- [ ] Add download functionality
- [ ] Build scheduled reports management
- [ ] Implement email scheduling

**Deliverable:** Complete Reports tab

**Acceptance Criteria:**
- Can generate any report type
- Configuration works
- Download works
- Scheduling works

---

## Phase 6: Polish & Integration

**Duration:** 2 weeks  
**Goal:** Production-ready product

### 6.1 Activity Log (Week 13)

**Dependencies:** All action systems

**Tasks:**
- [ ] Build Activity Log tab
- [ ] Implement filtering (by type, entity, date)
- [ ] Build activity detail view
- [ ] Add activity timeline on entity pages
- [ ] Ensure all actions logging correctly

**Deliverable:** Complete audit trail

**Acceptance Criteria:**
- All actions appear in log
- Filtering works
- Entity-level history works

---

### 6.2 User Settings (Week 13)

**Dependencies:** 2.1 Dashboard Shell

**Tasks:**
- [ ] Build settings page
- [ ] Implement default filter preferences
- [ ] Add notification preferences
- [ ] Persist settings per user

**Deliverable:** User customization

**Acceptance Criteria:**
- Settings persist
- Defaults apply on load
- Preferences respected

---

### 6.3 Performance Optimization (Week 13-14)

**Dependencies:** All components

**Tasks:**
- [ ] Profile and optimize slow queries
- [ ] Implement query caching
- [ ] Add loading states throughout
- [ ] Optimize bundle size
- [ ] Add error boundaries
- [ ] Implement retry logic

**Deliverable:** Fast, reliable application

**Acceptance Criteria:**
- Dashboard loads <2s
- No unhandled errors
- Graceful degradation

---

### 6.4 Testing & QA (Week 14)

**Dependencies:** All components

**Tasks:**
- [ ] Write unit tests for metrics calculations
- [ ] Write integration tests for API
- [ ] Manual QA pass on all features
- [ ] Fix identified bugs
- [ ] Document known limitations

**Deliverable:** Tested, stable product

**Acceptance Criteria:**
- Core paths tested
- No critical bugs
- Documentation complete

---

### 6.5 Deployment Preparation (Week 14)

**Dependencies:** 6.4 Testing & QA

**Tasks:**
- [ ] Set up production environment
- [ ] Configure monitoring/alerting
- [ ] Create deployment runbook
- [ ] Set up database migrations
- [ ] Plan rollback procedure

**Deliverable:** Production deployment ready

**Acceptance Criteria:**
- Can deploy to production
- Monitoring active
- Rollback tested

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASE 1                                  │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐             │
│  │ 1.1 Schema │───▶│1.2 Metrics │───▶│  1.3 API   │             │
│  └────────────┘    └────────────┘    └─────┬──────┘             │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
┌─────────────────────────────────────────────┼───────────────────┐
│                         PHASE 2             │                    │
│                                             ▼                    │
│                                      ┌────────────┐              │
│                                      │ 2.1 Shell  │              │
│                                      └─────┬──────┘              │
│                    ┌───────────┬───────────┼───────────┐         │
│                    ▼           ▼           ▼           ▼         │
│              ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│              │2.2 Ovrvw │ │2.3 Staff │ │2.4 Locs  │ │2.5 Vndrs ││
│              └──────────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘│
│                                └────────────┼────────────┘       │
│                                             ▼                    │
│                                      ┌────────────┐              │
│                                      │2.6 Drilldown│             │
│                                      └────────────┘              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         PHASE 3                                   │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐              │
│  │3.1 Gen     │───▶│3.2 Display │───▶│3.3 Linking │              │
│  └────────────┘    └────────────┘    └────────────┘              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         PHASE 4                                   │
│  ┌────────────┐    ┌────────────┐                                │
│  │4.1 Tasks   │───▶│4.2 Drawer  │                                │
│  └────────────┘    └─────┬──────┘                                │
│                    ┌─────┼─────┬─────────┐                       │
│                    ▼     ▼     ▼         ▼                       │
│              ┌────────┐┌────────┐┌────────┐┌────────┐            │
│              │4.3 Mntr││4.4 Trng││4.5 Vndr││4.6 Bnch│            │
│              └────────┘└────────┘└────────┘└────────┘            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         PHASE 5                                   │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐              │
│  │5.1 Engine  │───▶│5.2 Templts │───▶│5.3 Reports │              │
│  └────────────┘    └────────────┘    └────────────┘              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         PHASE 6                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │6.1 ActLog  │ │6.2 Settings│ │6.3 Perf    │ │6.4 QA      │     │
│  └────────────┘ └────────────┘ └────────────┘ └─────┬──────┘     │
│                                                      ▼           │
│                                               ┌────────────┐     │
│                                               │6.5 Deploy  │     │
│                                               └────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Milestone Checkpoints

| Week | Milestone | Demo |
|------|-----------|------|
| 2 | API returning real metrics | API queries work |
| 5 | Dashboard navigable with data | All tabs show data |
| 7 | Insights generating and visible | Insights appear on Overview |
| 10 | Actions work end-to-end | Can assign mentor, start vendor workflow |
| 12 | Reports downloadable | Generate and download PDF |
| 14 | Production ready | Full QA complete |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Metrics calculations complex | Start with simplified versions, iterate |
| PDF generation tricky | Evaluate libraries early, have backup plan |
| Email sending reliability | Use established email service (SendGrid, SES) |
| Performance with large data | Profile early, add caching, paginate |
| Design partner feedback delays | Build core first, iterate on details |

---

## Resource Allocation

**Recommended Team:**
- 1 Backend developer (Python/ClickHouse) — Phases 1, 3, 5
- 1 Frontend developer (React) — Phases 2, 4
- 0.5 Designer — Phases 2, 6
- 0.5 QA — Phases 5, 6

**Claude Code Usage:**
- Phase 1: Data model creation, query writing
- Phase 2: Component generation, table/chart setup
- Phase 3: Rule implementation, template generation
- Phase 4: Workflow logic, email templates
- Phase 5: PDF templates, report layouts
- Phase 6: Test generation, documentation
