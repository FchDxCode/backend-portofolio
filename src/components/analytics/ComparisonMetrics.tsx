"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import AnalyticsLoading from '@/src/components/analytics/AnalyticsLoading';

interface ComparisonMetricsProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function ComparisonMetrics({ analytics, className = "" }: ComparisonMetricsProps) {
    const comparison = analytics.comparison;
    
    if (analytics.loading) {
        return <div className={`rounded-xl border bg-card p-6 ${className}`}><AnalyticsLoading /></div>;
    }
    
    // If no comparison data available, show empty state
    if (!comparison) {
        return (
            <div className={`rounded-xl border bg-card p-6 flex flex-col items-center justify-center min-h-[300px] ${className}`}>
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comparison data</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    Enable "Compare with previous period" in the filter panel to see comparison metrics.
                </p>
            </div>
        );
    }
    
    // Dengan alternatif yang menggunakan data yang sudah ada
    const calculateBounceRateMetrics = () => {
        if (!analytics.comparison) {
            return { current: 0, previous: 0, change: 0 };
        }
        
        // Estimasi bounce rate sederhana berdasarkan rasio total kunjungan
        // dengan pengunjung unik. Semakin dekat rasionya dengan 1, semakin tinggi bounce rate.
        const currentRatio = analytics.comparison.current.uniqueVisitors / Math.max(1, analytics.comparison.current.totalVisits);
        const previousRatio = analytics.comparison.previous.uniqueVisitors / Math.max(1, analytics.comparison.previous.totalVisits);
        
        // Konversi ke persentase bounce rate (estimasi kasar)
        const currentBounce = Math.min(100, Math.max(0, (1 - (1 / Math.max(1, currentRatio))) * 100));
        const previousBounce = Math.min(100, Math.max(0, (1 - (1 / Math.max(1, previousRatio))) * 100));
        
        // Hitung perubahan (improvement = bounce rate turun)
        const change = previousBounce > 0 ? ((currentBounce - previousBounce) / previousBounce) * 100 : 0;
        
        return { 
            current: currentBounce, 
            previous: previousBounce, 
            change: change
        };
    };

    const calculatePagesPerVisitMetrics = () => {
        if (!analytics.comparison) {
            return { current: 0, previous: 0, change: 0 };
        }
        
        // Estimasi pages per visit berdasarkan rasio total kunjungan
        // dengan pengunjung unik. Nilai lebih tinggi berarti lebih banyak halaman dilihat per pengunjung.
        const currentPagesPerVisit = analytics.comparison.current.totalVisits / 
                                     Math.max(1, analytics.comparison.current.uniqueVisitors);
        const previousPagesPerVisit = analytics.comparison.previous.totalVisits / 
                                      Math.max(1, analytics.comparison.previous.uniqueVisitors);
        
        // Hitung perubahan (improvement = lebih banyak halaman dilihat)
        const change = previousPagesPerVisit > 0 ? 
            ((currentPagesPerVisit - previousPagesPerVisit) / previousPagesPerVisit) * 100 : 0;
        
        return { 
            current: currentPagesPerVisit, 
            previous: previousPagesPerVisit, 
            change: change
        };
    };

    const bounceRateMetrics = calculateBounceRateMetrics();
    const pagesPerVisitMetrics = calculatePagesPerVisitMetrics();
    
    // Calculate new visitors as a percentage of unique visitors
    const newVisitorPercent = 0.65; // This should come from actual data
    const currentNewVisitors = Math.round(comparison.current.uniqueVisitors * newVisitorPercent);
    const previousNewVisitors = Math.round(comparison.previous.uniqueVisitors * newVisitorPercent);
    const newVisitorsChange = comparison.previous.uniqueVisitors > 0 
        ? ((currentNewVisitors - previousNewVisitors) / previousNewVisitors) * 100 
        : 0;
    
    const metrics = [
        { 
            name: "Bounce Rate", 
            current: `${bounceRateMetrics.current.toFixed(1)}%`, 
            previous: `${bounceRateMetrics.previous.toFixed(1)}%`, 
            change: bounceRateMetrics.change, 
            improved: bounceRateMetrics.change < 0 // Lower bounce rate is better
        },
        { 
            name: "Pages / Visit", 
            current: pagesPerVisitMetrics.current.toFixed(1), 
            previous: pagesPerVisitMetrics.previous.toFixed(1), 
            change: pagesPerVisitMetrics.change, 
            improved: pagesPerVisitMetrics.change > 0 
        },
        { 
            name: "New Visitors", 
            current: currentNewVisitors.toLocaleString(), 
            previous: previousNewVisitors.toLocaleString(), 
            change: newVisitorsChange, 
            improved: newVisitorsChange > 0 
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