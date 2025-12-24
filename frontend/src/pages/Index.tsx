import Header from "@/components/Header";
import ProductInput from "@/components/ProductInput";
import { TrendingDown, Bell, BarChart3, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const features = [
    {
      icon: TrendingDown,
      title: "Smart Price Tracking",
      description: "Monitor prices across Amazon, Flipkart, and Snapdeal in real-time",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Get notified when prices drop to your desired level",
    },
    {
      icon: BarChart3,
      title: "Price History",
      description: "View detailed price trends and make informed decisions",
    },
    {
      icon: Shield,
      title: "Verified Reviews",
      description: "Access aggregated reviews from multiple platforms",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Track Prices,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Save Money
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Compare prices across multiple e-commerce platforms and never miss a deal again
              </p>
            </div>
            
            <ProductInput />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PriceTrack?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl shadow-card hover:shadow-elevated transition-all duration-300 space-y-4"
                >
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start Saving Today
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of smart shoppers who save money by tracking prices
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
