import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Zap, AlertCircle, Sparkles, Upload, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupProduct, createDemoProduct } from "@/lib/market-api";
import type { Product } from "@/types/database";
import { toast } from "sonner";

interface ScannerProps {
  onProductFound: (product: Product) => void;
}

const Scanner = ({ onProductFound }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchPulse, setMatchPulse] = useState(false);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (searching) return;
      setSearching(true);
      setError(null);

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
          setError(`Barcode ${decodedText} not found. Try searching by image?`);
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
        { 
          fps: 20, 
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.777778 // 16:9
        },
        (decodedText) => {
          // Successfully scanned a barcode
          handleScan(decodedText);
          // Optional: stop scanning after first success
          // stopScanner(); 
        },
        () => {} // Ignore frame-by-frame errors
      );
      setScanning(true);
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError("Camera access denied or error. Try uploading an image.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSearching(true);
    setError(null);
    toast.info("Analyzing image...");

    try {
      // 1. Try to find a barcode in the image first
      const html5QrCode = new Html5Qrcode("scanner-region");
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        toast.success("Barcode detected!");
        handleScan(decodedText);
      } catch (barcodeErr) {
        // 2. If no barcode, fallback to image-based product recognition (Mocked)
        console.log("No barcode found in image, trying image recognition...", barcodeErr);
        
        // Simulating image recognition delay
        setTimeout(async () => {
          // For demo/hackathon purposes, if it's an image upload without a clear barcode, 
          // we'll "recognize" it as a random product to show the feature.
          // In a real app, you'd send the file to an AI service like Google Vision or OpenAI.
          const product = await createDemoProduct();
          if (product) {
            toast.success("Product recognized from image!");
            setMatchPulse(true);
            setTimeout(() => {
              setMatchPulse(false);
              onProductFound(product);
              setSearching(false);
            }, 1200);
          } else {
            setError("Could not recognize product from image. Try a clearer photo.");
            setSearching(false);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Image analysis error:", err);
      setError("Failed to analyze image.");
      setSearching(false);
    }
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
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

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
      <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden bg-secondary/50 border border-border/50 shadow-2xl">
        <div id="scanner-region" className="w-full h-full" />

        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan"
            >
              <Camera className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-foreground font-medium text-sm">Scanner Ready</p>
              <p className="text-muted-foreground text-xs px-8">Point at a barcode or upload a photo of the item</p>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="neon" onClick={startScanner} disabled={searching}>
                <Zap className="w-3.5 h-3.5" />
                Open Camera
              </Button>
              <Button size="sm" variant="glass" onClick={() => fileInputRef.current?.click()} disabled={searching}>
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
            </div>
          </div>
        )}

        {/* Scan line overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="scan-line absolute inset-0" />
            <div className="absolute inset-0 border-[20px] border-black/40" />
            <div className="absolute inset-[20px] border-2 border-primary/40 rounded-sm">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>
          </div>
        )}

        {searching && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full mb-4"
            />
            <p className="text-primary font-display text-sm tracking-widest animate-pulse">
              ANALYZING...
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col w-full max-w-md gap-3 mt-6 px-2">
        {scanning && (
          <div className="flex gap-2 w-full">
            <Button variant="glass" className="flex-1" onClick={stopScanner}>
              Stop Scanner
            </Button>
            <Button variant="glass" className="w-12 p-0" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 w-full">
          <Button variant="glass" className="flex-1 text-xs" onClick={handleDemoScan} disabled={searching}>
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {searching ? "Searching..." : "Try Demo Item"}
          </Button>
          <Button variant="outline" className="flex-1 text-xs border-primary/20 hover:bg-primary/5" onClick={() => toast.info("Search feature coming soon!")}>
            <Search className="w-3.5 h-3.5 mr-1" />
            Manual Search
          </Button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 mx-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive text-xs"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold uppercase tracking-wider">Detection Failed</p>
              <p className="opacity-80">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scanner;
