import { useState } from "react";
import { motion } from "framer-motion";
import { Scan, Mail, Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else if (isSignUp) {
      toast.success("Check your email to confirm your account");
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Nex Scan Logo" 
            className="h-14 w-auto object-contain mb-2"
            onError={(e) => {
              // Fallback to the original Scan icon if logo.png is missing
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="hidden flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
              <Scan className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-xl font-bold text-foreground tracking-wider">NEXSCAN PRO</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">Shopping Intelligence Engine</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-panel p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-display tracking-wider">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-display tracking-wider">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-secondary border-border text-foreground"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <Button variant="neon" className="w-full" type="submit" disabled={loading}>
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Toggle */}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>

        {/* Skip */}
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Continue as guest <ArrowRight className="w-3 h-3" />
        </button>
      </motion.div>
    </div>
  );
};

export default AuthPage;
