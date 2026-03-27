import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Scan, ShoppingCart, Target, Settings } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const navItems = [
  { path: "/", icon: Scan, label: "Scan" },
  { path: "/cart", icon: ShoppingCart, label: "Cart" },
  { path: "/snipers", icon: Target, label: "Snipers" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useAppStore();

  // Hide on auth page
  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-3 right-3 h-0.5 bg-primary rounded-full glow-cyan"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {path === "/cart" && cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-display">
                    {cart.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-body transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
