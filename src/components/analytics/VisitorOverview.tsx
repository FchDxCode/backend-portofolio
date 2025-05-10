"use client";

import { Users, Clock, MousePointerClick, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { useTheme } from 'next-themes';
import AnalyticsLoading from '@/src/components/analytics/AnalyticsLoading';

interface VisitorOverviewProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function VisitorOverview({ analytics, className = "" }: VisitorOverviewProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    if (analytics.loading) {
        return <div className={`rounded-xl border bg-card p-6 ${className}`}><AnalyticsLoading /></div>;
    }
    
    // Calculate average duration from visitor stats
    const calculateAvgDuration = () => {
        if (!analytics.visitorStats || analytics.visitorStats.length === 0) return "0s";
        
        const avgDurationSecs = Math.floor(
            analytics.visitorStats.reduce((sum, stat) => sum + (stat.avgDuration || 0), 0) / 
            analytics.visitorStats.length
        );
        
        const mins = Math.floor(avgDurationSecs / 60);
        const secs = avgDurationSecs % 60;
        return `${mins}m ${secs}s`;
    };
    
    const overviewMetrics = [
        {
            title: "Total Visitors",
            value: analytics.uniqueVisitors || 0,
            icon: <Users className="h-5 w-5" />,
            change: analytics.comparison?.changes.uniqueVisitorsPercent || 0,
            color: "from-blue-600 to-indigo-600",
            gradient: "from-blue-100/20 to-indigo-100/20",
            darkGradient: "from-blue-900/20 to-indigo-900/20"
        },
        {
            title: "Total Visits",
            value: analytics.comparison?.current.totalVisits || 0,
            icon: <MousePointerClick className="h-5 w-5" />,
            change: analytics.comparison?.changes.visitsPercent || 0,
            color: "from-purple-600 to-pink-600",
            gradient: "from-purple-100/20 to-pink-100/20",
            darkGradient: "from-purple-900/20 to-pink-900/20"
        },
        {
            title: "Avg. Visit Duration",
            value: calculateAvgDuration(),
            icon: <Clock className="h-5 w-5" />,
            change: 0, // Needs to be calculated if you have data for this
            color: "from-amber-500 to-orange-600",
            gradient: "from-amber-100/20 to-orange-100/20",
            darkGradient: "from-amber-900/20 to-orange-900/20"
        }
    ];
    
    // Format number with commas
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className={`rounded-xl border bg-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Visitor Overview</h3>
                <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {overviewMetrics.map((metric, index) => (
                    <div 
                        key={index} 
                        className="rounded-xl border bg-gradient-to-br p-[1px] relative overflow-hidden"
                        style={{
                            backgroundImage: `linear-gradient(to bottom right, ${isDark ? metric.darkGradient : metric.gradient})`
                        }}
                    >
                        <div className="bg-card rounded-xl p-4 h-full">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center mb-3`}>
                                <div className="text-white">
                                    {metric.icon}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-muted-foreground">{metric.title}</p>
                                <h4 className="text-2xl font-bold mt-1">
                                    {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                                </h4>
                                
                                <div className="flex items-center gap-1 mt-2">
                                    {metric.change > 0 ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-rose-500" />
                                    )}
                                    <span 
                                        className={metric.change > 0 ? 'text-emerald-500' : 'text-rose-500'}
                                        style={{ fontSize: '0.875rem' }}
                                    >
                                        {metric.change > 0 ? '+' : ''}{metric.change}%
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        vs previous
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}