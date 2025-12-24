import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg transition-transform group-hover:scale-105">
              <Search className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Price Sleuth
            </span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {location.pathname === "/" ? (
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/">
                <Button variant="outline">Home</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
