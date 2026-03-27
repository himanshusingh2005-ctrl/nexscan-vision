import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, ShoppingBag, Smartphone, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useAppStore();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const byRetailer = cart.reduce((acc, item) => {
    if (!acc[item.retailer]) acc[item.retailer] = [];
    acc[item.retailer].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const handlePayment = () => {
    toast.success("Payment initiated via UPI!", { description: `Total: ₹${Math.round(total * 100) / 100}` });
    clearCart();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/50 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="font-display text-sm font-bold text-foreground tracking-wider">UNIFIED CART</h1>
          <p className="text-[10px] text-muted-foreground font-body">
            {Object.keys(byRetailer).length} store{Object.keys(byRetailer).length !== 1 ? "s" : ""} · {cart.length} item{cart.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-40 space-y-4">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground"
          >
            <ShoppingBag className="w-14 h-14 opacity-20" />
            <p className="font-display text-sm tracking-wider">Cart is empty</p>
            <p className="text-xs text-center max-w-xs">Scan a product and add items from the price comparison to start.</p>
            <Button variant="glass" onClick={() => navigate("/")}>
              Scan Products
            </Button>
          </motion.div>
        ) : (
          Object.entries(byRetailer).map(([retailer, items], groupIndex) => (
            <motion.div
              key={retailer}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="space-y-2"
            >
              {/* Store header */}
              <div className="flex items-center gap-2 px-1">
                <Store className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-[10px] tracking-wider text-primary">{retailer.toUpperCase()}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Items */}
              {items.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: groupIndex * 0.1 + i * 0.04 }}
                  className="glass-panel p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.product.brand} · Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <p className="font-display text-sm text-primary whitespace-nowrap">₹{item.price}</p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))
        )}
      </main>

      {/* Checkout footer */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-14 inset-x-0 p-4 border-t border-border bg-card/95 backdrop-blur-xl z-30"
          >
            <div className="max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Total</span>
                  <p className="font-display text-lg text-foreground">₹{Math.round(total * 100) / 100}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">
                    Across {Object.keys(byRetailer).length} store{Object.keys(byRetailer).length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <Button variant="neon" className="w-full" onClick={handlePayment}>
                <Smartphone className="w-4 h-4" />
                Pay with UPI — ₹{Math.round(total * 100) / 100}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
