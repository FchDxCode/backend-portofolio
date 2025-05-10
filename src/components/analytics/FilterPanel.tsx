"use client";

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { useVisitorAnalytics } from '@/src/hook/useVisitor';

interface FilterPanelProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function FilterPanel({ analytics, className = "" }: FilterPanelProps) {
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const dateRanges = analytics.getDateRanges();
    
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }).format(date);
    };
    
    const getCurrentRangeLabel = () => {
        const { startDate, endDate } = analytics.filters;
        
        // Check if the current filter matches any predefined ranges
        for (const [key, range] of Object.entries(dateRanges)) {
            if (range.startDate === startDate && range.endDate === endDate) {
                return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            }
        }
        
        // If not a predefined range, show custom date range
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 pb-2 border-b ${className}`}>
            {/* Date Range Selector */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{getCurrentRangeLabel()}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium px-2 py-1.5">Date Range</h4>
                        
                        {Object.entries(dateRanges).map(([key, range]) => (
                            <button
                                key={key}
                                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                                onClick={() => {
                                    analytics.setFilters({
                                        ...analytics.filters,
                                        startDate: range.startDate,
                                        endDate: range.endDate
                                    });
                                    setDatePickerOpen(false);
                                }}
                            >
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </button>
                        ))}
                        
                        <div className="border-t my-2"></div>
                        
                        <label className="block px-2 py-1 text-xs text-muted-foreground">
                            Start Date
                            <input
                                type="date"
                                value={analytics.filters.startDate}
                                onChange={(e) => {
                                    analytics.setFilters({
                                        ...analytics.filters,
                                        startDate: e.target.value
                                    });
                                }}
                                className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </label>
                        
                        <label className="block px-2 py-1 text-xs text-muted-foreground">
                            End Date
                            <input
                                type="date"
                                value={analytics.filters.endDate}
                                onChange={(e) => {
                                    analytics.setFilters({
                                        ...analytics.filters,
                                        endDate: e.target.value
                                    });
                                }}
                                className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </label>
                    </div>
                </PopoverContent>
            </Popover>
            
            {/* Group By Selector */}
            <select
                value={analytics.filters.groupBy}
                onChange={(e) => {
                    analytics.setFilters({
                        ...analytics.filters,
                        groupBy: e.target.value as 'day' | 'week' | 'month' | 'year'
                    });
                }}
                className="px-3 py-2 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <option value="day">Group by Day</option>
                <option value="week">Group by Week</option>
                <option value="month">Group by Month</option>
                <option value="year">Group by Year</option>
            </select>
            
            {/* Compare With Previous Period */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="compare-periods"
                    checked={analytics.filters.compareWithPrevious}
                    onChange={(e) => {
                        analytics.setFilters({
                            ...analytics.filters,
                            compareWithPrevious: e.target.checked
                        });
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="compare-periods" className="text-sm">
                    Compare with previous period
                </label>
            </div>
            
            {/* Limit Selector */}
            <div className="ml-auto flex items-center gap-2">
                <label className="text-sm">Results limit:</label>
                <select
                    value={analytics.filters.limit}
                    onChange={(e) => {
                        analytics.setFilters({
                            ...analytics.filters,
                            limit: Number(e.target.value)
                        });
                    }}
                    className="px-2 py-1.5 text-sm rounded-md border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    );
}