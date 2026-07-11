import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface PurchaseOrderChartsProps {
  isLoading: boolean;
  data?: {
    monthlyPO: { name: string; value: number }[];
    statusDonut: { name: string; value: number; color: string }[];
    valueTrend: { date: string; amount: number }[];
  };
}

export function PurchaseOrderCharts({ isLoading, data }: PurchaseOrderChartsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(val);
  };

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="h-80 flex flex-col justify-between p-5 dark:bg-slate-900 dark:border-slate-800">
            <Skeleton className="h-5 w-40 dark:bg-slate-800" />
            <Skeleton className="h-44 w-full dark:bg-slate-800" />
            <Skeleton className="h-4 w-full dark:bg-slate-800" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Monthly POs */}
      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Monthly Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyPO} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: '#475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Order Status Donut */}
      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Order Status breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 h-64 flex flex-col justify-center">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.statusDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Status Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
            {data.statusDonut.map((entry, index) => (
              <div key={index} className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Purchase Value Trend */}
      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Order Value Trend (INR)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.valueTrend} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(value), 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: '#475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
