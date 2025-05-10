"use client";

import { ArrowRight, Calendar, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface WelcomeCardProps {
  className?: string;
}

export default function WelcomeCard({ className }: WelcomeCardProps) {
  const [greeting, setGreeting] = useState("Good day");
  
  // Update greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  
  return (
    <div className={`rounded-xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-6 text-white ${className}`}>
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-medium mb-1">{greeting}, Admin</h2>
          <p className="text-primary-foreground/80 text-sm mb-4">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>12 new orders to process</span>
        </div>
        <div className="flex items-center text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Revenue is up 12% from yesterday</span>
        </div>
        <div className="flex items-center text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Inventory: 5 items need reordering</span>
        </div>
      </div>
      
      <button className="mt-6 flex items-center text-sm font-medium">
        <span>View detailed summary</span>
        <ArrowRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
}