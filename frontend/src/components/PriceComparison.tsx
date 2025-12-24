import { Badge } from "./ui/badge";
import { ShoppingCart, TrendingDown } from "lucide-react";

interface PriceData {
  platform: string;
  price: number;
  available: boolean;
}

interface PriceComparisonProps {
  prices: PriceData[];
}

const PriceComparison = ({ prices }: PriceComparisonProps) => {
  const availablePrices = prices.filter(p => p.available);
  const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices.map(p => p.price)) : 0;
  const highestPrice = availablePrices.length > 0 ? Math.max(...availablePrices.map(p => p.price)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">Price Comparison Across Platforms</h3>
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-green-500">Save up to ₹{(highestPrice - lowestPrice).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid gap-3">
        {prices.map((item) => (
          <div
            key={item.platform}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              item.available && item.price === lowestPrice
                ? "bg-green-50/50 border-green-500 shadow-md"
                : "bg-card border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className={`h-5 w-5 ${item.available && item.price === lowestPrice ? "text-green-600" : "text-muted-foreground"}`} />
              <span className={`font-medium text-base ${item.available && item.price === lowestPrice ? "text-green-700" : "text-foreground"}`}>
                {item.platform}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {item.available ? (
                <>
                  <span className={`text-xl font-bold ${item.price === lowestPrice ? "text-green-600" : "text-foreground"}`}>
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.price === lowestPrice && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                      ✓ Lowest Price
                    </Badge>
                  )}
                  {item.price === highestPrice && item.price !== lowestPrice && (
                    <Badge variant="outline" className="px-3 py-1">
                      Highest
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {availablePrices.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">💡 Tip:</span> Buy from <span className="font-semibold text-green-600">{prices.find(p => p.price === lowestPrice)?.platform}</span> to save the most! Compare delivery and return policies before purchasing.
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceComparison;
