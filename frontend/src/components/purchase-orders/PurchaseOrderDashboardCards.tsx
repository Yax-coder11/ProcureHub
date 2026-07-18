import * as React from 'react';
import { ClipboardList, Hourglass, CheckCircle2, Truck, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface DashboardCardsProps {
  isLoading: boolean;
  stats?: {
    totalCount: number;
    totalCountTrend: number;
    pendingCount: number;
    pendingCountTrend: number;
    approvedCount: number;
    approvedCountTrend: number;
    deliveredCount: number;
    deliveredCountTrend: number;
    totalValue: number;
    totalValueTrend: number;
  };
}

export function PurchaseOrderDashboardCards({ isLoading, stats }: DashboardCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cardsData = [
    {
      title: 'Total Purchase Orders',
      value: stats?.totalCount,
      trend: stats?.totalCountTrend || 0,
      icon: ClipboardList,
      color: 'border-l-4 border-l-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20',
      description: 'Total orders initialized',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingCount,
      trend: stats?.pendingCountTrend || 0,
      icon: Hourglass,
      color: 'border-l-4 border-l-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20',
      description: 'Awaiting manager approval',
    },
    {
      title: 'Approved Orders',
      value: stats?.approvedCount,
      trend: stats?.approvedCountTrend || 0,
      icon: CheckCircle2,
      color: 'border-l-4 border-l-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20',
      description: 'Approved & sent orders',
    },
    {
      title: 'Delivered Commitment',
      value: stats?.deliveredCount,
      trend: stats?.deliveredCountTrend || 0,
      icon: Truck,
      color: 'border-l-4 border-l-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20',
      description: 'Shipped & fulfilled orders',
    },
    {
      title: 'Total Order Value',
      value: stats?.totalValue ? formatCurrency(stats.totalValue) : undefined,
      trend: stats?.totalValueTrend || 0,
      icon: IndianRupee,
      color: 'border-l-4 border-l-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50/40 dark:bg-violet-950/20',
      description: 'Excluding cancelled orders',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} className="p-5 flex flex-col space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <Skeleton className="h-4 w-28 dark:bg-slate-800" />
            <Skeleton className="h-8 w-20 dark:bg-slate-800" />
            <Skeleton className="h-3 w-32 dark:bg-slate-800" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cardsData.map((card, idx) => {
        const Icon = card.icon;
        const isTrendPositive = card.trend >= 0;
        return (
          <Card
            key={idx}
            className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <Icon className="h-5 w-5 opacity-80" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {card.value !== undefined ? card.value : '0'}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <div className={`flex items-center font-medium ${isTrendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isTrendPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                <span>{Math.abs(card.trend)}%</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">vs last month</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
