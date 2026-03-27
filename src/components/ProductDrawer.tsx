import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown, TrendingUp, ShoppingCart, Target, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { fetchPriceHistory, fetchLatestPrices, applyBankDiscount } from "@/lib/market-api";
import { useAppStore } from "@/store/app-store";
import type { Product, PriceHistory } from "@/types/database";
import SniperModal from "./SniperModal";
import { toast } from "sonner";

interface ProductDrawerProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductDrawer = ({ product, open, onClose }: ProductDrawerProps) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [latestPrices, setLatestPrices] = useState<{ retailer: string; price: number; source_url: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sniperOpen, setSniperOpen] = useState(false);
  const { addToCart, bankPreferences } = useAppStore();

  useEffect(() => {
    if (product && open) {
      setLoading(true);
      Promise.all([fetchPriceHistory(product.id), fetchLatestPrices(product.id)]).then(
        ([history, prices]) => {
          setPriceHistory(history);
          setLatestPrices(prices);
          setLoading(false);
        }
      );
    }
  }, [product, open]);

  if (!product) return null;

  const chartData = (() => {
    const byMonth = new Map<string, { total: number; count: number }>();
    for (const p of priceHistory) {
      const month = new Date(p.recorded_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const existing = byMonth.get(month) || { total: 0, count: 0 };
      byMonth.set(month, { total: existing.total + p.price, count: existing.count + 1 });
    }
    return Array.from(byMonth.entries()).map(([month, { total, count }]) => ({
      month,
      price: Math.round((total / count) * 100) / 100,
    }));
  })();

  const lowestPrice = latestPrices.length ? Math.min(...latestPrices.map((p) => p.price)) : 0;
  const allTimeLow = priceHistory.length ? Math.min(...priceHistory.map((p) => p.price)) : 0;
  const isAtLow = lowestPrice <= allTimeLow;
  const recommendation = isAtLow ? "BUY NOW" : "WAIT";

  const handleAddToCart = (retailer: string, price: number) => {
    addToCart({ product, quantity: 1, retailer, price });
    toast.success(`${product.name} added to cart`, { description: `${retailer} · ₹${price}` });
  };

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[85vh] bg-background/95 backdrop-blur-xl border-border">
          <DrawerHeader className="flex items-center justify-between pb-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="font-display text-foreground tracking-wide text-sm sm:text-base truncate">
                {product.name}
              </DrawerTitle>
              <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4 overflow-y-auto">
            {/* Recommendation Gauge */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{
                borderColor: isAtLow ? "hsl(150 100% 50% / 0.3)" : "hsl(40 100% 50% / 0.3)",
                background: isAtLow ? "hsl(150 100% 50% / 0.05)" : "hsl(40 100% 50% / 0.05)",
              }}
            >
              <div className="flex items-center gap-3">
                {isAtLow ? (
                  <TrendingDown className="w-5 h-5" style={{ color: "hsl(150 100% 60%)" }} />
                ) : (
                  <TrendingUp className="w-5 h-5" style={{ color: "hsl(40 100% 60%)" }} />
                )}
                <div>
                  <p className="font-display text-xs tracking-wider text-foreground">{recommendation}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAtLow ? "Price is at all-time low!" : "Price may drop further"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-base text-foreground">₹{lowestPrice}</p>
                <p className="text-[10px] text-muted-foreground">Best price</p>
              </div>
            </motion.div>

            {/* Price Chart */}
            <div className="glass-panel p-3">
              <h3 className="font-display text-[10px] tracking-wider text-muted-foreground mb-2">PRICE HISTORY</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(0 0% 45%)", fontSize: 9 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(0 0% 45%)", fontSize: 9 }} tickLine={false} axisLine={false} width={35} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0 0% 5%)",
                        border: "1px solid hsl(0 0% 12%)",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "11px",
                      }}
                      formatter={(value: number) => [`₹${value}`, "Avg Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(180 100% 50%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(180 100% 50%)", r: 2.5 }}
                      activeDot={{ r: 4, fill: "hsl(150 100% 50%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-muted-foreground text-xs">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  ) : "No data"}
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div className="glass-panel p-3">
              <h3 className="font-display text-[10px] tracking-wider text-muted-foreground mb-2">RETAILER COMPARISON</h3>
              <div className="space-y-1.5">
                {latestPrices.map((p, i) => {
                  const bankDeal = applyBankDiscount(p.price, bankPreferences);
                  const isLowest = p.price === lowestPrice;
                  return (
                    <motion.div
                      key={p.retailer}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-2.5 rounded-lg border transition-all"
                      style={{
                        borderColor: isLowest ? "hsl(150 100% 50% / 0.35)" : "hsl(0 0% 12%)",
                        background: isLowest ? "hsl(150 100% 50% / 0.05)" : "hsl(0 0% 8% / 0.5)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isLowest && (
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: "hsl(150 100% 50%)" }}
                          />
                        )}
                        <span className="text-xs font-medium text-foreground">{p.retailer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-display text-foreground">₹{p.price}</p>
                          {bankDeal && (
                            <p className="text-[9px]" style={{ color: "hsl(150 100% 60%)" }}>
                              ₹{bankDeal.truePrice} w/ {bankDeal.bank}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {p.source_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => window.open(p.source_url || '', '_blank')}
                              title={`Buy on ${p.retailer}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleAddToCart(p.retailer, bankDeal?.truePrice || p.price)}
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="neon" size="sm" className="flex-1 text-xs" onClick={() => {
                if (latestPrices.length) {
                  const best = latestPrices.reduce((a, b) => (a.price < b.price ? a : b));
                  handleAddToCart(best.retailer, best.price);
                }
              }}>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add Best Deal
              </Button>
              <Button variant="glass" size="sm" className="text-xs" onClick={() => setSniperOpen(true)}>
                <Target className="w-3.5 h-3.5" />
                Set Sniper
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <SniperModal
        product={product}
        currentPrice={lowestPrice}
        open={sniperOpen}
        onClose={() => setSniperOpen(false)}
      />
    </>
  );
};

export default ProductDrawer;
