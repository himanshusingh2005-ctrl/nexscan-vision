import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Clock, Package } from "lucide-react";
import Scanner from "@/components/Scanner";
import ProductDrawer from "@/components/ProductDrawer";
import type { Product } from "@/types/database";

const ScannerPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<Product[]>([]);

  const handleProductFound = (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
    setRecentScans((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <img 
              src="/logo.png" 
              alt="Nex Scan Logo" 
              className="h-8 w-auto object-contain"
              onError={(e) => {
                // Fallback to the original Scan icon if logo.png is missing
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
                <Scan className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-sm font-bold text-foreground tracking-wider">NEXSCAN PRO</h1>
                <p className="text-[10px] text-muted-foreground font-body">Shopping Intelligence Engine</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Scanner + Recent */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg px-4 pt-4"
        >
          <Scanner onProductFound={handleProductFound} />
        </motion.div>

        {/* Recent Scans */}
        <AnimatePresence>
          {recentScans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg px-4 mt-6 mb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="font-display text-[10px] tracking-wider text-muted-foreground">RECENT SCANS</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {recentScans.map((product, i) => (
                  <motion.button
                    key={product.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setDrawerOpen(true);
                    }}
                    className="flex-shrink-0 glass-panel p-3 min-w-[120px] text-left hover:border-primary/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{product.brand}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips (shown when no recent scans) */}
        {recentScans.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-lg px-4 mt-6"
          >
            <div className="glass-panel p-4 space-y-3">
              <h3 className="font-display text-[10px] tracking-wider text-muted-foreground">HOW IT WORKS</h3>
              <div className="space-y-2">
                {[
                  { step: "1", text: "Scan any product barcode or tap Demo Scan" },
                  { step: "2", text: "Compare prices across Amazon, Flipkart & more" },
                  { step: "3", text: "Set price snipers to track drops" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-display text-primary">{step}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Product Drawer */}
      <ProductDrawer
        product={selectedProduct}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default ScannerPage;
