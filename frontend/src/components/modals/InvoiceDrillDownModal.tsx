import { useState } from 'react';
import { X, Search, Download, RefreshCw, Check, Flag, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  receivedDate: string;
  exceptionType: string;
  status: 'Pending' | 'In Review' | 'Resolved';
}

interface InvoiceDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  invoices: Invoice[];
}

const statusColors = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Review': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

export function InvoiceDrillDownModal({ isOpen, onClose, title, subtitle, invoices }: InvoiceDrillDownModalProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map(i => i.id)));
    }
  };

  const patterns = analyzePatterns(invoices);

  const handleExport = () => {
    const csvContent = [
      ['Invoice #', 'Vendor', 'Amount', 'Received', 'Exception Type', 'Status'].join(','),
      ...filteredInvoices.map(inv =>
        [inv.invoiceNumber, inv.vendor, inv.amount, inv.receivedDate, inv.exceptionType, inv.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3">
            <span className="text-sm font-medium text-blue-700">Selected: {selectedIds.size}</span>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg">
              <RefreshCw size={12} />
              Reassign
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg">
              <Check size={12} />
              Resolve
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg">
              <Flag size={12} />
              Flag
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Invoice #</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Received</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Exception Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(invoice.id)}
                      onChange={() => toggleSelect(invoice.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-700">{invoice.vendor}</td>
                  <td className="py-3 px-4 text-slate-700">${invoice.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-500">{invoice.receivedDate}</td>
                  <td className="py-3 px-4 text-slate-700">{invoice.exceptionType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patterns Footer */}
        {patterns.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 rounded-b-2xl">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Patterns Detected</p>
                <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                  {patterns.map((pattern, i) => (
                    <li key={i}>• {pattern}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function analyzePatterns(invoices: Invoice[]): string[] {
  const patterns: string[] = [];

  // Exception type distribution
  const exceptionCounts: Record<string, number> = {};
  invoices.forEach(inv => {
    exceptionCounts[inv.exceptionType] = (exceptionCounts[inv.exceptionType] || 0) + 1;
  });

  const topException = Object.entries(exceptionCounts).sort((a, b) => b[1] - a[1])[0];
  if (topException && topException[1] > invoices.length * 0.3) {
    patterns.push(`${Math.round(topException[1] / invoices.length * 100)}% are ${topException[0]} issues`);
  }

  // Vendor concentration
  const vendorCounts: Record<string, number> = {};
  invoices.forEach(inv => {
    vendorCounts[inv.vendor] = (vendorCounts[inv.vendor] || 0) + 1;
  });

  const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topVendor && topVendor[1] > invoices.length * 0.4) {
    patterns.push(`${topVendor[0]} appears in ${Math.round(topVendor[1] / invoices.length * 100)}% of invoices`);
  }

  return patterns;
}

// Generate sample invoices for drill-down
export function generateSampleInvoices(count: number, context?: { vendor?: string; exceptionType?: string }): Invoice[] {
  const vendors = ['Sysco', 'US Foods', 'Worldwide Produce', 'Sunrise Produce', 'Imperial Dade', 'Ecolab'];
  const exceptionTypes = ['Missing PO', 'GL Code Missing', 'Amount Mismatch', 'Duplicate Invoice', 'Vendor Mapping'];
  const statuses: Invoice['status'][] = ['Pending', 'In Review', 'Resolved'];

  return Array.from({ length: count }, (_, i) => ({
    id: `inv_${i}`,
    invoiceNumber: `INV-${String(10000 + i).slice(1)}`,
    vendor: context?.vendor || vendors[Math.floor(Math.random() * vendors.length)],
    amount: Math.round(100 + Math.random() * 5000),
    receivedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    exceptionType: context?.exceptionType || exceptionTypes[Math.floor(Math.random() * exceptionTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}
