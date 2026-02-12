# Operational Efficiency Dashboard

> AI-powered operational intelligence for AP teams

## Overview

This repository contains the complete specification for Ottimate's Operational Efficiency Dashboard. It serves as the single source of truth for product requirements, technical specifications, and implementation guidance.

**Target Release:** R2 — June 10, 2026  
**Status:** Specification Complete, Pre-Development

## Quick Links

| Section | Description |
|---------|-------------|
| [00-overview](./00-overview/) | Product vision, personas, glossary, decisions |
| [01-data-foundation](./01-data-foundation/) | Data model, metrics, calculations |
| [02-insight-engine](./02-insight-engine/) | AI insight rules and templates |
| [03-action-system](./03-action-system/) | Actions, workflows, email templates |
| [04-reporting](./04-reporting/) | Executive reports, scheduling |
| [05-ui-specifications](./05-ui-specifications/) | Dashboard UI specs by component |
| [06-historical-system](./06-historical-system/) | Activity logging, impact tracking |
| [07-implementation](./07-implementation/) | Tech stack, API contracts, build sequence |
| [08-launch](./08-launch/) | Marketing plan, pricing, design partners |
| [tasks](./tasks/) | Todo tracking and lessons learned |

## For Developers

### Getting Started

1. Read [PRODUCT_VISION.md](./00-overview/PRODUCT_VISION.md) for context
2. Review [GLOSSARY.md](./00-overview/GLOSSARY.md) for terminology
3. Check [BUILD_SEQUENCE.md](./07-implementation/BUILD_SEQUENCE.md) for implementation order
4. Track work in [tasks/todo.md](./tasks/todo.md)

### Tech Stack

- **Frontend:** React
- **Backend:** Python
- **Database:** ClickHouse
- **Existing System:** Ottimate AP Automation Platform

### Key Principles

1. **Every number links to source** — Drill down from any metric to invoices
2. **Costs over percentages** — Translate inefficiencies to dollars ($25/hr)
3. **Actions, not just alerts** — Every insight has a recommended next step
4. **Internal benchmarking** — Compare against your own best performers
5. **Historical accountability** — Track what was done and what resulted

## For Claude Code

When working on this project:

1. **Read relevant spec files first** — Don't guess, check the spec
2. **Follow BUILD_SEQUENCE.md** — Dependencies matter
3. **Update tasks/todo.md** — Track progress
4. **Log lessons in tasks/lessons.md** — Capture learnings
5. **Verify before marking complete** — Test everything

## Repository Structure

```
operational-efficiency-dashboard/
├── README.md                    # This file
├── 00-overview/                 # Product context
│   ├── PRODUCT_VISION.md        ✓
│   ├── USER_PERSONAS.md         ✓
│   ├── GLOSSARY.md              ✓
│   └── DECISIONS_LOG.md         ✓
├── 01-data-foundation/          # Data layer specs
│   ├── DATA_MODEL.md            ✓
│   ├── METRICS_DEFINITIONS.md   ✓
│   └── SAMPLE_DATA_SPEC.md      ✓
├── 02-insight-engine/           # AI insights
│   └── INSIGHT_RULES.md         ✓
├── 03-action-system/            # Actions & workflows
│   ├── ACTION_TYPES.md          ✓
│   ├── ACTION_WORKFLOWS.md      ✓
│   └── EMAIL_TEMPLATES.md       ✓
├── 04-reporting/                # Reports
│   └── REPORT_TEMPLATES.md      ✓
├── 05-ui-specifications/        # Frontend specs
│   └── UI_COMPONENTS.md         ✓
├── 06-historical-system/        # Audit & history
│   └── ACTIVITY_LOG.md          ✓
├── 07-implementation/           # Technical specs
│   ├── TECH_STACK.md            ✓
│   ├── API_ENDPOINTS.md         ✓
│   └── BUILD_SEQUENCE.md        ✓
├── 08-launch/                   # Go-to-market
│   ├── MARKETING_PLAN.md        ✓
│   └── PRICING.md               ✓
└── tasks/                       # Work tracking
    ├── todo.md                  ✓
    └── lessons.md               ✓
```

**Legend:** ✓ = Complete specification

## Contact

Product Owner: Eashan  
Last Updated: February 4, 2026
