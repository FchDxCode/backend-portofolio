"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { CardLoader } from '@/src/components/ui/Loader';

interface AnalyticsDashboardProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
    if (analytics.loading) {
        return <div className="w-full p-12"><CardLoader /></div>;
    }
    
    const highlights = [
        {
            title: "Total Visitors",
            value: analytics.uniqueVisitors || 0,
            change: analytics.comparison?.changes.uniqueVisitorsPercent 
                ? analytics.formatPercentChange(analytics.comparison.changes.uniqueVisitorsPercent) 
                : "0%",
            trend: analytics.comparison?.changes.uniqueVisitorsPercent 
                ? analytics.comparison.changes.uniqueVisitorsPercent > 0 ? "up" : "down" 
                : "neutral",
            icon: <Users className="h-5 w-5" />
        },
        {
            title: "Page Views",
            value: analytics.comparison?.current.totalVisits || 0,
            change: analytics.comparison?.changes.visitsPercent 
                ? analytics.formatPercentChange(analytics.comparison.changes.visitsPercent) 
                : "0%",
            trend: analytics.comparison?.changes.visitsPercent 
                ? analytics.comparison.changes.visitsPercent > 0 ? "up" : "down" 
                : "neutral",
            icon: <BarChart3 className="h-5 w-5" />
        },
        {
            title: "Avg. Session",
            value: analytics.visitorStats && analytics.visitorStats.length > 0
                ? `${Math.floor(analytics.visitorStats.reduce((sum, stat) => sum + (stat.avgDuration || 0), 0) / analytics.visitorStats.length)}s`
                : "0s",
            change: "0%",
            trend: "up",
            icon: <Clock className="h-5 w-5" />
        },
        {
            title: "Conversion Rate",
            value: (() => {
                // Gunakan data unik visitor sebagai proxy untuk "konversi"
                // Hitung persentase unik visitor terhadap total kunjungan
                const totalVisits = analytics.comparison?.current.totalVisits || 0;
                const uniqueVisitors = analytics.uniqueVisitors || 0;
                
                if (totalVisits === 0) return "0%";
                
                // Hitung persentase unik visitor terhadap total kunjungan
                // Ini bisa dianggap sebagai "conversion rate" sederhana
                const rate = (uniqueVisitors / totalVisits) * 100;
                return `${rate.toFixed(1)}%`;
            })(),
            change: analytics.comparison?.changes.uniqueVisitorsPercent 
                ? analytics.formatPercentChange(analytics.comparison.changes.uniqueVisitorsPercent) 
                : "0%",
            trend: (analytics.comparison?.changes.uniqueVisitorsPercent || 0) > 0 ? "up" : "down",
            icon: <TrendingUp className="h-5 w-5" />
        }
    ];
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, i) => (
                <div key={i} className="rounded-xl border bg-card p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                            <h3 className="text-2xl font-bold mt-2">
                                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                            </h3>
                            <p className={`text-sm mt-1 ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {item.change} vs. previous
                            </p>
                        </div>
                        <div className="rounded-full p-2 bg-primary/10">
                            <div className="text-primary">
                                {item.icon}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}