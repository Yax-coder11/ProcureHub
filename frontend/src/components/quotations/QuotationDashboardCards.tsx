import { ClipboardList, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface Stats {
  total: number;
  draft: number;
  submitted: number;
  accepted: number;
  rejected: number;
}

interface QuotationDashboardCardsProps {
  stats?: Stats;
  isLoading: boolean;
}

export function QuotationDashboardCards({ stats, isLoading }: QuotationDashboardCardsProps) {
  const cards = [
    {
      title: 'Total Quotations',
      value: stats?.total ?? 0,
      icon: ClipboardList,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
      description: 'Total proposals raised',
    },
    {
      title: 'Draft Proposals',
      value: stats?.draft ?? 0,
      icon: FileText,
      colorClass: 'text-slate-600 bg-slate-50 border-slate-100',
      description: 'Unsubmitted proposals',
    },
    {
      title: 'Submitted Bids',
      value: stats?.submitted ?? 0,
      icon: Clock,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      description: 'Under review by buyer',
    },
    {
      title: 'Accepted Bids',
      value: stats?.accepted ?? 0,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      description: 'Approved bids (ready for PO)',
    },
    {
      title: 'Rejected Bids',
      value: stats?.rejected ?? 0,
      icon: XCircle,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
      description: 'Declined by buyer',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="overflow-hidden border-slate-200">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-400 font-normal">{card.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${card.colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
