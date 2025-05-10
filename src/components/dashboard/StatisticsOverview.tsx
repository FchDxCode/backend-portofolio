import { TrendingDown, TrendingUp, Users, Package, CreditCard, DollarSign } from "lucide-react";

export default function StatisticsOverview() {
  const stats = [
    { 
      title: "Total Revenue", 
      value: "$89,456", 
      change: "+20.1%", 
      trend: "up",
      icon: <DollarSign className="h-5 w-5" />,
      color: "from-emerald-500/20 to-emerald-500/10",
      iconColor: "bg-emerald-500"
    },
    { 
      title: "New Customers", 
      value: "2,420", 
      change: "+12.5%", 
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "from-blue-500/20 to-blue-500/10",
      iconColor: "bg-blue-500"
    },
    { 
      title: "Total Orders", 
      value: "1,840", 
      change: "+8.2%", 
      trend: "up",
      icon: <Package className="h-5 w-5" />,
      color: "from-purple-500/20 to-purple-500/10",
      iconColor: "bg-purple-500"
    },
    { 
      title: "Refunds", 
      value: "$4,325", 
      change: "-3.1%", 
      trend: "down",
      icon: <CreditCard className="h-5 w-5" />,
      color: "from-amber-500/20 to-amber-500/10",
      iconColor: "bg-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground font-medium text-sm">{stat.title}</h3>
              <div className={`rounded-full h-9 w-9 flex items-center justify-center ${stat.iconColor} text-white`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="flex items-center gap-1">
                {stat.trend === "up" ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500 text-sm font-medium">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-500 text-sm font-medium">{stat.change}</span>
                  </>
                )}
                <span className="text-muted-foreground text-xs">vs previous period</span>
              </div>
            </div>
          </div>
          <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
        </div>
      ))}
    </div>
  );
}