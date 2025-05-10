import StatisticsOverview from "@/src/components/dashboard/StatisticsOverview";
import SalesChart from "@/src/components/dashboard/SalesChart";
import RecentTransactions from "@/src/components/dashboard/RecentTransaction";
import VisitorAnalytics from "@/src/components/dashboard/VisitorAnalytics";
import PopularProducts from "@/src/components/dashboard/PopularProduct";
import ActivityLog from "@/src/components/dashboard/ActivityLog";
import WelcomeCard from "@/src/components/dashboard/WelcomeCard";

export default async function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your admin overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last quarter</option>
            <option>This year</option>
          </select>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
            Download Report
          </button>
        </div>
      </div>
      
      {/* Welcome card and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WelcomeCard className="lg:col-span-1" />
        <div className="lg:col-span-2">
          <StatisticsOverview />
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart className="lg:col-span-2" />
        <VisitorAnalytics className="lg:col-span-1" />
      </div>
      
      {/* Products & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions className="lg:col-span-2" />
        <div className="flex flex-col gap-6 lg:col-span-1">
          <PopularProducts />
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}