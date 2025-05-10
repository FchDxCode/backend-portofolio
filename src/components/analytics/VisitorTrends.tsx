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
    
    // Prepare chart data - using visitorStats from the hook
    // This is placeholder data, in a real implementation we would use
    // analytics.visitorStats and format it appropriately
    const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 30 + i + 1);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Generate some realistic-looking data
    const generateData = (mean: number, variance: number, upwardTrend: number = 0) => {
        return Array.from({ length: 30 }, (_, i) => {
            // Weekend dips
            const weekendFactor = (i + 1) % 7 === 0 || (i + 2) % 7 === 0 ? 0.7 : 1;
            
            // Random variation
            const random = Math.random() * variance * 2 - variance;
            
            // Upward trend
            const trend = (i / 30) * upwardTrend;
            
            return Math.max(0, Math.round((mean + random + trend) * weekendFactor));
        });
    };
    
    const visitorData = generateData(850, 150, 300);
    const pageViewData = generateData(2400, 400, 700);
    
    const chartData = {
        labels: dates,
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