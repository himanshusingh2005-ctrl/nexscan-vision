import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/types/database";

interface SniperModalProps {
  product: Product;
  currentPrice: number;
  open: boolean;
  onClose: () => void;
}

const SniperModal = ({ product, currentPrice, open, onClose }: SniperModalProps) => {
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.85).toString());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }

    setSaving(true);

    if (user) {
      const { error } = await (supabase as any)
        .from("snipers")
        .upsert(
          { user_id: user.id, product_id: product.id, target_price: price, notification_sent: false },
          { onConflict: "user_id,product_id" }
        );

      if (error) {
        toast.error("Failed to save sniper");
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    toast.success(`Sniper set for ₹${price} on ${product.name}`);
    setTimeout(() => {
      setSaved(false);
      setSaving(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Set Price Sniper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="glass-panel p-3">
            <p className="text-sm text-foreground font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <p className="text-sm text-primary font-display mt-1">Current best: ₹{currentPrice}</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-display tracking-wider mb-1 block">
              TARGET PRICE (₹)
            </label>
            <Input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-secondary border-border text-foreground font-display"
            />
          </div>

          {!user && (
            <p className="text-[10px] text-muted-foreground">
              Sign in to persist snipers across sessions
            </p>
          )}

          {saved ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 py-3"
              style={{ color: "hsl(150 100% 50%)" }}
            >
              <Check className="w-5 h-5" />
              <span className="font-display text-sm">Sniper Activated!</span>
            </motion.div>
          ) : (
            <Button variant="neon" className="w-full" onClick={handleSave} disabled={saving}>
              <Target className="w-4 h-4" />
              {saving ? "Saving..." : "Activate Sniper"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SniperModal;
