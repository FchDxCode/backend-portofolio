import { Clock } from "lucide-react";

interface ActivityLogProps {
  className?: string;
}

export default function ActivityLog({ className }: ActivityLogProps) {
  // Sample activity data
  const activities = [
    {
      action: 'New order received',
      time: '5 minutes ago',
      details: 'Order #45678 from Sarah M.',
      type: 'order'
    },
    {
      action: 'Payment processed',
      time: '2 hours ago',
      details: 'For order #45675 - $199.99',
      type: 'payment'
    },
    {
      action: 'New customer registered',
      time: '3 hours ago',
      details: 'Alex Johnson - alex@example.com',
      type: 'customer'
    },
    {
      action: 'Product inventory updated',
      time: '5 hours ago',
      details: '5 items restocked',
      type: 'inventory'
    },
    {
      action: 'Return requested',
      time: 'Yesterday',
      details: 'Order #45668 - David W.',
      type: 'return'
    }
  ];

  // Activity type styling
  const activityStyles = {
    order: 'border-blue-500 bg-blue-500/10',
    payment: 'border-emerald-500 bg-emerald-500/10',
    customer: 'border-purple-500 bg-purple-500/10',
    inventory: 'border-amber-500 bg-amber-500/10',
    return: 'border-rose-500 bg-rose-500/10',
  };

  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Recent Activity</h3>
          <p className="text-muted-foreground text-sm">Latest actions and updates</p>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-1 bottom-1 w-px bg-border"></div>
        
        {/* Activity items */}
        <div className="space-y-5">
          {activities.map((activity, i) => (
            <div key={i} className="flex gap-4 ml-2">
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${activityStyles[activity.type as keyof typeof activityStyles]}`}></div>
              <div>
                <h4 className="text-sm font-medium">{activity.action}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <button className="w-full py-2 text-sm text-center text-primary font-medium hover:underline">
          View all activity
        </button>
      </div>
    </div>
  );
}