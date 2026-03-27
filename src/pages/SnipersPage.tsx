import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Trash2, Bell, BellOff, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Sniper, Product } from "@/types/database";

interface SniperWithProduct extends Sniper {
  product?: Product;
}

const SnipersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snipers, setSnipers] = useState<SniperWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadSnipers();
  }, [user]);

  const loadSnipers = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("snipers")
      .select("*, products(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        product: s.products,
      }));
      setSnipers(mapped);
    }
    setLoading(false);
  };

  const deleteSniper = async (id: string) => {
    await (supabase as any).from("snipers").delete().eq("id", id);
    setSnipers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/50 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="font-display text-sm font-bold text-foreground tracking-wider">PRICE SNIPERS</h1>
          <p className="text-[10px] text-muted-foreground font-body">
            {snipers.length} active sniper{snipers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Target className="w-12 h-12 opacity-30" />
            <p className="font-display text-sm tracking-wider">Sign in to use Snipers</p>
            <Button variant="neon" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : snipers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Target className="w-12 h-12 opacity-30" />
            <p className="font-display text-sm tracking-wider">No active snipers</p>
            <p className="text-xs text-center max-w-xs">
              Scan a product and tap "Set Sniper" to get notified when prices drop.
            </p>
            <Button variant="glass" onClick={() => navigate("/")}>
              Scan Products
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {snipers.map((sniper, i) => (
              <motion.div
                key={sniper.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {sniper.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sniper.product?.brand} · {sniper.product?.category}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSniper(sniper.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-display text-sm text-primary">₹{sniper.target_price}</span>
                    <span className="text-[10px] text-muted-foreground">target</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {sniper.notification_sent ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30">
                        <Bell className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-display text-accent">TRIGGERED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-border">
                        <BellOff className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-display text-muted-foreground">WATCHING</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default SnipersPage;
