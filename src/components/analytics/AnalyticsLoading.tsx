import { Loader2 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <h3 className="text-lg font-medium">Loading analytics data...</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        This may take a few moments to gather all the metrics.
      </p>
    </div>
  );
}