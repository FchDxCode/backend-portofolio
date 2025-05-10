import { ArrowDown, ArrowUp, MoreHorizontal, Search } from "lucide-react";

interface TransactionProps {
  className?: string;
}

export default function RecentTransactions({ className }: TransactionProps) {
  // Sample transaction data
  const transactions = [
    {
      id: 'TRX-49875',
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      amount: 459.65,
      status: 'completed',
      date: '10 May 2025',
      items: 3
    },
    {
      id: 'TRX-49874',
      name: 'Sarah Miller',
      email: 'sarah.m@example.com',
      amount: 289.50,
      status: 'processing',
      date: '10 May 2025',
      items: 2
    },
    {
      id: 'TRX-49873',
      name: 'David Wilson',
      email: 'david.w@example.com',
      amount: 129.99,
      status: 'completed',
      date: '9 May 2025',
      items: 1
    },
    {
      id: 'TRX-49872',
      name: 'Maya Patel',
      email: 'maya.p@example.com',
      amount: 560.75,
      status: 'completed',
      date: '9 May 2025',
      items: 4
    },
    {
      id: 'TRX-49871',
      name: 'Chris Brown',
      email: 'chris.b@example.com',
      amount: 89.99,
      status: 'refunded',
      date: '8 May 2025',
      items: 1
    },
  ];

  // Status badge styling
  const statusStyles = {
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    refunded: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  };

  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
          <p className="text-muted-foreground text-sm">Latest order details</p>
        </div>
        <div className="flex items-center mt-3 sm:mt-0 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Search..." 
              className="w-full sm:w-[180px] h-9 rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus:border-primary focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <select className="h-9 rounded-md border bg-background px-3 py-1 text-sm">
            <option>All status</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground w-[120px]">
                <div className="flex items-center">
                  <span>Transaction</span>
                  <button className="ml-1 group">
                    <div className="flex flex-col justify-center">
                      <ArrowUp className="h-2.5 w-2.5 group-hover:text-foreground text-muted-foreground/50" />
                      <ArrowDown className="h-2.5 w-2.5 -mt-[2px] group-hover:text-foreground text-muted-foreground/50" />
                    </div>
                  </button>
                </div>
              </th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-2 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
              <th className="px-2 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground">Items</th>
              <th className="px-2 py-3 text-right text-xs font-semibold text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-2 py-3 text-sm font-medium">{transaction.id}</td>
                <td className="px-2 py-3">
                  <div>
                    <div className="font-medium text-sm">{transaction.name}</div>
                    <div className="text-xs text-muted-foreground">{transaction.email}</div>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[transaction.status as keyof typeof statusStyles]}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-sm text-muted-foreground">{transaction.date}</td>
                <td className="px-2 py-3 text-right font-medium">${transaction.amount.toFixed(2)}</td>
                <td className="px-2 py-3 text-center text-sm">{transaction.items}</td>
                <td className="px-2 py-3 text-right">
                  <button className="p-1 rounded-md hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">Showing 5 of 56 results</p>
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent">
            <span>&lsaquo;</span>
          </button>
          <button className="h-8 w-8 rounded-md border bg-primary text-primary-foreground flex items-center justify-center text-sm">1</button>
          <button className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent">2</button>
          <button className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent">3</button>
          <button className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent">
            <span>&rsaquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
}