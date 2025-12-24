import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Package, Loader2 } from "lucide-react";
import { comparePrices } from "@/productAPI";

const Dashboard = () => {
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if there's a scraped product from navigation
    if (location.state?.scrapedProduct) {
      const scrapedProduct = location.state.scrapedProduct;
      
      // Extract price as a number
      const priceStr = scrapedProduct.price?.toString().replace(/[^\d.-]/g, '') || "0";
      const price = parseFloat(priceStr) || 0;

      // Generate mock prices for other platforms (for demo purposes)
      // In a real app, you would scrape actual prices from those platforms
      const mockPrices = [
        {
          platform: scrapedProduct.website || "Platform",
          price: price,
          available: price > 0,
        },
      ];

      // Add mock prices for other platforms
      if (scrapedProduct.website?.toLowerCase() === "amazon") {
        mockPrices.push({
          platform: "Flipkart",
          price: Math.round(price * 1.05),
          available: true,
        });
        mockPrices.push({
          platform: "Snapdeal",
          price: Math.round(price * 1.08),
          available: true,
        });
      } else if (scrapedProduct.website?.toLowerCase() === "flipkart") {
        mockPrices.push({
          platform: "Amazon",
          price: Math.round(price * 1.03),
          available: true,
        });
        mockPrices.push({
          platform: "Snapdeal",
          price: Math.round(price * 1.06),
          available: true,
        });
      } else if (scrapedProduct.website?.toLowerCase() === "snapdeal") {
        mockPrices.push({
          platform: "Amazon",
          price: Math.round(price * 0.98),
          available: true,
        });
        mockPrices.push({
          platform: "Flipkart",
          price: Math.round(price * 1.02),
          available: true,
        });
      }

      // Generate historical price data
      const today = new Date();
      const priceHistory = [];
      const basePrice = Math.min(...mockPrices.map((p) => p.price));

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variance = Math.floor(Math.random() * (basePrice * 0.15)) - (basePrice * 0.08);
        const histPrice = Math.max(Math.round(basePrice + variance), Math.round(basePrice * 0.7));
        priceHistory.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: histPrice,
        });
      }

      // Format the product data for display
      const formattedProduct = {
        id: Date.now().toString(),
        name: scrapedProduct.title || "Product",
        image: scrapedProduct.image || "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        rating: 4.0,
        reviewCount: 0,
        prices: mockPrices,
        priceHistory: priceHistory,
        topReviews: [],
      };

      setProducts([formattedProduct]);
      setLoading(false);
    } else {
      // Demo data if no product was scraped
      const demoProducts = [
        {
          id: "1",
          name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB, 256GB)",
          image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
          rating: 4.5,
          reviewCount: 1247,
          prices: [
            { platform: "Amazon", price: 124999, available: true },
            { platform: "Flipkart", price: 129999, available: true },
            { platform: "Snapdeal", price: 127999, available: true },
          ],
          priceHistory: [
            { date: "Jan 1", price: 129999 },
            { date: "Jan 15", price: 127999 },
            { date: "Feb 1", price: 126999 },
            { date: "Feb 15", price: 124999 },
            { date: "Mar 1", price: 125999 },
            { date: "Mar 15", price: 124999 },
          ],
          topReviews: [
            {
              id: "1",
              author: "Rajesh Kumar",
              rating: 5,
              comment: "Excellent phone with amazing camera quality. Battery life is outstanding!",
              date: "2 days ago",
            },
            {
              id: "2",
              author: "Priya Sharma",
              rating: 4,
              comment: "Great performance and display. Delivered on time but packaging could be better.",
              date: "1 week ago",
            },
          ],
        },
      ];
      setProducts(demoProducts);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Tracked Products</h1>
          <p className="text-muted-foreground">
            Monitor prices and reviews across multiple platforms
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">Comparing prices across platforms...</span>
          </div>
        )}

        {!loading && products.length > 0 ? (
          <div className="space-y-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-20 w-20 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Products Tracked Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start tracking products to see price comparisons and reviews here
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
