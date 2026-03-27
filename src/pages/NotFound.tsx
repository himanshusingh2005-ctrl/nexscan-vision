import { motion } from "framer-motion";
import { Scan, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <img 
          src="/logo.png" 
          alt="Nex Scan Logo" 
          className="h-16 w-auto object-contain mb-2"
          onError={(e) => {
            // Fallback to the original Scan icon if logo.png is missing
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="hidden flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground tracking-wider">404</h1>
            <p className="text-sm text-muted-foreground mt-2 font-body">Page not found</p>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-wider">404</h1>
          <p className="text-sm text-muted-foreground mt-2 font-body">Page not found</p>
        </div>
        <Button variant="glass" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Scanner
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
