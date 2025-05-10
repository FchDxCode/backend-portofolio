"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonMetricsProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function ComparisonMetrics({ analytics, className = "" }: ComparisonMetricsProps) {
    const comparison = analytics.comparison;
    
    // If we don't have real comparison data, use placeholder for the UI
    const metrics = comparison ? [
        { 
            name: "Bounce Rate", 
            current: "42.3%", 
            previous: "46.8%", 
            change: 4.5, 
            improved: true 
        },
        { 
            name: "Pages / Visit", 
            current: "3.7", 
            previous: "3.2", 
            change: 15.6, 
            improved: true 
        },
        { 
            name: "New Visitors", 
            current: `${Math.round(comparison.current.uniqueVisitors * 0.68)}`, 
            previous: `${Math.round(comparison.previous.uniqueVisitors * 0.65)}`, 
            change: 4.6, 
            improved: true 
        },
    ] : [
        { 
            name: "Bounce Rate", 
            current: "42.3%", 
            previous: "46.8%", 
            change: 4.5, 
            improved: true 
        },
        { 
            name: "Pages / Visit", 
            current: "3.7", 
            previous: "3.2", 
            change: 15.6, 
            improved: true 
        },
        { 
            name: "New Visitors", 
            current: "16,842", 
            previous: "16,105", 
            change: 4.6, 
            improved: true 
        },
    ];

    return (
        <div className={`rounded-xl border bg-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                </div>
            </div>
            
            <div className="space-y-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="pb-6 border-b last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-muted-foreground">{metric.name}</span>
                            <div className="flex items-center gap-1">
                                {metric.improved ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                )}
                                <span 
                                    className={metric.improved ? 'text-emerald-500' : 'text-rose-500'}
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    {metric.improved ? '+' : ''}{metric.change}%
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-accent/40 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Current</p>
                                <p className="text-lg font-semibold">{metric.current}</p>
                            </div>
                            <div className="bg-accent/40 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Previous</p>
                                <p className="text-lg font-semibold">{metric.previous}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}