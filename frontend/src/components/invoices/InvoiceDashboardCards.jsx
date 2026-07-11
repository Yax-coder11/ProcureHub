import * as React from 'react';
import { ClipboardList, Hourglass, CheckCircle2, XCircle, IndianRupee } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function InvoiceDashboardCards({ isLoading, stats }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cardsData = [
    {
      title: 'Total Invoices',
      value: stats?.totalCount,
      icon: ClipboardList,
      color: 'border-l-4 border-l-brand-500 text-brand-600 bg-brand-50/40',
      description: 'Total invoices generated',
    },
    {
      title: 'Pending Payment',
      value: stats?.pendingCount,
      icon: Hourglass,
      color: 'border-l-4 border-l-amber-500 text-amber-600 bg-amber-50/40',
      description: 'Awaiting cash clearance',
    },
    {
      title: 'Paid Invoices',
      value: stats?.paidCount,
      icon: CheckCircle2,
      color: 'border-l-4 border-l-emerald-500 text-emerald-600 bg-emerald-50/40',
      description: 'Cleared invoices',
    },
    {
      title: 'Cancelled Invoices',
      value: stats?.cancelledCount,
      icon: XCircle,
      color: 'border-l-4 border-l-rose-500 text-rose-600 bg-rose-50/40',
      description: 'Voided invoices',
    },
    {
      title: 'Total Invoiced Value',
      value: stats?.totalAmount ? formatCurrency(stats.totalAmount) : undefined,
      icon: IndianRupee,
      color: 'border-l-4 border-l-violet-500 text-violet-600 bg-violet-50/40',
      description: 'Excluding cancelled value',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} className="p-5 flex flex-col space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cardsData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`p-5 rounded-xl border border-slate-200 bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <Icon className="h-5 w-5 opacity-80" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value !== undefined ? card.value : '0'}
              </span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 font-normal">{card.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
