import { useState } from 'react';
import { X, Sparkles, Copy, Check, Plus, Calendar, Clock, Lightbulb, ClipboardList } from 'lucide-react';
import { users, locations, vendors } from '../../data/mockData';

export type ActionType =
  | 'assign_mentor'
  | 'prepare_review'
  | 'generate_training_recommendation'
  | 'generate_location_comparison'
  | 'set_benchmark_target'
  | 'request_sop_upload'
  | 'start_vendor_workflow';

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType;
  context: {
    userId?: string;
    locationId?: string;
    vendorId?: string;
    timeImpactMinutes?: number;
  };
}

const actionConfig: Record<ActionType, { title: string; description: string }> = {
  assign_mentor: { title: 'Assign Mentor', description: 'Pair this team member with a high performer for coaching' },
  prepare_review: { title: 'Prepare Performance Review', description: 'Generate a performance review document with supporting data' },
  generate_training_recommendation: { title: 'Generate Training Recommendation', description: 'Create a targeted training plan based on identified skill gaps' },
  generate_location_comparison: { title: 'Generate Location Comparison', description: 'Compare performance metrics against top-performing locations' },
  set_benchmark_target: { title: 'Set Benchmark Target', description: 'Set improvement targets based on best performer metrics' },
  request_sop_upload: { title: 'Request SOP Upload', description: 'Request standard operating procedures from the best-performing location' },
  start_vendor_workflow: { title: 'Start Vendor Improvement Workflow', description: 'Initiate a structured workflow to address vendor compliance issues' },
};

export function ActionDrawer({ isOpen, onClose, actionType, context }: ActionDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const config = actionConfig[actionType];

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTask = () => {
    setTaskAdded(true);
    setTimeout(() => setTaskAdded(false), 2000);
  };

  const user = context.userId ? users.find(u => u.id === context.userId) : null;
  const location = context.locationId ? locations.find(l => l.id === context.locationId) : null;
  const vendor = context.vendorId ? vendors.find(v => v.id === context.vendorId) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
                <p className="text-xs text-violet-600 font-medium">AI-Assisted Action</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Context Notice */}
          {(user || location || vendor) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Context</p>
              <p className="text-sm font-medium text-slate-900">
                {user && `${user.name} (${locations.find(l => l.id === user.locationId)?.name})`}
                {location && !user && location.name}
                {vendor && vendor.name}
              </p>
            </div>
          )}

          {/* Generated Content */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500" />
                <p className="text-xs font-semibold text-slate-700">AI-Generated Content</p>
              </div>
              <button
                onClick={() => handleCopy(getGeneratedContent(actionType, { user, location, vendor }))}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white border border-slate-200 rounded-lg p-3 max-h-64 overflow-y-auto">
              {getGeneratedContent(actionType, { user, location, vendor })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-blue-500" />
              <p className="text-xs font-semibold text-blue-800">Key Insights</p>
            </div>
            <ul className="text-sm text-blue-700 space-y-1.5">
              {getKeyInsights(actionType, { user, location, vendor }).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Checklist */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={14} className="text-amber-500" />
              <p className="text-xs font-semibold text-amber-800">Follow-up Checklist</p>
            </div>
            <div className="space-y-2">
              {getChecklist(actionType).map((item, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-amber-300" />
                  <span className="text-sm text-amber-800">{item.task}</span>
                  <span className="text-xs text-amber-500 ml-auto">{item.due}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors w-full justify-center"
            >
              {taskAdded ? <Check size={12} /> : <Plus size={12} />}
              {taskAdded ? 'Added to My Tasks!' : 'Add to My Tasks'}
            </button>
          </div>

          {/* Expected Impact */}
          {context.timeImpactMinutes && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-800">Expected Impact</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{(context.timeImpactMinutes / 60).toFixed(1)} hrs/week</p>
              <p className="text-xs text-emerald-600 mt-1">Estimated time savings if addressed</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleAddTask();
                setTimeout(onClose, 1500);
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              Schedule Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGeneratedContent(
  actionType: ActionType,
  context: { user?: typeof users[0] | null; location?: typeof locations[0] | null; vendor?: typeof vendors[0] | null }
): string {
  const { user, location, vendor } = context;

  switch (actionType) {
    case 'assign_mentor':
      return `MENTOR ASSIGNMENT RECOMMENDATION

Employee: ${user?.name || 'Selected Employee'}
Current Performance: Below team average
Location: ${location?.name || 'N/A'}

RECOMMENDED MENTOR: Lara Patel
Reason: Top performer in Austin with 40% above average volume and lowest exception rate.

MENTORING FOCUS AREAS:
1. Invoice processing workflow optimization
2. GL code assignment accuracy
3. Exception prevention techniques

SUGGESTED MEETING CADENCE:
- Initial meeting: Within 3 business days
- Weekly check-ins: 30 minutes
- Duration: 6 weeks

SUCCESS METRICS:
- Increase daily volume by 15%
- Reduce exception rate by 25%
- Achieve "Average" or better performance category`;

    case 'prepare_review':
      return `PERFORMANCE REVIEW DOCUMENT

Employee: ${user?.name || 'Selected Employee'}
Review Period: Last 30 Days
Prepared: ${new Date().toLocaleDateString()}

PERFORMANCE SUMMARY:
- Daily Processing Volume: 9.1 invoices (35% below team average of 14)
- Exception Rate: 28.9% (significantly above 11.4% team average)
- Cost Per Invoice: $9.85 (above $4.82 team average)

KEY OBSERVATIONS:
1. Consistent underperformance over 4-week period
2. High proportion of GL code-related exceptions (62%)
3. Processing time 50% longer than team average

RECOMMENDED ACTIONS:
1. Assign mentor (Lara Patel recommended)
2. GL coding training module
3. Weekly performance check-ins
4. 30-day improvement plan with clear targets

IMPROVEMENT TARGETS:
- Week 2: Achieve 11 invoices/day
- Week 4: Achieve 12.5 invoices/day
- Week 6: Achieve team average (14/day)`;

    case 'generate_training_recommendation':
      return `TRAINING RECOMMENDATION

Employee: ${user?.name || 'Selected Employee'}
Identified Skill Gap: GL Code Assignment

ANALYSIS:
- 62% of exceptions are GL code-related
- Industry benchmark: <15% GL exceptions
- Estimated impact: $890/month in rework

RECOMMENDED TRAINING:
1. "GL Code Fundamentals" (2 hours)
   - Understanding chart of accounts structure
   - Common GL code categories

2. "Advanced GL Assignment" (1.5 hours)
   - Complex invoice scenarios
   - Multi-line GL distribution

3. "Exception Prevention" (1 hour)
   - Pre-submission checklist
   - Common mistakes to avoid

DELIVERY METHOD: Self-paced online + 30-min live Q&A

EXPECTED OUTCOME:
- 40-60% reduction in GL exceptions
- Estimated savings: $350-530/month`;

    case 'generate_location_comparison':
      return `LOCATION COMPARISON REPORT

Comparing: ${location?.name || 'LA'} vs Austin (Best Performer)

OVERALL SCORES:
- ${location?.name || 'LA'}: 80
- Austin: 93 (14% higher)

KEY METRICS COMPARISON:
                    ${location?.name || 'LA'}     Austin      Gap
Touchless Rate:     83.9%      91.8%      -7.9%
Exception Rate:     16.1%       8.2%      +7.9%
Avg Processing:     4.0 days   2.0 days   +2.0 days
Cost/Invoice:       $6.40      $3.80      +$2.60

COST IMPACT:
Monthly excess cost vs Austin benchmark: $3,890

ROOT CAUSE ANALYSIS:
1. Higher exception rate driven by:
   - Missing PO issues (42% of exceptions)
   - GL code errors (31% of exceptions)

2. Processing time impacted by:
   - More manual interventions required
   - Less standardized workflows

RECOMMENDED ACTIONS:
1. Implement Austin's PO verification process
2. Deploy GL coding training
3. Adopt Austin's SOP for new vendors`;

    case 'set_benchmark_target':
      return `BENCHMARK TARGET SETTING

Location: ${location?.name || 'LA'}
Benchmark: Austin (Top Performer)

CURRENT STATE vs TARGET:

Metric              Current    Target    Improvement
Exception Rate:     16.1%      10.0%     -6.1%
Touchless Rate:     83.9%      88.0%     +4.1%
Avg Processing:     4.0 days   2.5 days  -1.5 days
Cost/Invoice:       $6.40      $4.50     -$1.90

TIMELINE: 90-day improvement plan

MILESTONES:
Day 30:  Exception rate ≤14%
Day 60:  Exception rate ≤12%, Processing ≤3.0 days
Day 90:  All targets achieved

ESTIMATED IMPACT:
Monthly savings at target: $2,340

TRACKING:
- Weekly progress reviews
- Bi-weekly leadership updates
- Monthly formal assessment`;

    case 'request_sop_upload':
      return `SOP UPLOAD REQUEST

To: Austin Location Manager
From: Operations Team
Subject: Request for Standard Operating Procedures

Dear Team,

Austin has been identified as our top-performing location with exceptional metrics:
- 93 location score
- 91.8% touchless rate
- $3.80 cost per invoice

We would like to document your processes to help other locations improve. Please upload SOPs for:

1. NEW VENDOR ONBOARDING
   - PO requirement communication
   - Invoice format guidelines
   - Contact setup process

2. DAILY PROCESSING WORKFLOW
   - Morning prioritization approach
   - Exception handling procedures
   - End-of-day reconciliation

3. QUALITY CONTROL
   - Pre-submission checklist
   - Peer review process
   - Error correction workflow

UPLOAD DEADLINE: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Thank you for helping improve our organization!`;

    case 'start_vendor_workflow':
      return `VENDOR IMPROVEMENT WORKFLOW

Vendor: ${vendor?.name || 'Worldwide Produce'}
Initiated: ${new Date().toLocaleDateString()}
Priority: High

ISSUE SUMMARY:
- Vendor Score: 52 (Critical)
- PO Match Rate: 42% (target: >90%)
- GL Mapping Rate: 61% (target: >90%)
- Processing Time: 8.7 days (target: <3 days)

COST IMPACT: $4,120/month in processing overhead

WORKFLOW STEPS:

STEP 1: INITIAL OUTREACH (Due: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()})
□ Send compliance requirements letter
□ Schedule call with vendor contact
□ Share invoice format guidelines

STEP 2: COMPLIANCE REVIEW (Due: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()})
□ Review sample invoices
□ Identify specific format issues
□ Provide detailed feedback

STEP 3: IMPLEMENTATION (Due: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()})
□ Vendor implements changes
□ Test batch of new invoices
□ Verify improvement

STEP 4: MONITORING (Ongoing)
□ Weekly score tracking
□ Monthly review meeting
□ Escalation if no improvement

ESCALATION PATH:
If no improvement after 60 days → Accounts Payable Director review`;

    default:
      return 'Generated content will appear here.';
  }
}

function getKeyInsights(
  actionType: ActionType,
  _context: { user?: typeof users[0] | null; location?: typeof locations[0] | null; vendor?: typeof vendors[0] | null }
): string[] {
  switch (actionType) {
    case 'assign_mentor':
      return [
        'Employees with mentors improve 2x faster than those without',
        'Lara Patel has successfully mentored 3 team members this year',
        'Average mentorship duration for similar cases: 6 weeks',
      ];
    case 'prepare_review':
      return [
        'Performance has been declining for 4 consecutive weeks',
        'GL coding errors account for majority of exceptions',
        'Similar cases improved 40% within 30 days with intervention',
      ];
    case 'generate_training_recommendation':
      return [
        'Targeted training reduces specific exception types by 40-60%',
        'Self-paced modules have 85% completion rate',
        'ROI on training: 3x within first month',
      ];
    case 'generate_location_comparison':
      return [
        'Austin has maintained top position for 6 consecutive months',
        'Exception rate gap is the primary driver of cost difference',
        'Similar locations improved 15% after implementing Austin practices',
      ];
    case 'set_benchmark_target':
      return [
        'Incremental targets have 70% higher success rate than aggressive goals',
        '90-day timeline allows for sustainable process changes',
        'Weekly tracking catches issues before they compound',
      ];
    case 'request_sop_upload':
      return [
        'Documented SOPs reduce new hire ramp-up time by 40%',
        'Standardized processes reduce cross-location variance by 25%',
        'Austin\'s practices are replicable with minimal customization',
      ];
    case 'start_vendor_workflow':
      return [
        '73% of vendors improve compliance within 30 days of outreach',
        'Structured workflows have 2x success rate vs ad-hoc communication',
        'Early escalation prevents prolonged cost impact',
      ];
    default:
      return [];
  }
}

function getChecklist(actionType: ActionType): { task: string; due: string }[] {
  const today = new Date();
  const addDays = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  switch (actionType) {
    case 'assign_mentor':
      return [
        { task: 'Confirm mentor availability', due: addDays(2) },
        { task: 'Schedule initial meeting', due: addDays(5) },
        { task: 'Set up weekly check-in calendar', due: addDays(7) },
        { task: 'Define success metrics', due: addDays(7) },
      ];
    case 'prepare_review':
      return [
        { task: 'Schedule 1:1 meeting', due: addDays(3) },
        { task: 'Review historical data', due: addDays(2) },
        { task: 'Prepare improvement plan', due: addDays(5) },
        { task: 'Document meeting outcomes', due: addDays(7) },
      ];
    case 'generate_training_recommendation':
      return [
        { task: 'Share training plan with employee', due: addDays(2) },
        { task: 'Enroll in training modules', due: addDays(3) },
        { task: 'Schedule Q&A session', due: addDays(10) },
        { task: 'Assess post-training performance', due: addDays(21) },
      ];
    case 'generate_location_comparison':
      return [
        { task: 'Review report with location manager', due: addDays(3) },
        { task: 'Identify quick wins', due: addDays(5) },
        { task: 'Create action plan', due: addDays(7) },
        { task: 'Schedule follow-up review', due: addDays(30) },
      ];
    case 'set_benchmark_target':
      return [
        { task: 'Communicate targets to team', due: addDays(2) },
        { task: 'Set up tracking dashboard', due: addDays(3) },
        { task: 'First progress check', due: addDays(7) },
        { task: '30-day milestone review', due: addDays(30) },
      ];
    case 'request_sop_upload':
      return [
        { task: 'Send formal request', due: addDays(1) },
        { task: 'Follow up on receipt', due: addDays(3) },
        { task: 'Review uploaded SOPs', due: addDays(10) },
        { task: 'Plan rollout to other locations', due: addDays(14) },
      ];
    case 'start_vendor_workflow':
      return [
        { task: 'Send initial outreach email', due: addDays(1) },
        { task: 'Schedule vendor call', due: addDays(5) },
        { task: 'Share compliance requirements', due: addDays(7) },
        { task: 'First compliance review', due: addDays(14) },
      ];
    default:
      return [];
  }
}
