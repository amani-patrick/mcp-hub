import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        No route matches <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code>
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Overview
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/docs/getting-started">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Getting Started
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
