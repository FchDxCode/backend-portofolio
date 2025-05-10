"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
    // This component is a wrapper that can be expanded in the future
    // Currently it's just a placeholder since we're using direct components in the page
    
    const highlights = [
        {
            title: "Total Visitors",
            value: analytics.uniqueVisitors || "24,850",
            change: "+12.3%",
            trend: "up",
            icon: <Users className="h-5 w-5" />
        },
        {
            title: "Page Views",
            value: "96,438",
            change: "+8.7%",
            trend: "up",
            icon: <BarChart3 className="h-5 w-5" />
        },
        {
            title: "Avg. Session",
            value: "2m 45s",
            change: "+15.2%",
            trend: "up",
            icon: <Clock className="h-5 w-5" />
        },
        {
            title: "Conversion Rate",
            value: "3.2%",
            change: "+0.8%",
            trend: "up",
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
                            <h3 className="text-2xl font-bold mt-2">{item.value}</h3>
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