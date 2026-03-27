import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Zap, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupProduct, createDemoProduct } from "@/lib/market-api";
import type { Product } from "@/types/database";

interface ScannerProps {
  onProductFound: (product: Product) => void;
}

const Scanner = ({ onProductFound }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchPulse, setMatchPulse] = useState(false);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (searching) return;
      setSearching(true);

      try {
        const product = await lookupProduct(decodedText);
        if (product) {
          setMatchPulse(true);
          setTimeout(() => {
            setMatchPulse(false);
            onProductFound(product);
            setSearching(false);
          }, 1200);
        } else {
          setError("Product not found. Try another barcode.");
          setSearching(false);
        }
      } catch {
        setError("Failed to fetch product data.");
        setSearching(false);
      }
    },
    [onProductFound, searching]
  );

  const startScanner = async () => {
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("scanner-region");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => handleScan(decodedText),
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      setError("Camera access denied. Use 'Demo Scan' to try the app.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleDemoScan = async () => {
    setSearching(true);
    setError(null);
    const product = await createDemoProduct();
    if (product) {
      setMatchPulse(true);
      setTimeout(() => {
        setMatchPulse(false);
        onProductFound(product);
        setSearching(false);
      }, 1200);
    } else {
      setError("Demo product creation failed.");
      setSearching(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Success Pulse */}
      <AnimatePresence>
        {matchPulse && (
          <motion.div
            className="absolute inset-0 z-30 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "radial-gradient(circle, hsla(150, 100%, 50%, 0.25) 0%, transparent 70%)",
              boxShadow: "inset 0 0 60px hsla(150, 100%, 50%, 0.3)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Camera feed */}
      <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden bg-secondary/50">
        <div id="scanner-region" className="w-full h-full" />

        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan"
            >
              <Camera className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground text-sm font-body">Point at a barcode to scan</p>
          </div>
        )}

        {/* Scan line overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line absolute inset-0" />
            <div className="absolute inset-4 border-2 border-primary/30 rounded-lg" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-6">
        {!scanning ? (
          <Button variant="neon" onClick={startScanner} disabled={searching}>
            <Zap className="w-4 h-4" />
            Start Scanner
          </Button>
        ) : (
          <Button variant="glass" onClick={stopScanner}>
            Stop Scanner
          </Button>
        )}
        <Button variant="glass" onClick={handleDemoScan} disabled={searching}>
          <Sparkles className="w-4 h-4" />
          {searching ? "Scanning..." : "Demo Scan"}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scanner;
