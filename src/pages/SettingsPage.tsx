import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Plus, X, Crown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AVAILABLE_BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank"];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { bankPreferences, setBankPreferences } = useAppStore();
  const { user, signOut } = useAuth();
  const [newBank, setNewBank] = useState("");

  const addBank = (bank: string) => {
    if (!bankPreferences.includes(bank)) {
      setBankPreferences([...bankPreferences, bank]);
      toast.success(`${bank} added`);
    }
    setNewBank("");
  };

  const removeBank = (bank: string) => {
    setBankPreferences(bankPreferences.filter((b) => b !== bank));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/50 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h1 className="font-display text-sm font-bold text-foreground tracking-wider">SETTINGS</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
        {/* Account */}
        <section className="glass-panel p-4 space-y-3">
          <h2 className="font-display text-xs tracking-wider text-muted-foreground">ACCOUNT</h2>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
                  <Crown className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-display text-primary">FREE</span>
                </div>
              </div>
              <Button variant="glass" size="sm" onClick={handleSignOut}>
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sign in to save snipers and preferences</p>
              <Button variant="neon" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          )}
        </section>

        {/* Bank Preferences */}
        <section className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-display text-xs tracking-wider text-muted-foreground">BANK DISCOUNTS</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Select your banks to see "True Price" with card discounts applied.
          </p>

          {/* Current banks */}
          <div className="flex flex-wrap gap-2">
            {bankPreferences.map((bank) => (
              <motion.div
                key={bank}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30"
              >
                <span className="text-xs font-medium text-primary">{bank}</span>
                <button onClick={() => removeBank(bank)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add bank */}
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_BANKS.filter((b) => !bankPreferences.includes(b)).map((bank) => (
              <button
                key={bank}
                onClick={() => addBank(bank)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border border-border hover:border-primary/30 transition-colors text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3 h-3" />
                {bank}
              </button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="glass-panel p-4 space-y-2">
          <h2 className="font-display text-xs tracking-wider text-muted-foreground">ABOUT</h2>
          <p className="text-xs text-muted-foreground">
            NexScan Pro v1.0 — Shopping Intelligence Engine.
            Scan barcodes, compare prices across retailers, set price snipers, and save with bank discounts.
          </p>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
