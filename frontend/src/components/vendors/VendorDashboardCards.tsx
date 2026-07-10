import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface Stats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

interface VendorDashboardCardsProps {
  stats?: Stats;
  isLoading: boolean;
}

export function VendorDashboardCards({ stats, isLoading }: VendorDashboardCardsProps) {
  const cards = [
    {
      title: 'Total Vendors',
      value: stats?.total ?? 0,
      icon: Users,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
      description: 'Registered business entities',
    },
    {
      title: 'Active Vendors',
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      description: 'Eligible for RFQ & bidding',
    },
    {
      title: 'Pending Vendors',
      value: stats?.pending ?? 0,
      icon: Clock,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      description: 'Under review/verification',
    },
    {
      title: 'Inactive Vendors',
      value: stats?.inactive ?? 0,
      icon: AlertCircle,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
      description: 'Temporarily/permanently disabled',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="overflow-hidden border-slate-200">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
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
                  <div className={`p-3 rounded-lg border ${card.colorClass}`}>
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
