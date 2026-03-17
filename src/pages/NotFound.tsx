import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 bg-gradient-glass backdrop-blur-sm border-border/50">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Oops! Page not found</p>
          <Button asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
