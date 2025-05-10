"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from 'next-themes';
import { ArrowUp, ArrowDown, Globe, RefreshCw } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface TrafficSourcesAnalysisProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function TrafficSourcesAnalysis({ analytics, className = "" }: TrafficSourcesAnalysisProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // Use trafficSources from the hook or generate placeholder data
    const sources = analytics.trafficSources.length > 0 ? analytics.trafficSources : [
        { referer: "organic", count: 12450, percent: 45 },
        { referer: "direct", count: 5840, percent: 21 },
        { referer: "social", count: 4200, percent: 15 },
        { referer: "referral", count: 3080, percent: 11 },
        { referer: "email", count: 1680, percent: 6 },
        { referer: "other", count: 560, percent: 2 }
    ];
    
    // Define source categories and their colors
    const sourceCategories = {
        "organic": {
            title: "Organic Search",
            color: "rgb(59, 130, 246)", // blue
            description: "Traffic from search engines"
        },
        "direct": {
            title: "Direct",
            color: "rgb(124, 58, 237)", // purple
            description: "Direct URL entry or bookmarks"
        },
        "social": {
            title: "Social Media",
            color: "rgb(236, 72, 153)", // pink
            description: "Traffic from social platforms"
        },
        "referral": {
            title: "Referrals",
            color: "rgb(245, 158, 11)", // amber
            description: "Links from other websites"
        },
        "email": {
            title: "Email",
            color: "rgb(16, 185, 129)", // emerald
            description: "Clicks from email campaigns"
        },
        "other": {
            title: "Other",
            color: "rgb(75, 85, 99)", // gray
            description: "Other traffic sources"
        }
    };
    
    // Prepare chart data
    const chartData = {
        labels: sources.map(source => 
            sourceCategories[source.referer as keyof typeof sourceCategories]?.title || source.referer
        ),
        datasets: [
            {
                data: sources.map(source => source.percent),
                backgroundColor: sources.map(source => 
                    sourceCategories[source.referer as keyof typeof sourceCategories]?.color || "rgb(75, 85, 99)"
                ),
                borderColor: isDark ? '#1f2937' : 'white',
                borderWidth: 2,
                hoverOffset: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#1f2937' : 'white',
                titleColor: isDark ? 'white' : '#111827',
                bodyColor: isDark ? '#d1d5db' : '#4b5563',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        },
    };
    
    // Campaign performance data (placeholder)
    const campaigns = [
        {
            name: "Summer Sale 2025",
            source: "email",
            visits: 845,
            conversions: 56,
            change: 8.3
        },
        {
            name: "Product Launch",
            source: "social",
            visits: 1245,
            conversions: 87,
            change: 12.7
        },
        {
            name: "Black Friday",
            source: "organic",
            visits: 2185,
            conversions: 156,
            change: -3.2
        },
        {
            name: "Partner Referral",
            source: "referral",
            visits: 685,
            conversions: 42,
            change: 6.4
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-1 rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold mb-6">Traffic Distribution</h3>
                
                <div className="h-[300px] relative">
                    <Doughnut data={chartData} options={chartOptions as any} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-semibold">{sources.reduce((sum, source) => sum + source.count, 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total visits</p>
                    </div>
                </div>
                
                <div className="mt-6 space-y-3">
                    {sources.map((source, i) => {
                        const category = sourceCategories[source.referer as keyof typeof sourceCategories];
                        return (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ 
                                        backgroundColor: category?.color || "rgb(75, 85, 99)" 
                                    }}></div>
                                    <span className="text-sm">{category?.title || source.referer}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">{source.count.toLocaleString()}</span>
                                    <span className="text-sm font-medium">{source.percent}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Campaign Performance */}
            <div className="lg:col-span-2 rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Campaign Performance</h3>
                    <button className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh</span>
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Campaign</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Source</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Visits</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Conversions</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Conv. Rate</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign, i) => {
                                const category = sourceCategories[campaign.source as keyof typeof sourceCategories];
                                const convRate = ((campaign.conversions / campaign.visits) * 100).toFixed(1);
                                
                                return (
                                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="px-3 py-3">
                                            <div className="font-medium text-sm">{campaign.name}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ 
                                                    backgroundColor: `${category?.color}20` 
                                                }}>
                                                    <Globe className="h-3.5 w-3.5" style={{ 
                                                        color: category?.color 
                                                    }} />
                                                </div>
                                                <span className="text-sm">{category?.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-right text-sm">{campaign.visits.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-sm">{campaign.conversions}</td>
                                        <td className="px-3 py-3 text-right text-sm">{convRate}%</td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex items-center justify-end">
                                                {campaign.change > 0 ? (
                                                    <div className="flex items-center text-emerald-500">
                                                        <ArrowUp className="h-3.5 w-3.5 mr-1" />
                                                        <span className="text-sm">{campaign.change}%</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-rose-500">
                                                        <ArrowDown className="h-3.5 w-3.5 mr-1" />
                                                        <span className="text-sm">{Math.abs(campaign.change)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(sourceCategories).slice(0, 4).map(([key, source], i) => (
                        <div key={i} className="rounded-lg bg-accent/40 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ 
                                    backgroundColor: `${source.color}20` 
                                }}>
                                    <Globe className="h-4 w-4" style={{ color: source.color }} />
                                </div>
                                <h4 className="font-medium text-sm">{source.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{source.description}</p>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full" 
                                    style={{ 
                                        backgroundColor: source.color,
                                        width: `${sources.find(s => s.referer === key)?.percent || 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}