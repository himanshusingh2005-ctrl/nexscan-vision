import { supabase } from "@/integrations/supabase/client";
import type { Product, PriceHistory } from "@/types/database";

const MOCK_RETAILERS = [
  { name: "Amazon", baseMultiplier: 1.0 },
  { name: "Flipkart", baseMultiplier: 0.95 },
  { name: "BigBasket", baseMultiplier: 1.05 },
  { name: "JioMart", baseMultiplier: 0.98 },
];

const MOCK_PRODUCTS: Record<string, { name: string; brand: string; category: string; basePrice: number }> = {
  "8901030865558": { name: "Tata Salt", brand: "Tata", category: "Grocery", basePrice: 28 },
  "8901058851427": { name: "Maggi 2-Minute Noodles", brand: "Nestlé", category: "Instant Food", basePrice: 14 },
  "8901063092105": { name: "Amul Butter 500g", brand: "Amul", category: "Dairy", basePrice: 270 },
  "8906002370535": { name: "Himalaya Face Wash", brand: "Himalaya", category: "Personal Care", basePrice: 175 },
  "5000159484657": { name: "Dove Soap 100g", brand: "Dove", category: "Personal Care", basePrice: 55 },
};

function generatePriceHistory(basePrice: number, months: number = 12): { price: number; date: string; retailer: string }[] {
  const history: { price: number; date: string; retailer: string }[] = [];
  const now = new Date();

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString();

    for (const retailer of MOCK_RETAILERS) {
      const variance = (Math.random() - 0.5) * 0.15;
      const seasonalFactor = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.05;
      const price = Math.round(basePrice * retailer.baseMultiplier * seasonalFactor * (1 + variance) * 100) / 100;
      history.push({ price, date: dateStr, retailer: retailer.name });
    }
  }
  return history;
}

export async function lookupProduct(upcCode: string): Promise<Product | null> {
  const { data } = await (supabase as any)
    .from("products")
    .select("*")
    .eq("upc_code", upcCode)
    .maybeSingle();

  if (data) return data as Product;

  const mockData = MOCK_PRODUCTS[upcCode];
  if (!mockData) return null;

  const { data: newProduct, error } = await (supabase as any)
    .from("products")
    .insert({
      name: mockData.name,
      brand: mockData.brand,
      category: mockData.category,
      upc_code: upcCode,
    })
    .select()
    .single();

  if (error || !newProduct) return null;

  const history = generatePriceHistory(mockData.basePrice);
  const priceRows = history.map((h) => ({
    product_id: newProduct.id,
    price: h.price,
    retailer_name: h.retailer,
    recorded_at: h.date,
  }));

  await (supabase as any).from("price_history").insert(priceRows);

  return newProduct as Product;
}

export async function fetchPriceHistory(productId: string): Promise<PriceHistory[]> {
  const { data } = await (supabase as any)
    .from("price_history")
    .select("*")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: true });

  return (data as PriceHistory[]) || [];
}

export async function fetchLatestPrices(productId: string): Promise<{ retailer: string; price: number; source_url: string | null }[]> {
  const { data } = await (supabase as any)
    .from("price_history")
    .select("*")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: false });

  if (!data) return [];

  const latest = new Map<string, { retailer: string; price: number; source_url: string | null }>();
  for (const row of data as PriceHistory[]) {
    if (!latest.has(row.retailer_name)) {
      latest.set(row.retailer_name, { retailer: row.retailer_name, price: row.price, source_url: row.source_url });
    }
  }
  return Array.from(latest.values());
}

export function applyBankDiscount(price: number, bankPreferences: string[]): { truePrice: number; discount: number; bank: string } | null {
  const discounts: Record<string, number> = {
    HDFC: 0.10,
    ICICI: 0.08,
    SBI: 0.05,
    Axis: 0.07,
  };

  let bestDiscount = { truePrice: price, discount: 0, bank: "" };

  for (const bank of bankPreferences) {
    const rate = discounts[bank];
    if (rate) {
      const truePrice = Math.round(price * (1 - rate) * 100) / 100;
      if (truePrice < bestDiscount.truePrice) {
        bestDiscount = { truePrice, discount: rate * 100, bank };
      }
    }
  }

  return bestDiscount.bank ? bestDiscount : null;
}

export async function createDemoProduct(): Promise<Product | null> {
  const codes = Object.keys(MOCK_PRODUCTS);
  const randomCode = codes[Math.floor(Math.random() * codes.length)];
  return lookupProduct(randomCode);
}
