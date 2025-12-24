import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getProducts } from "@/productAPI";

const ProductInput = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to track",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await getProducts(url);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Found: ${result.title}`,
        });
        
        // Navigate to dashboard with product data
        navigate("/dashboard", { state: { scrapedProduct: result } });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste product URL from Amazon, Flipkart, or Snapdeal..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12 text-base"
            disabled={loading}
          />
        </div>
        <Button 
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 px-8 bg-gradient-hero hover:opacity-90 transition-opacity"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          {loading ? "Searching..." : "Track Product"}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-3 text-center">
        Track prices across multiple platforms and get notified of the best deals
      </p>
    </form>
  );
};

export default ProductInput;
