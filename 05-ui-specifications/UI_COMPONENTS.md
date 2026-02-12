# UI Specifications

Complete UI component specifications, layouts, and responsive behavior.

---

## Design System

### Colors

```css
/* Primary */
--blue-600: #2563eb;    /* Primary actions, links */
--blue-500: #3b82f6;    /* Hover states */
--blue-50: #eff6ff;     /* Light backgrounds */

/* Status */
--green-600: #16a34a;   /* Success, on-track */
--green-500: #10b981;   /* Positive indicators */
--green-50: #f0fdf4;    /* Success backgrounds */

--amber-600: #d97706;   /* Warning, attention */
--amber-500: #f59e0b;   /* Warning indicators */
--amber-50: #fffbeb;    /* Warning backgrounds */

--red-600: #dc2626;     /* Error, critical */
--red-500: #ef4444;     /* Negative indicators */
--red-50: #fef2f2;      /* Error backgrounds */

/* Neutrals */
--slate-900: #0f172a;   /* Primary text */
--slate-700: #334155;   /* Secondary text */
--slate-500: #64748b;   /* Muted text */
--slate-300: #cbd5e1;   /* Borders */
--slate-100: #f1f5f9;   /* Light backgrounds */
--slate-50: #f8fafc;    /* Page background */
--white: #ffffff;       /* Cards */

/* Insight Severity */
--critical: #ef4444;
--warning: #f59e0b;
--opportunity: #10b981;

/* Performance Categories */
--exceptional: #10b981;
--above-average: #3b82f6;
--average: #8b5cf6;
--below-average: #f59e0b;
--needs-attention: #ef4444;
```

### Typography

```css
/* Font Family */
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs: 0.75rem;     /* 12px - Labels, badges */
--text-sm: 0.875rem;    /* 14px - Body small, table cells */
--text-base: 1rem;      /* 16px - Body */
--text-lg: 1.125rem;    /* 18px - Section titles */
--text-xl: 1.25rem;     /* 20px - Page titles */
--text-2xl: 1.5rem;     /* 24px - Major headings */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

```css
/* Base unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-full: 9999px;  /* Pills, badges */
```

---

## Layout Structure

### Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, 64px)                                                │
├─────────────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (max-width: 1280px, centered)                          │
│                                                                     │
│   [Filter Bar - when applicable]                                    │
│                                                                     │
│   [Metric Cards Row]                                                │
│                                                                     │
│   [Primary Content Area]                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Grid System

```css
/* Metric cards */
.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

@media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 640px) {
    grid-template-columns: 1fr;
}

/* Two-column layout */
.two-column {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
}

@media (max-width: 1024px) {
    grid-template-columns: 1fr;
}
```

---

## Component Specifications

### Metric Card

```
┌─────────────────────────────────────────┐
│ INVOICES PROCESSED              [Icon] │
│                                         │
│ 12,450                                  │
│ +8% vs last period                      │
└─────────────────────────────────────────┘

Dimensions:
- Min-height: 100px
- Padding: 16px
- Border-radius: 12px

Styling:
- Background: white
- Border: 1px solid #e2e8f0
- Hover: box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)

Elements:
- Label: 12px, uppercase, #64748b, font-weight 500
- Value: 20px, #0f172a, font-weight 700
- Subtitle: 12px, #64748b
- Icon container: 36px, rounded-lg, colored background 20% opacity
```

### Insight Card

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Severity Icon]  Title of insight                    [$2,340/mo] [▼]│
│                  Brief description of the insight                   │
├─────────────────────────────────────────────────────────────────────┤
│ RECOMMENDATION (expanded)                                           │
│ Full recommendation text here...                                    │
│                                                                     │
│ AI-ASSISTED ACTIONS                                                 │
│ [✨ Action 1]  [✨ Action 2]                                        │
└─────────────────────────────────────────────────────────────────────┘

Collapsed State:
- Header background: severity color at 10% opacity
- Border-left: 4px solid severity color
- Padding: 12px
- Cursor: pointer

Expanded State:
- Content area: white background
- Border-top: 1px solid (severity color at 20%)
- Padding: 12px

Severity Colors:
- Critical: #ef4444 (red)
- Warning: #f59e0b (amber)
- Opportunity: #10b981 (green)

Action Buttons:
- Background: gradient from violet-600 to purple-600
- Color: white
- Padding: 6px 12px
- Border-radius: 8px
- Font: 12px, font-weight 500
- Icon: Sparkles, 12px
```

### Data Table

```
┌─────────────────────────────────────────────────────────────────────┐
│ Name          │ Location │ Daily │ vs Avg │ Exceptions │ Actions   │
├───────────────┼──────────┼───────┼────────┼────────────┼───────────┤
│ [Avatar] Name │ Austin   │ 101   │ +23%   │ 12         │ [Eye]     │
│ [Avatar] Name │ Chicago  │ 94    │ +15%   │ 18         │ [Eye]     │
│ [Avatar] Name │ LA       │ 65    │ -20%   │ 52         │ [Eye]     │
└─────────────────────────────────────────────────────────────────────┘

Container:
- Background: white
- Border: 1px solid #e2e8f0
- Border-radius: 12px
- Overflow: hidden

Header Row:
- Background: #f8fafc
- Font: 12px, font-weight 600, #475569
- Padding: 12px 16px
- Text-transform: none

Body Row:
- Border-top: 1px solid #e2e8f0
- Padding: 12px 16px
- Hover: background #f8fafc

Clickable Values:
- Color: #2563eb
- Cursor: pointer
- Hover: underline

Status Indicators:
- Positive: #10b981
- Negative: #ef4444
- Neutral: #64748b
```

### Action Drawer

```
┌─────────────────────────────────────────────────────────────────────┐
│ [X]                                                                  │
│                                                                     │
│ [Gradient Icon]  Action Title                                       │
│                  AI-Assisted Action                                 │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                     │
│ [Filter Notice - if filtered]                                       │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✨ AI-Generated Content                                         │ │
│ │                                                                 │ │
│ │ [Pre-formatted content...]                                      │ │
│ │                                                                 │ │
│ │ [Copy]                                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Key Insights                                                    │ │
│ │ • Insight 1                                                     │ │
│ │ • Insight 2                                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Checklist                                                    │ │
│ │ ☐ Task 1 (Due: Jan 20)                                         │ │
│ │ ☐ Task 2 (Due: Jan 25)                                         │ │
│ │                                                                 │ │
│ │ [+ Add to My Tasks]                                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Expected Impact                                                 │ │
│ │ $2,340/mo                                                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Drawer:
- Width: 100%, max-width 512px
- Height: 100vh
- Position: fixed right-0
- Background: white
- Box-shadow: -10px 0 40px rgba(0,0,0,0.1)
- Z-index: 50

Overlay:
- Background: rgba(0,0,0,0.5)
- Z-index: 50

Header:
- Padding: 16px
- Border-bottom: 1px solid #e2e8f0
- Sticky top-0
- Background: white

Content Sections:
- Margin: 16px
- Padding: 16px
- Border-radius: 12px
- Background: varies by section type

AI Content Block:
- Background: #f8fafc
- Border: 1px solid #e2e8f0

Insights Block:
- Background: #eff6ff
- Border: 1px solid #bfdbfe

Checklist Block:
- Background: #fffbeb
- Border: 1px solid #fde68a

Impact Block:
- Background: #f0fdf4
- Border: 1px solid #bbf7d0
```

### Invoice Drill-Down Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│ John Miller's Exceptions                                      [X]   │
│ 52 invoices • Total: $45,230                                        │
├─────────────────────────────────────────────────────────────────────┤
│ [🔍 Search...        ] [Status: All ▼]           [📥 Export]       │
├─────────────────────────────────────────────────────────────────────┤
│ [Selected: 3]  [🔄 Reassign] [✓ Resolve] [🚩 Flag]                 │
├─────────────────────────────────────────────────────────────────────┤
│ ☐ │ INV-1234 │ Sysco     │ $1,234 │ Jan 5 │ Missing PO │ Pending  │
│ ☑ │ INV-1235 │ US Foods  │ $567   │ Jan 5 │ GL Code    │ In Review│
│ ☑ │ INV-1236 │ Sysco     │ $890   │ Jan 6 │ Missing PO │ Pending  │
│ ...                                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ✨ Patterns Detected                                                │
│ • 42% are Missing PO issues                                        │
│ • Sysco appears in 65% of invoices                                 │
└─────────────────────────────────────────────────────────────────────┘

Modal:
- Width: 100%, max-width: 1024px
- Max-height: 85vh
- Border-radius: 16px
- Background: white
- Box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)

Header:
- Padding: 16px
- Border-bottom: 1px solid #e2e8f0
- Background: #f8fafc

Toolbar:
- Padding: 12px
- Border-bottom: 1px solid #e2e8f0
- Display: flex, gap: 12px

Bulk Actions Bar:
- Background: #eff6ff
- Padding: 8px 12px
- Visible only when items selected

Table:
- Flex: 1
- Overflow-y: auto

Pattern Detection:
- Background: #fffbeb
- Padding: 12px
- Border-top: 1px solid #fde68a
```

### My Tasks Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📋 My Tasks                                              3/5 done   │
├─────────────────────────────────────────────────────────────────────┤
│ ☑ Review Q4 report                                        Jan 15   │
│ ☐ Schedule 1:1 with John Miller                           Jan 20   │
│   └─ From: Staff Performance insight                               │
│ ☐ Contact Sysco about PO compliance                       Jan 22   │
│   └─ From: Vendor workflow                                         │
└─────────────────────────────────────────────────────────────────────┘

Container:
- Background: white
- Border: 1px solid #e2e8f0
- Border-radius: 12px
- Padding: 16px

Header:
- Display: flex, justify-between
- Font: 16px, font-weight 700
- Badge: background #f1f5f9, border-radius full

Task Item:
- Padding: 8px
- Border-radius: 8px
- Cursor: pointer
- Hover: background #f8fafc

Completed Task:
- Opacity: 0.5
- Text-decoration: line-through

Task Context:
- Font: 12px
- Color: #64748b
- Padding-left: 24px
```

### Badge/Pill

```
Performance Category Badges:
┌────────────────┐
│  Exceptional   │  bg: #d1fae5, color: #10b981
├────────────────┤
│  Above Avg     │  bg: #dbeafe, color: #3b82f6
├────────────────┤
│  Average       │  bg: #ede9fe, color: #8b5cf6
├────────────────┤
│  Below Avg     │  bg: #fef3c7, color: #f59e0b
├────────────────┤
│  Needs Help    │  bg: #fee2e2, color: #ef4444
└────────────────┘

Styling:
- Padding: 2px 8px
- Border-radius: 9999px
- Font: 12px, font-weight 500

Status Badges:
- Resolved: bg #d1fae5, color #10b981
- Pending: bg #fef3c7, color #f59e0b
- In Review: bg #dbeafe, color #3b82f6
- Escalated: bg #fee2e2, color #ef4444
```

### Button Variants

```
Primary Button:
- Background: #2563eb
- Color: white
- Padding: 8px 16px
- Border-radius: 8px
- Font: 14px, font-weight 500
- Hover: background #1d4ed8
- Active: background #1e40af

Secondary Button:
- Background: #f1f5f9
- Color: #334155
- Border: 1px solid #e2e8f0
- Hover: background #e2e8f0

AI Action Button:
- Background: linear-gradient(135deg, #7c3aed, #9333ea)
- Color: white
- Icon: Sparkles (12px)
- Hover: box-shadow 0 4px 12px rgba(124, 58, 237, 0.4)

Destructive Button:
- Background: #ef4444
- Color: white
- Hover: background #dc2626

Ghost Button:
- Background: transparent
- Color: #64748b
- Hover: background #f1f5f9

Icon Button:
- Width: 36px
- Height: 36px
- Border-radius: 8px
- Display: flex, align-items center, justify-content center
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Responsive Behaviors

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|-----------------|---------------------|-------------------|
| Metric Cards | 1 column | 2 columns | 4 columns |
| Two-Column Layout | Stacked | Stacked | Side-by-side |
| Table | Horizontal scroll | Horizontal scroll | Full width |
| Action Drawer | Full screen | 400px width | 512px width |
| Modal | Full screen | 90% width | Max 1024px |
| Tab Navigation | Scrollable | Full width | Full width |

### Mobile-Specific Adjustments

```css
/* Hide on mobile */
@media (max-width: 768px) {
    .desktop-only { display: none; }
    
    /* Simplify tables */
    .table-cell-hide-mobile { display: none; }
    
    /* Full-width buttons */
    .button { width: 100%; }
    
    /* Reduce padding */
    .container { padding: 0 12px; }
    
    /* Stack header elements */
    .header { flex-direction: column; gap: 8px; }
}
```

---

## Loading States

### Skeleton Loading

```
┌─────────────────────────────────────────┐
│ ████████████                    [    ] │
│                                         │
│ ██████████████████████                 │
│ ████████████                           │
└─────────────────────────────────────────┘

Skeleton element:
- Background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)
- Background-size: 200% 100%
- Animation: shimmer 1.5s infinite
- Border-radius: 4px
```

### Spinner

```
Inline Spinner:
- Size: 16px
- Border: 2px solid #e2e8f0
- Border-top: 2px solid #3b82f6
- Animation: spin 0.6s linear infinite

Full Page Spinner:
- Size: 48px
- Centered in container
- With text: "Loading..."
```

### Empty States

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         [Icon 48px]                                 │
│                                                                     │
│                    No staff in selected locations                   │
│                                                                     │
│            Adjust your location filters to see team data            │
│                                                                     │
│                      [Adjust Filters]                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Container:
- Padding: 48px
- Text-align: center

Icon:
- Size: 48px
- Color: #cbd5e1
- Margin-bottom: 16px

Title:
- Font: 16px, font-weight 600
- Color: #475569

Description:
- Font: 14px
- Color: #64748b
- Max-width: 300px
- Margin: 8px auto 16px
```

---

## Animation Specifications

### Transitions

```css
/* Default transition */
transition: all 0.15s ease;

/* Hover effects */
transition: background-color 0.15s ease, box-shadow 0.15s ease;

/* Drawer slide */
transition: transform 0.3s ease-out;

/* Modal fade */
transition: opacity 0.2s ease;

/* Accordion expand */
transition: max-height 0.3s ease, opacity 0.2s ease;
```

### Micro-interactions

```css
/* Button press */
.button:active {
    transform: scale(0.98);
}

/* Card hover lift */
.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

/* Checkbox check */
.checkbox:checked {
    animation: check 0.2s ease;
}

/* Toast slide in */
.toast {
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
```

---

## Accessibility

### Focus States

```css
/* Visible focus ring */
*:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* Focus within for complex components */
.card:focus-within {
    box-shadow: 0 0 0 2px #3b82f6;
}
```

### Color Contrast

All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation

- Tab order follows visual order
- All interactive elements focusable
- Escape closes modals/drawers
- Arrow keys navigate within components
- Enter/Space activate buttons

### Screen Reader Support

```html
<!-- Announce dynamic content -->
<div role="status" aria-live="polite">
    {{ notification }}
</div>

<!-- Label icons -->
<button aria-label="Close modal">
    <X />
</button>

<!-- Describe data tables -->
<table aria-describedby="table-description">
    <caption id="table-description" class="sr-only">
        Staff performance metrics...
    </caption>
</table>
```
