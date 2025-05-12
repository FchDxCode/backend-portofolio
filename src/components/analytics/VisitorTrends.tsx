"use client";

import { Line } from 'react-chartjs-2';
import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { useTheme } from 'next-themes';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    Filler 
} from 'chart.js';
import { useState } from 'react';
import { CardLoader } from '@/src/components/ui/Loader';

// Register Chart.js components
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    Filler
);

interface VisitorTrendsProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function VisitorTrends({ analytics, className = "" }: VisitorTrendsProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [chartType, setChartType] = useState<'visitors' | 'pageViews'>('visitors');
    
    if (analytics.loading) {
        return <div className={`rounded-xl border bg-card p-6 ${className}`}><CardLoader /></div>;
    }
    
    // Process analytics data for chart display
    const processChartData = () => {
        // If no data, return empty arrays
        if (!analytics.visitorStats || analytics.visitorStats.length === 0) {
            return {
                labels: [],
                visitorData: [],
                pageViewData: []
            };
        }
        
        // Sort data by date
        const sortedStats = [...analytics.visitorStats].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Format dates for labels
        const labels = sortedStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        // Extract visitor and page view data
        const visitorData = sortedStats.map(stat => stat.uniqueVisitors || 0);
        const pageViewData = sortedStats.map(stat => stat.totalVisits || 0);
        
        return { labels, visitorData, pageViewData };
    };
    
    const { labels, visitorData, pageViewData } = processChartData();
    
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: chartType === 'visitors' ? 'Unique Visitors' : 'Page Views',
                data: chartType === 'visitors' ? visitorData : pageViewData,
                borderColor: chartType === 'visitors' ? 'rgb(59, 130, 246)' : 'rgb(124, 58, 237)',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    if (chartType === 'visitors') {
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    } else {
                        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
                        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
                    }
                    return gradient;
                },
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'white',
                pointBorderColor: chartType === 'visitors' ? 'rgb(59, 130, 246)' : 'rgb(124, 58, 237)',
                pointBorderWidth: 2,
            }
        ]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
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
                bodyFont: {
                    family: 'Inter, system-ui, sans-serif',
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                    }
                },
                border: {
                    dash: [4, 4]
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: 7,
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 4
            }
        }
    };
    
    // Calculate summary statistics
    const calculateSummary = () => {
        const data = chartType === 'visitors' ? visitorData : pageViewData;
        if (data.length === 0) {
            return { total: 0, avg: 0, max: 0, min: 0 };
        }
        return {
            total: data.reduce((a, b) => a + b, 0),
            avg: Math.round(data.reduce((a, b) => a + b, 0) / data.length),
            max: Math.max(...data),
            min: Math.min(...data)
        };
    };
    
    const summary = calculateSummary();

    return (
        <div className={`rounded-xl border bg-card p-6 ${className}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-semibold text-lg">Visitor Trends</h3>
                    <p className="text-muted-foreground text-sm">Daily visitor and pageview patterns</p>
                </div>
                
                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                            chartType === 'visitors' 
                                ? 'bg-card text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setChartType('visitors')}
                    >
                        Visitors
                    </button>
                    <button
                        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                            chartType === 'pageViews' 
                                ? 'bg-card text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setChartType('pageViews')}
                    >
                        Page Views
                    </button>
                </div>
            </div>
            
            <div className="h-[350px] mb-6">
                <Line data={chartData} options={chartOptions as any} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-3 border-t">
                <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold mt-1">{summary.total.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-semibold mt-1">{summary.avg.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-2xl font-semibold mt-1">{summary.max.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="text-2xl font-semibold mt-1">{summary.min.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}