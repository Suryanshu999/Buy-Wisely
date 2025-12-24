import { useState } from "react";
import { Star, Bell, ExternalLink, AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import PriceComparison from "./PriceComparison";
import PriceGraph from "./PriceGraph";
import ReviewCard from "./ReviewCard";

interface Product {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  prices: Array<{
    platform: string;
    price: number;
    available: boolean;
  }>;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  topReviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const currentPrice = Math.min(...product.prices.filter(p => p.available).map(p => p.price));
  const lowestPrice = Math.min(...product.priceHistory.map(p => p.price));
  const lowestPlatform = product.prices.find(p => p.price === currentPrice)?.platform;

  const handleSetAlert = () => {
    const price = parseFloat(alertPrice);
    
    if (!alertPrice.trim() || isNaN(price)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (price > currentPrice) {
      toast({
        title: "Price too high",
        description: `Alert price should be less than current price (₹${currentPrice.toLocaleString()})`,
        variant: "destructive",
      });
      return;
    }

    // Check if price alert should trigger
    if (currentPrice <= price) {
      toast({
        title: "🎉 Alert Triggered!",
        description: `Price dropped to ₹${currentPrice.toLocaleString()} - Below your alert price of ₹${price.toLocaleString()}!`,
      });
    } else {
      toast({
        title: "Price Alert Set!",
        description: `You'll be notified when price drops to ₹${price.toLocaleString()}`,
      });
    }

    setAlertPrice("");
    setShowAlert(false);
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
      <div className="p-6 space-y-6">
        {/* Product Header */}
        <div className="flex gap-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-32 h-32 object-cover rounded-lg border border-border"
          />
          
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-foreground line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price Info */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold text-accent">₹{currentPrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Lowest: ₹{lowestPrice.toLocaleString()}</p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="bg-gradient-hero"
                onClick={() => setShowAlert(!showAlert)}
              >
                <Bell className="mr-2 h-4 w-4" />
                {showAlert ? "Cancel" : "Set Price Alert"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowDetails(true)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>

            {/* Price Alert Input */}
            {showAlert && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Set your target price</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={`Enter price (less than ₹${currentPrice.toLocaleString()})`}
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="h-10"
                  />
                  <Button size="sm" onClick={handleSetAlert}>
                    Set Alert
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Comparison */}
        <PriceComparison prices={product.prices} />

        {/* Price History Graph */}
        <PriceGraph data={product.priceHistory} />

        {/* Top Reviews */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Top Reviews</h3>
          <div className="space-y-3">
            {product.topReviews.length > 0 ? (
              product.topReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-foreground pr-4">Product Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Product Image and Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-auto rounded-lg border border-border"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Price:</span>
                      <span className="font-bold text-lg text-accent">₹{currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lowest Price:</span>
                      <span className="font-bold">₹{lowestPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Platform:</span>
                      <span className="font-bold text-green-600">{lowestPlatform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You Save:</span>
                      <span className="font-bold text-green-600">₹{(Math.max(...product.prices.map(p => p.price)) - currentPrice).toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Great choice! 🎉",
                        description: `Buy from ${lowestPlatform} to get the best price!`,
                      });
                      setShowDetails(false);
                    }}
                  >
                    Buy at Best Price
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Price on Each Platform</h4>
                <div className="space-y-2">
                  {product.prices.map((price) => (
                    <div key={price.platform} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">{price.platform}</span>
                      {price.available ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{price.price.toLocaleString()}</span>
                          {price.price === currentPrice && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Best</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Out of Stock</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
