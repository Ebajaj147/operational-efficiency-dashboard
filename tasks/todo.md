# Project Todo

Track all work items here. Update as tasks are completed.

---

## Current Sprint

### In Progress
- [ ] 

### Up Next
- [ ] Set up GitHub repository
- [ ] Initialize Python backend project
- [ ] Initialize React frontend project
- [ ] Create database schema in ClickHouse

---

## Phase 1: Foundation

### 1.1 Database Schema
- [ ] Create `dashboard` schema
- [ ] Create `insights` table
- [ ] Create `actions` table
- [ ] Create `tasks` table
- [ ] Create `mentor_relationships` table
- [ ] Create `mentor_followups` table
- [ ] Create `training_records` table
- [ ] Create `vendor_workflows` table
- [ ] Create `vendor_workflow_activities` table
- [ ] Create `benchmark_targets` table
- [ ] Create `activity_log` table
- [ ] Create `scheduled_reports` table
- [ ] Create `user_settings` table
- [ ] Create `sop_uploads` table
- [ ] Verify Ottimate core table access
- [ ] Generate sample data script

### 1.2 Metrics Engine
- [ ] Implement `calculate_processing_volume()`
- [ ] Implement `calculate_processing_time()`
- [ ] Implement `calculate_exception_rate()`
- [ ] Implement `calculate_touchless_rate()`
- [ ] Implement `calculate_cost_per_invoice()`
- [ ] Implement `calculate_location_score()`
- [ ] Implement `calculate_vendor_score()`
- [ ] Implement `get_performance_category()`
- [ ] Implement cost impact calculations
- [ ] Add caching layer

### 1.3 API Foundation
- [ ] Set up FastAPI project
- [ ] Create `/api/overview` endpoint
- [ ] Create `/api/users` endpoint
- [ ] Create `/api/locations` endpoint
- [ ] Create `/api/vendors` endpoint
- [ ] Create `/api/invoices` endpoint
- [ ] Implement location filter
- [ ] Implement date range filter
- [ ] Integrate authentication

---

## Phase 2: Core Dashboard

### 2.1 Dashboard Shell
- [ ] Initialize React project
- [ ] Create header component
- [ ] Create tab navigation
- [ ] Create filter bar component
- [ ] Implement filter state management
- [ ] Connect to API
- [ ] Create MetricCard component
- [ ] Create ScoreBadge component
- [ ] Create StatusBadge component
- [ ] Create loading states

### 2.2 Overview Tab
- [ ] Build ROI Impact Summary
- [ ] Build Insights panel
- [ ] Build Quick Actions panel (placeholder)
- [ ] Build My Tasks panel (empty state)

### 2.3 Staff Performance Tab
- [ ] Build metric cards row
- [ ] Build performance bar chart
- [ ] Build "Needs Attention" panel
- [ ] Build staff data table
- [ ] Add sorting
- [ ] Add performance category badges
- [ ] Add comparison indicators

### 2.4 Locations Tab
- [ ] Build metric cards row
- [ ] Build location data table
- [ ] Build highlight cards
- [ ] Implement comparison view

### 2.5 Vendors Tab
- [ ] Build metric cards row
- [ ] Build vendor scorecard table
- [ ] Build vendor issue cards

### 2.6 Drill-Down Modal
- [ ] Build modal component
- [ ] Build invoice table
- [ ] Implement search
- [ ] Implement status filter
- [ ] Add pagination
- [ ] Build pattern detection display
- [ ] Add bulk selection UI
- [ ] Add CSV export

---

## Phase 3: Insight Engine

### 3.1 Insight Generation
- [ ] Implement INSIGHT-001 (Staff below average)
- [ ] Implement INSIGHT-002 (High exception rate)
- [ ] Implement INSIGHT-003 (Training opportunity)
- [ ] Implement INSIGHT-010 (Location below best)
- [ ] Implement INSIGHT-011 (Best practice opportunity)
- [ ] Implement INSIGHT-012 (Location exception spike)
- [ ] Implement INSIGHT-020 (Vendor critical issues)
- [ ] Implement INSIGHT-021 (Vendor missing PO)
- [ ] Implement INSIGHT-022 (Vendor processing delays)
- [ ] Implement INSIGHT-023 (Vendor GL mapping issues)
- [ ] Implement deduplication logic
- [ ] Set up scheduled generation job

### 3.2 Insight Display
- [ ] Build InsightCard component
- [ ] Update Overview tab with real insights
- [ ] Build full insights view
- [ ] Add dismiss functionality
- [ ] Build insight detail view

### 3.3 Insight Linking
- [ ] Link insights to entity pages
- [ ] Show insights on entity detail views
- [ ] Add insight tooltips

---

## Phase 4: Action System

### 4.1 Task System
- [ ] Create task CRUD API
- [ ] Build My Tasks panel
- [ ] Add task completion toggle
- [ ] Add task creation form
- [ ] Build task detail view
- [ ] Implement task reassignment

### 4.2 Action Drawer
- [ ] Build drawer component
- [ ] Implement content generation
- [ ] Add copy functionality
- [ ] Add "Add to Tasks" functionality

### 4.3 Mentor System
- [ ] Build mentor assignment flow
- [ ] Implement mentor selection logic
- [ ] Build email preview/edit
- [ ] Implement email sending
- [ ] Create relationship tracking
- [ ] Build follow-up prompts
- [ ] Add status updates

### 4.4 Training Recommendations
- [ ] Implement training type detection
- [ ] Build training document generation
- [ ] Create training record tracking
- [ ] Build status update flow
- [ ] Link to impact calculation

### 4.5 Vendor Workflows
- [ ] Build workflow creation
- [ ] Implement status stages
- [ ] Build email templates
- [ ] Create Vendor Actions section
- [ ] Build workflow detail view
- [ ] Implement activity logging
- [ ] Add escalation triggers

### 4.6 Benchmark Targets
- [ ] Build target setting UI
- [ ] Implement tracking logic
- [ ] Build progress display
- [ ] Add status calculations
- [ ] Create dashboard widget

---

## Phase 5: Reporting

### 5.1 Report Generation Engine
- [ ] Set up PDF library
- [ ] Build data assembly logic
- [ ] Create base template
- [ ] Implement chart rendering
- [ ] Build "Three Things to Know" logic

### 5.2 Report Templates
- [ ] Executive Summary template
- [ ] QBR template
- [ ] Location Report template
- [ ] Vendor Report template
- [ ] Team Report template

### 5.3 Reports Tab
- [ ] Build Reports tab UI
- [ ] Implement report configuration
- [ ] Build report preview
- [ ] Add download functionality
- [ ] Build scheduled reports management
- [ ] Implement email scheduling

---

## Phase 6: Polish & Integration

### 6.1 Activity Log
- [ ] Build Activity Log tab
- [ ] Implement filtering
- [ ] Build activity detail view
- [ ] Add entity-level history

### 6.2 User Settings
- [ ] Build settings page
- [ ] Implement default preferences
- [ ] Add notification preferences
- [ ] Persist settings

### 6.3 Performance Optimization
- [ ] Profile slow queries
- [ ] Implement query caching
- [ ] Add loading states
- [ ] Optimize bundle size
- [ ] Add error boundaries
- [ ] Implement retry logic

### 6.4 Testing & QA
- [ ] Write metrics unit tests
- [ ] Write API integration tests
- [ ] Manual QA pass
- [ ] Fix bugs
- [ ] Document limitations

### 6.5 Deployment
- [ ] Set up production environment
- [ ] Configure monitoring
- [ ] Create deployment runbook
- [ ] Set up migrations
- [ ] Plan rollback

---

## Completed

### Specification Phase ✅
- [x] Product vision defined
- [x] User personas documented
- [x] Glossary created
- [x] Decisions logged
- [x] Data model designed
- [x] Metrics defined
- [x] Insight rules specified
- [x] Action types documented
- [x] Build sequence planned
