import { MoreHorizontal } from "lucide-react";

interface PopularProductsProps {
  className?: string;
}

export default function PopularProducts({ className }: PopularProductsProps) {
  // Sample product data
  const products = [
    {
      name: 'Premium Wireless Headphones',
      category: 'Audio',
      price: 249.99,
      sales: 120,
      inStock: true,
      image: '/product1.jpg' // You'll need to replace with actual images
    },
    {
      name: 'Ultra HD Smart TV 55"',
      category: 'Electronics',
      price: 799.99,
      sales: 98,
      inStock: true,
      image: '/product2.jpg'
    },
    {
      name: 'Professional Digital Camera',
      category: 'Photography',
      price: 1299.99,
      sales: 85,
      inStock: false,
      image: '/product3.jpg'
    },
    {
      name: 'Fitness Smart Watch',
      category: 'Wearables',
      price: 199.99,
      sales: 75,
      inStock: true,
      image: '/product4.jpg'
    }
  ];

  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Popular Products</h3>
          <p className="text-muted-foreground text-sm">Best selling items</p>
        </div>
        <div>
          <button className="p-1 rounded-md hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {products.map((product, i) => (
          <div key={i} className="flex items-center gap-3 pb-4 last:pb-0 last:mb-0 border-b last:border-0">
            {/* Product Image Placeholder */}
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${
                i % 4 === 0 ? 'from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20' :
                i % 4 === 1 ? 'from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20' :
                i % 4 === 2 ? 'from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20' :
                'from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20'
              }`}>
                <div className="h-full w-full flex items-center justify-center text-lg font-medium">
                  {product.name.charAt(0)}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{product.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{product.category}</span>
                <span className="text-sm font-medium">${product.price}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{product.sales} sold</span>
                <span className={`text-xs ${product.inStock ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full py-2 text-sm text-center text-primary font-medium hover:underline">
          View all products
        </button>
      </div>
    </div>
  );
}